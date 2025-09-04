import {
  buildSbtcDepositAddress,
  sbtcDepositHelper,
  SbtcApiClientTestnet,
  SbtcApiClientMainnet,
  SbtcApiClientDevenv,
  MAINNET,
  TESTNET,
  DEFAULT_RECLAIM_LOCK_TIME,
  DEFAULT_MAX_SIGNER_FEE,
} from 'sbtc';
import {
  STACKS_MAINNET,
  STACKS_TESTNET,
  STACKS_DEVNET,
  type StacksNetwork,
} from '@stacks/network';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  bufferCV,
  someCV,
  noneCV,
} from '@stacks/transactions';

/**
 * Production-ready sBTC Service for Backend
 * Handles real Bitcoin deposits, sBTC minting, and transfers
 */
export class SbtcService {
  private client: SbtcApiClientTestnet | SbtcApiClientMainnet | SbtcApiClientDevenv;
  private network: StacksNetwork;
  private isMainnet: boolean;
  private isDevnet: boolean;
  private networkType: 'mainnet' | 'testnet' | 'devnet';

  constructor() {
    this.networkType = (process.env.SBTC_NETWORK as 'mainnet' | 'testnet' | 'devnet') || 'testnet';
    this.isMainnet = this.networkType === 'mainnet';
    this.isDevnet = this.networkType === 'devnet';
    
    // Initialize the appropriate client
    if (this.isMainnet) {
      this.client = new SbtcApiClientMainnet();
      this.network = STACKS_MAINNET;
    } else if (this.isDevnet) {
      this.client = new SbtcApiClientDevenv();
      this.network = STACKS_DEVNET;
    } else {
      this.client = new SbtcApiClientTestnet();
      this.network = STACKS_TESTNET;
    }
  }

  /**
   * Create real Bitcoin deposit address for sBTC conversion
   * This generates a real Bitcoin address that customers can send to
   */
  async createBitcoinDepositAddress(request: {
    stacksAddress: string;
    amountSats: number;
    reclaimPublicKey?: string;
  }): Promise<{
    success: boolean;
    depositAddress?: string;
    details?: any;
    error?: string;
  }> {
    try {
      // Validate input parameters
      if (!this.isValidStacksAddress(request.stacksAddress)) {
        return { success: false, error: 'Invalid Stacks address format' };
      }

      if (request.amountSats < 10000) {
        return { success: false, error: 'Minimum deposit amount is 10,000 satoshis (0.0001 BTC)' };
      }

      // Get current signer public key from sBTC protocol
      const signerPublicKey = await this.client.fetchSignersPublicKey();
      
      // Use defaults from environment or constants
      const maxSignerFee = DEFAULT_MAX_SIGNER_FEE;
      const reclaimLockTime = DEFAULT_RECLAIM_LOCK_TIME;
      const reclaimPublicKey = request.reclaimPublicKey || signerPublicKey;

      // Build real deposit address with embedded metadata
      const deposit = buildSbtcDepositAddress({
        network: this.isMainnet ? MAINNET : TESTNET,
        stacksAddress: request.stacksAddress,
        signersPublicKey: signerPublicKey,
        reclaimPublicKey,
        maxSignerFee,
        reclaimLockTime,
      });

      // Calculate expiration time
      const expiryMinutes = parseInt(process.env.DEFAULT_PAYMENT_EXPIRY_MINUTES || '60');
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      return {
        success: true,
        depositAddress: deposit.address,
        details: {
          depositAddress: deposit.address,
          stacksAddress: request.stacksAddress,
          depositScript: deposit.depositScript,
          reclaimScript: deposit.reclaimScript,
          signerPublicKey,
          maxSignerFee,
          reclaimLockTime,
          expiresAt,
          amountSats: request.amountSats,
          network: this.isMainnet ? 'MAINNET' : 'TESTNET',
        }
      };
    } catch (error) {
      console.error('Error creating sBTC deposit address:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create sBTC deposit address' 
      };
    }
  }

