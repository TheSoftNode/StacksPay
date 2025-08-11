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
  stringUtf8CV,
  stringAsciiCV,
} from '@stacks/transactions';


// Enterprise-grade interfaces for sBTC operations
export interface SbtcDepositRequest {
  stacksAddress: string;
  amountSats: number;
  bitcoinChangeAddress?: string;
  feeRate?: 'low' | 'medium' | 'high';
  reclaimPublicKey?: string;
  maxSignerFee?: number;
  reclaimLockTime?: number;
}

export interface SbtcDepositResponse {
  depositAddress: string;
  stacksAddress: string;
  depositScript: string;
  reclaimScript: string;
  signerPublicKey: string;
  maxSignerFee: number;
  reclaimLockTime: number;
  expiresAt: Date;
  amountBtc: string;
  amountSats: number;
  network: 'MAINNET' | 'TESTNET';
  qrCodeData: string;
}

export interface SbtcDepositTransaction {
  transaction: any;
  depositAddress: string;
  stacksAddress: string;
  depositScript: string;
  reclaimScript: string;
  signerPublicKey: string;
  txid?: string;
  estimatedFee: number;
  changeAmount: number;
}

export interface SbtcWithdrawalRequest {
  amountMicroSbtc: bigint;
  bitcoinAddress: string;
  stacksPrivateKey: string;
  fee?: number;
}

export interface SbtcBalanceResponse {
  address: string;
  balanceMicroSbtc: string;
  balanceSbtc: string;
  balanceBtc: string;
  lastUpdated: Date;
}

export interface SbtcTransactionStatus {
  txid: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  blockHeight?: number;
  timestamp?: number;
  fee?: number;
}

export interface SbtcNetworkInfo {
  network: 'mainnet' | 'testnet' | 'devnet';
  isMainnet: boolean;
  sbtcApiUrl: string;
  stacksApiUrl: string;
  bitcoinApiUrl: string;
  contractAddress: string;
  signerAddress?: string;
  signerPublicKey?: string;
}