  /**
   * Monitor Bitcoin deposit for confirmation
   * This checks if Bitcoin has been sent to the deposit address
   */
  async checkDepositStatus(depositAddress: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    txid?: string;
    amount?: number;
    blockHeight?: number;
  }> {
    try {
      // Get Bitcoin network API URL
      const bitcoinApiUrl = this.isMainnet 
        ? 'https://api.mempool.space/api'
        : 'https://mempool.space/testnet/api';

      // Check for transactions to this address
      const response = await fetch(`${bitcoinApiUrl}/address/${depositAddress}/txs`);
      
      if (!response.ok) {
        return {
          status: 'pending',
          confirmations: 0
        };
      }

      const transactions = await response.json() as any[];
      
      if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
        return {
          status: 'pending',
          confirmations: 0
        };
      }

      // Find the latest incoming transaction
      const latestTx = transactions[0];
      const confirmations = latestTx.status?.confirmed ? 
        latestTx.status.block_height ? 
          await this.getCurrentBlockHeight() - latestTx.status.block_height + 1 : 0
        : 0;

      // Find output amount to our address
      let amount = 0;
      for (const output of latestTx.vout || []) {
        if (output.scriptpubkey_address === depositAddress) {
          amount += output.value;
        }
      }

      return {
        status: confirmations >= 1 ? 'confirmed' : 'pending',
        confirmations,
        txid: latestTx.txid,
        amount,
        blockHeight: latestTx.status?.block_height
      };
    } catch (error) {
      console.error('Error checking deposit status:', error);
      return {
        status: 'failed',
        confirmations: 0
      };
    }
  }

  /**
   * Get current Bitcoin block height
   */
  private async getCurrentBlockHeight(): Promise<number> {
    try {
      const bitcoinApiUrl = this.isMainnet 
        ? 'https://api.mempool.space/api'
        : 'https://mempool.space/testnet/api';
      
      const response = await fetch(`${bitcoinApiUrl}/blocks/tip/height`);
      return await response.json() as number;
    } catch (error) {
      console.error('Error getting block height:', error);
      return 0;
    }
  }

  /**
   * Notify sBTC signers about a confirmed deposit
   * This triggers the sBTC minting process
   */
  async notifyDeposit(depositInfo: {
    txid: string;
    depositScript: string;
    reclaimScript: string;
    vout?: number;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.client.notifySbtc({
        transaction: depositInfo.txid,
        depositScript: depositInfo.depositScript,
        reclaimScript: depositInfo.reclaimScript,
        vout: depositInfo.vout || 0,
      });

      console.log(`Successfully notified sBTC signers about deposit ${depositInfo.txid}:`, response);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error notifying sBTC deposit:', error);
      return { 
        success: false, 
        error: `Failed to notify sBTC signers: ${errorMessage}` 
      };
    }
  }

  /**
   * Check sBTC balance for a Stacks address
   */
  async getSbtcBalance(stacksAddress: string): Promise<{
    balanceMicroSbtc: string;
    balanceSbtc: string;
    balanceBtc: string;
  }> {
    try {
      if (!this.isValidStacksAddress(stacksAddress)) {
        throw new Error('Invalid Stacks address format');
      }

      const balanceMicroSbtc = await this.client.fetchSbtcBalance(stacksAddress);
      const balanceSbtc = (Number(balanceMicroSbtc) / 1000000).toString();
      const balanceBtc = (Number(balanceMicroSbtc) / 100000000000000).toString();

      return {
        balanceMicroSbtc: balanceMicroSbtc.toString(),
        balanceSbtc,
        balanceBtc,
      };
    } catch (error) {
      console.error('Error fetching sBTC balance:', error);
      return {
        balanceMicroSbtc: '0',
        balanceSbtc: '0',
        balanceBtc: '0',
      };
    }
  }

  /**
   * Transfer sBTC from one address to another
   * Used for sending sBTC from gateway to merchant
   */
  async transferSbtc(request: {
    fromPrivateKey: string;
    toAddress: string;
    amountMicroSbtc: number;
    memo?: string;
  }): Promise<{ success: boolean; txid?: string; error?: string }> {
    try {
      // Get sBTC contract details
      const contractAddress = process.env.SBTC_CONTRACT_ADDRESS || 
        (this.isMainnet ? 'SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.sbtc-token' : 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sbtc-token');
      
      const [deployer, contractName] = contractAddress.split('.');

      // Create transfer transaction
      const txOptions = {
        contractAddress: deployer,
        contractName,
        functionName: 'transfer',
        functionArgs: [
          uintCV(request.amountMicroSbtc),
          bufferCV(Buffer.from(request.toAddress, 'utf8')), // Convert address to buffer
          request.memo ? bufferCV(Buffer.from(request.memo, 'utf8')) : noneCV(),
        ],
        senderKey: request.fromPrivateKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 5000, // 0.005 STX
      };

      const transaction = await makeContractCall(txOptions);
      const txResult = await broadcastTransaction({
        transaction,
        network: this.network,
      });

      console.log(`sBTC transfer successful: ${txResult.txid}`);
      return {
        success: true,
        txid: txResult.txid,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error transferring sBTC:', error);
      return {
        success: false,
        error: `sBTC transfer failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Get current Bitcoin and sBTC fee rates
   */
  async getFeeRates(): Promise<{ 
    bitcoin: { low: number; medium: number; high: number };
    stacks: { low: number; medium: number; high: number };
  }> {
    try {
      const [btcLow, btcMedium, btcHigh] = await Promise.all([
        this.client.fetchFeeRate('low'),
        this.client.fetchFeeRate('medium'),
        this.client.fetchFeeRate('high'),
      ]);

      return {
        bitcoin: { low: btcLow, medium: btcMedium, high: btcHigh },
        stacks: { low: 5000, medium: 10000, high: 20000 }, // microSTX
      };
    } catch (error) {
      console.error('Error fetching fee rates:', error);
      // Return fallback values
      return {
        bitcoin: this.isMainnet 
          ? { low: 20, medium: 30, high: 50 }
          : { low: 1, medium: 2, high: 5 },
        stacks: { low: 5000, medium: 10000, high: 20000 }
      };
    }
  }

  /**
   * Validate Stacks address format
   */
  private isValidStacksAddress(address: string): boolean {
    const stacksAddressRegex = /^S[TP][0-9A-HJKMNP-Z]{38,40}$/;
    return stacksAddressRegex.test(address);
  }

  /**
   * Health check for sBTC service
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    signerStatus: 'online' | 'offline' | 'unknown';
    apiStatus: 'online' | 'offline' | 'unknown';
    networkInfo: {
      network: string;
      blockHeight?: number;
    };
  }> {
    let signerStatus: 'online' | 'offline' | 'unknown' = 'unknown';
    let apiStatus: 'online' | 'offline' | 'unknown' = 'unknown';
    let blockHeight: number | undefined;

    try {
      // Test signer connectivity
      await this.client.fetchSignersPublicKey();
      signerStatus = 'online';
    } catch (error) {
      signerStatus = 'offline';
    }

    try {
      // Test API connectivity and get block height
      await this.client.fetchFeeRate('medium');
      blockHeight = await this.getCurrentBlockHeight();
      apiStatus = 'online';
    } catch (error) {
      apiStatus = 'offline';
    }

    return {
      isHealthy: signerStatus === 'online' && apiStatus === 'online',
      signerStatus,
      apiStatus,
      networkInfo: {
        network: this.networkType,
        blockHeight,
      },
    };
  }
}

// Create singleton instance
export const sbtcService = new SbtcService();