/**
 * Enterprise-grade sBTC Service
 * Handles all sBTC operations including deposits, withdrawals, and monitoring
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
   * Create sBTC deposit address using official sBTC SDK
   * Enterprise-grade implementation with comprehensive error handling
   */
  async createDepositAddress(request: SbtcDepositRequest): Promise<SbtcDepositResponse> {
    try {
      // Validate input parameters
      if (!this.isValidStacksAddress(request.stacksAddress)) {
        throw new Error('Invalid Stacks address format');
      }

      if (request.amountSats < 10000) {
        throw new Error('Minimum deposit amount is 10,000 satoshis (0.0001 BTC)');
      }

      // Get current signer public key from sBTC protocol
      const signerPublicKey = await this.client.fetchSignersPublicKey();
      
      // Use defaults from environment or constants
      const maxSignerFee = request.maxSignerFee || DEFAULT_MAX_SIGNER_FEE;
      const reclaimLockTime = request.reclaimLockTime || DEFAULT_RECLAIM_LOCK_TIME;
      const reclaimPublicKey = request.reclaimPublicKey || signerPublicKey; // Use signer key as fallback

      // Build deposit address with embedded metadata
      const deposit = buildSbtcDepositAddress({
        network: this.isMainnet ? MAINNET : TESTNET,
        stacksAddress: request.stacksAddress,
        signersPublicKey: signerPublicKey,
        reclaimPublicKey,
        maxSignerFee,
        reclaimLockTime,
      });

      // Calculate expiration time
      const expiryMinutes = parseInt(process.env.DEFAULT_PAYMENT_EXPIRY_MINUTES || '30');
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      // Generate QR code data for Bitcoin payment
      const amountBtc = request.amountSats / 100000000;
      const qrCodeData = `bitcoin:${deposit.address}?amount=${amountBtc}&label=sBTC%20Deposit`;

      return {
        depositAddress: deposit.address,
        stacksAddress: request.stacksAddress,
        depositScript: deposit.depositScript,
        reclaimScript: deposit.reclaimScript,
        signerPublicKey,
        maxSignerFee,
        reclaimLockTime,
        expiresAt,
        amountBtc: amountBtc.toString(),
        amountSats: request.amountSats,
        network: this.isMainnet ? 'MAINNET' : 'TESTNET',
        qrCodeData,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating sBTC deposit address:', error);
      throw new Error(`Failed to create sBTC deposit address: ${errorMessage}`);
    }
  }

  /**
   * Create complete Bitcoin transaction for sBTC deposit
   * Uses the official sbtcDepositHelper for full transaction creation
   */
  async createDepositTransaction(options: {
    amountSats: number;
    stacksAddress: string;
    utxos: any[];
    bitcoinChangeAddress: string;
    feeRate?: 'low' | 'medium' | 'high';
    reclaimPublicKey?: string;
  }): Promise<SbtcDepositTransaction> {
    try {
      // Validate inputs
      if (!this.isValidStacksAddress(options.stacksAddress)) {
        throw new Error('Invalid Stacks address');
      }

      if (!this.isValidBitcoinAddress(options.bitcoinChangeAddress)) {
        throw new Error('Invalid Bitcoin change address');
      }

      if (options.utxos.length === 0) {
        throw new Error('No UTXOs provided for transaction');
      }

      const signerPublicKey = await this.client.fetchSignersPublicKey();
      const feeRateType = options.feeRate || 'medium';
      const feeRate = await this.client.fetchFeeRate(feeRateType);

      // Calculate estimated fee
      const estimatedFee = feeRate * 250; // Rough estimate for sBTC deposit tx size

      // Use the official sbtcDepositHelper
      const deposit = await sbtcDepositHelper({
        network: this.isMainnet ? MAINNET : TESTNET,
        amountSats: options.amountSats,
        stacksAddress: options.stacksAddress,
        signersPublicKey: signerPublicKey,
        reclaimPublicKey: options.reclaimPublicKey || signerPublicKey,
        feeRate,
        utxos: options.utxos,
        bitcoinChangeAddress: options.bitcoinChangeAddress,
        maxSignerFee: DEFAULT_MAX_SIGNER_FEE,
        reclaimLockTime: DEFAULT_RECLAIM_LOCK_TIME,
      });

      // Calculate change amount
      const totalInput = options.utxos.reduce((sum, utxo) => sum + utxo.value, 0);
      const changeAmount = totalInput - options.amountSats - estimatedFee - DEFAULT_MAX_SIGNER_FEE;

      return {
        transaction: deposit.transaction,
        depositAddress: deposit.address,
        stacksAddress: options.stacksAddress,
        depositScript: deposit.depositScript,
        reclaimScript: deposit.reclaimScript,
        signerPublicKey,
        estimatedFee,
        changeAmount: Math.max(0, changeAmount),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating sBTC deposit transaction:', error);
      throw new Error(`Failed to create sBTC deposit transaction: ${errorMessage}`);
    }
  }

  /**
   * Broadcast Bitcoin transaction to network
   */
  async broadcastTransaction(transaction: any): Promise<string> {
    try {
      const txid = await this.client.broadcastTx(transaction);
      console.log(`Successfully broadcast Bitcoin transaction: ${txid}`);
      return txid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error broadcasting Bitcoin transaction:', error);
      throw new Error(`Failed to broadcast transaction: ${errorMessage}`);
    }
  }

  /**
   * Notify sBTC signers about a deposit transaction
   * This is crucial for the sBTC minting process
   */
  async notifyDeposit(depositInfo: {
    txid: string;
    depositScript: string;
    reclaimScript: string;
    vout?: number;
  }): Promise<void> {
    try {
      const response = await this.client.notifySbtc({
        transaction: depositInfo.txid,
        depositScript: depositInfo.depositScript,
        reclaimScript: depositInfo.reclaimScript,
        vout: depositInfo.vout || 0,
      });

      console.log(`Successfully notified sBTC signers about deposit ${depositInfo.txid}:`, response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error notifying sBTC deposit:', error);
      throw new Error(`Failed to notify sBTC signers: ${errorMessage}`);
    }
  }

  /**
   * Check sBTC balance for a Stacks address
   */
  async getSbtcBalance(stacksAddress: string): Promise<SbtcBalanceResponse> {
    try {
      if (!this.isValidStacksAddress(stacksAddress)) {
        throw new Error('Invalid Stacks address format');
      }

      const balanceMicroSbtc = await this.client.fetchSbtcBalance(stacksAddress);
      const balanceSbtc = (Number(balanceMicroSbtc) / 1000000).toString();
      const balanceBtc = (Number(balanceMicroSbtc) / 100000000000000).toString();

      return {
        address: stacksAddress,
        balanceMicroSbtc: balanceMicroSbtc.toString(),
        balanceSbtc,
        balanceBtc,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error fetching sBTC balance:', error);
      return {
        address: stacksAddress,
        balanceMicroSbtc: '0',
        balanceSbtc: '0',
        balanceBtc: '0',
        lastUpdated: new Date(),
      };
    }
  }

  /**
   * Initiate sBTC withdrawal (burn sBTC for Bitcoin)
   * Enterprise-grade implementation with proper contract calls
   */
  async initiateWithdrawal(request: SbtcWithdrawalRequest): Promise<string> {
    try {
      if (!this.isValidBitcoinAddress(request.bitcoinAddress)) {
        throw new Error('Invalid Bitcoin address for withdrawal');
      }

      if (request.amountMicroSbtc <= BigInt(0)) {
        throw new Error('Withdrawal amount must be greater than 0');
      }

      // Get contract address from environment
      const contractAddress = process.env.SBTC_CONTRACT_ADDRESS!.split('.')[0];
      const contractName = process.env.SBTC_CONTRACT_ADDRESS!.split('.')[1];

      // Create withdrawal transaction on Stacks
      const txOptions = {
        contractAddress,
        contractName,
        functionName: 'withdraw',
        functionArgs: [
          uintCV(request.amountMicroSbtc),
          stringAsciiCV(request.bitcoinAddress),
        ],
        senderKey: request.stacksPrivateKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: request.fee,
      };

      const transaction = await makeContractCall(txOptions);
      const txResult = await broadcastTransaction({
        transaction,
        network: this.network,
      });

      console.log(`sBTC withdrawal initiated: ${txResult.txid}`);
      return txResult.txid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error initiating sBTC withdrawal:', error);
      throw new Error(`Failed to initiate sBTC withdrawal: ${errorMessage}`);
    }
  }

  /**
   * Get current Bitcoin network fee rates
   */
  async getFeeRates(): Promise<{ low: number; medium: number; high: number }> {
    try {
      const [low, medium, high] = await Promise.all([
        this.client.fetchFeeRate('low'),
        this.client.fetchFeeRate('medium'),
        this.client.fetchFeeRate('high'),
      ]);

      return { low, medium, high };
    } catch (error) {
      console.error('Error fetching fee rates:', error);
      // Return fallback values based on network
      if (this.isMainnet) {
        return { low: 20, medium: 30, high: 50 };
      } else {
        return { low: 10, medium: 15, high: 25 };
      }
    }
  }

  /**
   * Get UTXOs for a Bitcoin address
   */
  async getUtxos(bitcoinAddress: string): Promise<any[]> {
    try {
      if (!this.isValidBitcoinAddress(bitcoinAddress)) {
        throw new Error('Invalid Bitcoin address');
      }

      const utxos = await this.client.fetchUtxos(bitcoinAddress);
      return utxos;
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
      return [];
    }
  }

  /**
   * Monitor Bitcoin transaction confirmations
   */
  async getTransactionStatus(txid: string): Promise<SbtcTransactionStatus> {
    try {
      const response = await fetch(`${process.env.BITCOIN_API_URL}/tx/${txid}`);
      if (!response.ok) {
        return {
          txid,
          status: 'pending',
          confirmations: 0,
        };
      }

      const txData = await response.json();

      if (!txData.status?.confirmed) {
        return {
          txid,
          status: 'pending',
          confirmations: 0,
          timestamp: txData.status?.block_time,
          fee: txData.fee,
        };
      }

      // Get current block height
      const blockResponse = await fetch(`${process.env.BITCOIN_API_URL}/blocks/tip/height`);
      const currentHeight = await blockResponse.json();
      const confirmations = Math.max(0, currentHeight - txData.status.block_height + 1);

      return {
        txid,
        status: confirmations >= 6 ? 'confirmed' : 'pending',
        confirmations,
        blockHeight: txData.status.block_height,
        timestamp: txData.status.block_time,
        fee: txData.fee,
      };
    } catch (error) {
      console.error('Error getting transaction status:', error);
      return {
        txid,
        status: 'failed',
        confirmations: 0,
      };
    }
  }

  /**
   * Get sBTC signer information
   */
  async getSignerInfo(): Promise<{
    publicKey: string;
    address: string;
  }> {
    try {
      const [publicKey, address] = await Promise.all([
        this.client.fetchSignersPublicKey(),
        this.client.fetchSignersAddress(),
      ]);

      return { publicKey, address };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching signer info:', error);
      throw new Error(`Failed to fetch signer information: ${errorMessage}`);
    }
  }

  /**
   * Get comprehensive network status information
   */
  async getNetworkInfo(): Promise<SbtcNetworkInfo> {
    try {
      const signerInfo = await this.getSignerInfo();
      
      return {
        network: this.networkType,
        isMainnet: this.isMainnet,
        sbtcApiUrl: process.env.SBTC_API_URL!,
        stacksApiUrl: process.env.STACKS_API_URL!,
        bitcoinApiUrl: process.env.BITCOIN_API_URL!,
        contractAddress: process.env.SBTC_CONTRACT_ADDRESS!,
        signerAddress: signerInfo.address,
        signerPublicKey: signerInfo.publicKey,
      };
    } catch (error) {
      return {
        network: this.networkType,
        isMainnet: this.isMainnet,
        sbtcApiUrl: process.env.SBTC_API_URL!,
        stacksApiUrl: process.env.STACKS_API_URL!,
        bitcoinApiUrl: process.env.BITCOIN_API_URL!,
        contractAddress: process.env.SBTC_CONTRACT_ADDRESS!,
      };
    }
  }

  /**
   * Validate Stacks address format
   */
  isValidStacksAddress(address: string): boolean {
    // Comprehensive validation for Stacks address format
    const stacksAddressRegex = /^S[TP][0-9A-HJKMNP-Z]{38,40}$/;
    return stacksAddressRegex.test(address);
  }

  /**
   * Validate Bitcoin address format for current network
   */
  isValidBitcoinAddress(address: string): boolean {
    // Comprehensive validation for Bitcoin address formats
    const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const segwitRegex = /^bc1[a-z0-9]{39,59}$/;
    const testnetLegacyRegex = /^[mn2][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const testnetSegwitRegex = /^tb1[a-z0-9]{39,59}$/;
    
    if (this.isMainnet) {
      return legacyRegex.test(address) || segwitRegex.test(address);
    } else {
      return testnetLegacyRegex.test(address) || testnetSegwitRegex.test(address);
    }
  }

  /**
   * Check if sBTC protocol is healthy and operational
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    signerStatus: 'online' | 'offline' | 'unknown';
    apiStatus: 'online' | 'offline' | 'unknown';
    lastChecked: Date;
    errors?: string[];
  }> {
    const errors: string[] = [];
    let signerStatus: 'online' | 'offline' | 'unknown' = 'unknown';
    let apiStatus: 'online' | 'offline' | 'unknown' = 'unknown';

    try {
      // Test signer connectivity
      await this.client.fetchSignersPublicKey();
      signerStatus = 'online';
    } catch (error) {
      signerStatus = 'offline';
      errors.push('Signer connectivity failed');
    }

    try {
      // Test API connectivity
      await this.client.fetchFeeRate('medium');
      apiStatus = 'online';
    } catch (error) {
      apiStatus = 'offline';
      errors.push('API connectivity failed');
    }

    return {
      isHealthy: signerStatus === 'online' && apiStatus === 'online',
      signerStatus,
      apiStatus,
      lastChecked: new Date(),
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}



// Create singleton instance
export const sbtcService = new SbtcService();
