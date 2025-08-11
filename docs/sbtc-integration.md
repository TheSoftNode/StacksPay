# sBTC Integration Guide

**Project**: sBTC Payment Gateway  
**Focus**: sBTC Protocol Integration with Bitcoin and Stacks  
**Last Updated**: August 11, 2025

## Overview

This guide provides comprehensive instructions for integrating sBTC (Stacks Bitcoin) into our payment gateway. sBTC enables Bitcoin to be used in smart contracts and DeFi applications through a 1:1 peg with Bitcoin.

## sBTC Protocol Understanding

### Architecture Overview

```
Bitcoin Network          Stacks Network
     |                        |
     v                        v
┌─────────────┐    ┌─────────────────┐
│ BTC Deposit │ -> │ sBTC Minting    │
│ (Taproot)   │    │ (Smart Contract)│
└─────────────┘    └─────────────────┘
     ^                        |
     |                        v
┌─────────────┐    ┌─────────────────┐
│ BTC Release │ <- │ sBTC Burning    │
│ (Multi-sig) │    │ (Smart Contract)│
└─────────────┘    └─────────────────┘
```

### Key Components

1. **Decentralized Signers**: Validate transactions and manage the Bitcoin peg wallet
2. **Emily API**: Coordination layer for deposit/withdrawal operations
3. **Stacks Smart Contracts**: Handle sBTC minting/burning
4. **Bitcoin Peg Wallet**: Multi-signature wallet holding deposited Bitcoin

### Transaction Flow

#### Deposit Flow (Bitcoin → sBTC)

1. User sends Bitcoin to generated taproot address
2. Emily API detects deposit and notifies signers
3. Signers verify deposit and sign minting transaction
4. sBTC is minted on Stacks and sent to user's address
5. Process completes after 6 Bitcoin confirmations

#### Withdrawal Flow (sBTC → Bitcoin)

1. User burns sBTC tokens on Stacks
2. Signers detect burn transaction
3. Bitcoin is released from peg wallet to user's address
4. Process completes after transaction confirmation

## Implementation Strategy

### Phase 1: sBTC Dependencies Setup

#### Install Required Packages

```bash
# Core sBTC package
npm install sbtc

# Stacks.js packages for blockchain interaction
npm install @stacks/transactions @stacks/network @stacks/connect @stacks/auth

# Bitcoin utilities
npm install bitcoin-core bitcoinjs-lib

# Additional utilities
npm install axios ws qrcode
```

#### Environment Configuration

Add to `.env.local`:

```env
# sBTC Configuration
SBTC_NETWORK=testnet
EMILY_API_URL=https://api.testnet.sbtc.tech
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co

# Bitcoin Configuration
BITCOIN_NETWORK=testnet
MEMPOOL_API_URL=https://mempool.space/testnet/api

# Stacks Configuration
STACKS_NETWORK=testnet
STACKS_CONTRACT_ADDRESS=ST000000000000000000002AMW42H
STACKS_CONTRACT_NAME=sbtc-token
```

### Phase 2: sBTC Service Implementation

#### Create sBTC Service

**File**: `lib/services/sbtc-service.ts`

```typescript
import {
  buildSbtcDepositAddress,
  sbtcDepositHelper,
  SbtcApiClientTestnet,
  SbtcApiClientMainnet,
  type DepositAddressOptions,
  type DepositHelperOptions,
} from 'sbtc';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';

export interface SbtcDepositRequest {
  stacksAddress: string;
  amount: number; // in satoshis
  merchantBitcoinAddress?: string;
}

export interface SbtcDepositResponse {
  depositAddress: string;
  stacksAddress: string;
  depositScript: string;
  reclaimScript: string;
  signerPublicKey: string;
  maxSignerFee: number;
  expiresAt: Date;
}

export interface SbtcWithdrawalRequest {
  amount: number; // in micro-sBTC (1 sBTC = 1,000,000 micro-sBTC)
  bitcoinAddress: string;
  stacksPrivateKey: string;
}

export class SbtcService {
  private client: SbtcApiClientTestnet | SbtcApiClientMainnet;
  private network: StacksTestnet | StacksMainnet;
  private isMainnet: boolean;

  constructor() {
    this.isMainnet = process.env.SBTC_NETWORK === 'mainnet';
    this.client = this.isMainnet ? new SbtcApiClientMainnet() : new SbtcApiClientTestnet();
    this.network = this.isMainnet ? new StacksMainnet() : new StacksTestnet();
  }

  /**
   * Create sBTC deposit address for receiving Bitcoin
   */
  async createDepositAddress(request: SbtcDepositRequest): Promise<SbtcDepositResponse> {
    try {
      // Get current signer public key
      const signerPublicKey = await this.client.fetchSignersPublicKey();

      // Build deposit address with embedded metadata
      const deposit = buildSbtcDepositAddress({
        stacksAddress: request.stacksAddress,
        signersPublicKey: signerPublicKey,
        maxSignerFee: 80_000, // 0.0008 BTC
        reclaimLockTime: 6_000, // ~6 blocks
        network: this.isMainnet ? 'MAINNET' : 'TESTNET',
      });

      return {
        depositAddress: deposit.address,
        stacksAddress: request.stacksAddress,
        depositScript: deposit.depositScript,
        reclaimScript: deposit.reclaimScript,
        signerPublicKey: signerPublicKey,
        maxSignerFee: 80_000,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      };
    } catch (error) {
      console.error('Error creating deposit address:', error);
      throw new Error('Failed to create sBTC deposit address');
    }
  }

  /**
   * Create complete Bitcoin transaction for sBTC deposit
   */
  async createDepositTransaction(options: {
    amount: number;
    stacksAddress: string;
    utxos: any[];
    changeAddress: string;
    feeRate?: number;
  }) {
    try {
      const signerPublicKey = await this.client.fetchSignersPublicKey();
      const feeRate = options.feeRate || (await this.client.fetchFeeRate('medium'));

      const deposit = await sbtcDepositHelper({
        amountSats: options.amount,
        stacksAddress: options.stacksAddress,
        signersPublicKey: signerPublicKey,
        feeRate: feeRate,
        utxos: options.utxos,
        bitcoinChangeAddress: options.changeAddress,
        network: this.isMainnet ? 'MAINNET' : 'TESTNET',
      });

      return deposit;
    } catch (error) {
      console.error('Error creating deposit transaction:', error);
      throw new Error('Failed to create deposit transaction');
    }
  }

  /**
   * Notify Emily API about a Bitcoin deposit
   */
  async notifyDeposit(txid: string, depositInfo: SbtcDepositResponse): Promise<void> {
    try {
      await this.client.notifySbtc({
        txid: txid,
        stacksAddress: depositInfo.stacksAddress,
        reclaimScript: depositInfo.reclaimScript,
        depositScript: depositInfo.depositScript,
      });

      console.log(`Successfully notified Emily API about deposit ${txid}`);
    } catch (error) {
      console.error('Error notifying deposit:', error);
      throw new Error('Failed to notify Emily API about deposit');
    }
  }

  /**
   * Check sBTC balance for a Stacks address
   */
  async getSbtcBalance(stacksAddress: string): Promise<bigint> {
    try {
      const balance = await this.client.fetchSbtcBalance(stacksAddress);
      return balance;
    } catch (error) {
      console.error('Error fetching sBTC balance:', error);
      return BigInt(0);
    }
  }

  /**
   * Initiate sBTC withdrawal (burn sBTC for Bitcoin)
   */
  async initiateWithdrawal(request: SbtcWithdrawalRequest): Promise<string> {
    try {
      // Create withdrawal transaction
      const txOptions = {
        contractAddress: process.env.STACKS_CONTRACT_ADDRESS!,
        contractName: process.env.STACKS_CONTRACT_NAME!,
        functionName: 'withdraw',
        functionArgs: [
          // Amount in micro-sBTC
          uintCV(request.amount),
          // Bitcoin address as bytes
          bufferCV(Buffer.from(request.bitcoinAddress, 'utf8')),
        ],
        senderKey: request.stacksPrivateKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
      };

      const transaction = await makeContractCall(txOptions);
      const txResult = await broadcastTransaction(transaction, this.network);

      return txResult.txid;
    } catch (error) {
      console.error('Error initiating withdrawal:', error);
      throw new Error('Failed to initiate sBTC withdrawal');
    }
  }

  /**
   * Monitor Bitcoin transaction confirmations
   */
  async getTransactionConfirmations(txid: string): Promise<number> {
    try {
      const response = await fetch(`${process.env.MEMPOOL_API_URL}/tx/${txid}`);
      if (!response.ok) {
        return 0;
      }

      const txData = await response.json();

      if (!txData.status?.confirmed) {
        return 0;
      }

      // Get current block height
      const blockResponse = await fetch(`${process.env.MEMPOOL_API_URL}/blocks/tip/height`);
      const currentHeight = await blockResponse.json();

      return Math.max(0, currentHeight - txData.status.block_height + 1);
    } catch (error) {
      console.error('Error getting confirmations:', error);
      return 0;
    }
  }

  /**
   * Get current Bitcoin network fee rates
   */
  async getFeeRates(): Promise<{ low: number; medium: number; high: number }> {
    try {
      const low = await this.client.fetchFeeRate('low');
      const medium = await this.client.fetchFeeRate('medium');
      const high = await this.client.fetchFeeRate('high');

      return { low, medium, high };
    } catch (error) {
      console.error('Error fetching fee rates:', error);
      return { low: 10, medium: 15, high: 25 }; // Fallback values
    }
  }

  /**
   * Get UTXOs for a Bitcoin address
   */
  async getUtxos(address: string): Promise<any[]> {
    try {
      return await this.client.fetchUtxos(address);
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
      return [];
    }
  }

  /**
   * Broadcast Bitcoin transaction
   */
  async broadcastTransaction(transaction: any): Promise<string> {
    try {
      return await this.client.broadcastTx(transaction);
    } catch (error) {
      console.error('Error broadcasting transaction:', error);
      throw new Error('Failed to broadcast transaction');
    }
  }
}

// Import required from @stacks/transactions
import { uintCV, bufferCV } from '@stacks/transactions';

export const sbtcService = new SbtcService();
```

### Phase 3: Bitcoin Transaction Monitoring

#### Create Bitcoin Monitor Service

**File**: `lib/services/bitcoin-monitor.ts`

```typescript
import { sbtcService } from './sbtc-service';
import { paymentService } from './payment-service';
import { webhookService } from './webhook-service';

export interface MonitoredAddress {
  address: string;
  paymentId: string;
  expectedAmount: number;
  createdAt: Date;
  expiresAt: Date;
}

export class BitcoinMonitor {
  private monitoredAddresses: Map<string, MonitoredAddress> = new Map();
  private monitorInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  /**
   * Start monitoring Bitcoin addresses for payments
   */
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log('Starting Bitcoin transaction monitoring...');

    this.monitorInterval = setInterval(async () => {
      await this.checkAddresses();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    console.log('Bitcoin monitoring stopped');
  }

  /**
   * Add address to monitoring queue
   */
  addAddress(addressInfo: MonitoredAddress) {
    this.monitoredAddresses.set(addressInfo.address, addressInfo);
    console.log(`Added address ${addressInfo.address} to monitoring queue`);
  }

  /**
   * Remove address from monitoring
   */
  removeAddress(address: string) {
    this.monitoredAddresses.delete(address);
    console.log(`Removed address ${address} from monitoring`);
  }

  /**
   * Check all monitored addresses for transactions
   */
  private async checkAddresses() {
    const now = new Date();
    const addressesToRemove: string[] = [];

    for (const [address, info] of this.monitoredAddresses) {
      try {
        // Remove expired addresses
        if (now > info.expiresAt) {
          addressesToRemove.push(address);
          await this.handleExpiredPayment(info);
          continue;
        }

        // Check for transactions
        const transactions = await this.getAddressTransactions(address);

        for (const tx of transactions) {
          if (tx.value >= info.expectedAmount) {
            await this.handlePaymentReceived(info, tx);
            addressesToRemove.push(address);
            break;
          }
        }
      } catch (error) {
        console.error(`Error checking address ${address}:`, error);
      }
    }

    // Remove processed addresses
    for (const address of addressesToRemove) {
      this.removeAddress(address);
    }
  }

  /**
   * Get transactions for a Bitcoin address
   */
  private async getAddressTransactions(address: string): Promise<any[]> {
    try {
      const response = await fetch(`${process.env.MEMPOOL_API_URL}/address/${address}/txs`);

      if (!response.ok) {
        return [];
      }

      const transactions = await response.json();

      return transactions.map((tx: any) => ({
        txid: tx.txid,
        value: this.getOutputValue(tx, address),
        confirmations: tx.status?.confirmed
          ? await sbtcService.getTransactionConfirmations(tx.txid)
          : 0,
        timestamp: tx.status?.block_time || Date.now() / 1000,
      }));
    } catch (error) {
      console.error('Error fetching address transactions:', error);
      return [];
    }
  }

  /**
   * Calculate output value for specific address
   */
  private getOutputValue(tx: any, address: string): number {
    let totalValue = 0;

    for (const output of tx.vout || []) {
      if (output.scriptpubkey_address === address) {
        totalValue += output.value;
      }
    }

    return totalValue;
  }

  /**
   * Handle payment received
   */
  private async handlePaymentReceived(addressInfo: MonitoredAddress, transaction: any) {
    try {
      console.log(`Payment received for ${addressInfo.paymentId}: ${transaction.txid}`);

      // Update payment status to processing
      await paymentService.updatePaymentStatus(
        addressInfo.paymentId,
        'processing',
        transaction.txid
      );

      // If confirmed, complete the payment
      if (transaction.confirmations >= 1) {
        await this.completePayment(addressInfo, transaction);
      } else {
        // Start monitoring confirmations
        this.monitorConfirmations(addressInfo, transaction);
      }
    } catch (error) {
      console.error('Error handling payment received:', error);
    }
  }

  /**
   * Monitor transaction confirmations
   */
  private async monitorConfirmations(addressInfo: MonitoredAddress, transaction: any) {
    const checkConfirmations = async () => {
      try {
        const confirmations = await sbtcService.getTransactionConfirmations(transaction.txid);

        if (confirmations >= 6) {
          // Required confirmations for sBTC
          await this.completePayment(addressInfo, transaction);
        } else {
          // Check again in 2 minutes
          setTimeout(checkConfirmations, 120000);
        }
      } catch (error) {
        console.error('Error checking confirmations:', error);
        // Retry in 5 minutes
        setTimeout(checkConfirmations, 300000);
      }
    };

    // Start checking confirmations
    setTimeout(checkConfirmations, 60000); // Wait 1 minute before first check
  }

  /**
   * Complete payment after sufficient confirmations
   */
  private async completePayment(addressInfo: MonitoredAddress, transaction: any) {
    try {
      // Update payment status to completed
      await paymentService.updatePaymentStatus(
        addressInfo.paymentId,
        'completed',
        transaction.txid
      );

      // Send webhook notification
      await webhookService.sendPaymentCompletedWebhook(addressInfo.paymentId, transaction.txid);

      console.log(`Payment ${addressInfo.paymentId} completed successfully`);
    } catch (error) {
      console.error('Error completing payment:', error);
    }
  }

  /**
   * Handle expired payment
   */
  private async handleExpiredPayment(addressInfo: MonitoredAddress) {
    try {
      await paymentService.updatePaymentStatus(addressInfo.paymentId, 'expired');

      await webhookService.sendPaymentExpiredWebhook(addressInfo.paymentId);

      console.log(`Payment ${addressInfo.paymentId} expired`);
    } catch (error) {
      console.error('Error handling expired payment:', error);
    }
  }
}

export const bitcoinMonitor = new BitcoinMonitor();

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  bitcoinMonitor.startMonitoring();
}
```

### Phase 4: Enhanced Payment Service Integration

#### Update Payment Service with sBTC

**File**: `lib/services/payment-service.ts` (Enhanced version)

```typescript
import { Payment } from '@/models/payment';
import { Merchant } from '@/models/merchant';
import { connectToDatabase } from '@/lib/database/mongodb';
import { sbtcService } from './sbtc-service';
import { bitcoinMonitor } from './bitcoin-monitor';
import QRCode from 'qrcode';

export interface CreatePaymentRequest {
  merchantId: string;
  amount: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
  expiresIn?: number;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  depositAddress: string;
  stacksAddress: string;
  expiresAt: Date;
  qrCode?: string;
  paymentUri?: string;
  metadata?: Record<string, any>;
}

export class PaymentService {
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    await connectToDatabase();

    try {
      // Validate merchant
      const merchant = await Merchant.findById(data.merchantId);
      if (!merchant || !merchant.isActive) {
        throw new Error('Invalid or inactive merchant');
      }

      // Create sBTC deposit address
      const depositInfo = await sbtcService.createDepositAddress({
        stacksAddress: merchant.stacksAddress,
        amount: data.amount,
      });

      // Calculate expiration
      const expiresIn = data.expiresIn || 30;
      const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);

      // Create payment record
      const payment = new Payment({
        merchantId: data.merchantId,
        amount: data.amount,
        currency: data.currency || 'BTC',
        status: 'pending',
        depositAddress: depositInfo.depositAddress,
        stacksAddress: depositInfo.stacksAddress,
        depositScript: depositInfo.depositScript,
        reclaimScript: depositInfo.reclaimScript,
        signerPublicKey: depositInfo.signerPublicKey,
        customerInfo: {
          email: data.customerEmail,
          name: data.customerName,
        },
        metadata: data.metadata,
        expiresAt: expiresAt,
      });

      await payment.save();

      // Generate QR code for payment
      const amountBTC = data.amount / 100000000;
      const paymentUri = `bitcoin:${depositInfo.depositAddress}?amount=${amountBTC}`;
      const qrCode = await QRCode.toDataURL(paymentUri);

      // Add to Bitcoin monitoring
      bitcoinMonitor.addAddress({
        address: depositInfo.depositAddress,
        paymentId: payment._id.toString(),
        expectedAmount: data.amount,
        createdAt: new Date(),
        expiresAt: expiresAt,
      });

      return {
        id: payment._id.toString(),
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        depositAddress: payment.depositAddress,
        stacksAddress: payment.stacksAddress,
        expiresAt: payment.expiresAt,
        qrCode: qrCode,
        paymentUri: paymentUri,
        metadata: payment.metadata,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async processDepositNotification(txid: string, paymentId: string): Promise<void> {
    await connectToDatabase();

    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Notify Emily API about the deposit
      await sbtcService.notifyDeposit(txid, {
        depositAddress: payment.depositAddress,
        stacksAddress: payment.stacksAddress,
        depositScript: payment.depositScript,
        reclaimScript: payment.reclaimScript,
        signerPublicKey: payment.signerPublicKey,
        maxSignerFee: 80_000,
        expiresAt: payment.expiresAt,
      });

      console.log(`Notified Emily API about deposit ${txid} for payment ${paymentId}`);
    } catch (error) {
      console.error('Error processing deposit notification:', error);
      throw error;
    }
  }

  // ... rest of the methods remain the same
}

export const paymentService = new PaymentService();
```

### Phase 5: API Integration

#### Create sBTC-specific API Routes

**File**: `app/api/v1/sbtc/deposit/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sbtcService } from '@/lib/services/sbtc-service';
import { merchantService } from '@/lib/services/merchant-service';
import { z } from 'zod';

const depositSchema = z.object({
  stacks_address: z.string(),
  amount: z.number().min(10000),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Invalid authorization' }, { status: 401 });
    }

    const auth = await merchantService.validateApiKey(authHeader.substring(7));
    if (!auth) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Validate request
    const body = await request.json();
    const { stacks_address, amount } = depositSchema.parse(body);

    // Create deposit address
    const deposit = await sbtcService.createDepositAddress({
      stacksAddress: stacks_address,
      amount: amount,
    });

    return NextResponse.json({
      deposit_address: deposit.depositAddress,
      stacks_address: deposit.stacksAddress,
      amount_btc: amount / 100000000,
      amount_sats: amount,
      expires_at: deposit.expiresAt.toISOString(),
      signer_fee: deposit.maxSignerFee,
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File**: `app/api/v1/sbtc/balance/[address]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sbtcService } from '@/lib/services/sbtc-service';

export async function GET(request: NextRequest, { params }: { params: { address: string } }) {
  try {
    const balance = await sbtcService.getSbtcBalance(params.address);

    return NextResponse.json({
      address: params.address,
      balance_micro_sbtc: balance.toString(),
      balance_sbtc: (Number(balance) / 1000000).toString(),
      balance_btc: (Number(balance) / 100000000000000).toString(),
    });
  } catch (error) {
    console.error('Error fetching sBTC balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Testing and Validation

### Testing Checklist

- [ ] sBTC deposit address generation
- [ ] Bitcoin transaction monitoring
- [ ] Emily API notifications
- [ ] sBTC balance checking
- [ ] Payment confirmation workflow
- [ ] Error handling and edge cases

### Test Script

**File**: `scripts/test-sbtc.ts`

```typescript
import { sbtcService } from '@/lib/services/sbtc-service';

async function testSbtcIntegration() {
  try {
    console.log('Testing sBTC integration...');

    // Test 1: Create deposit address
    const deposit = await sbtcService.createDepositAddress({
      stacksAddress: 'ST000000000000000000002AMW42H',
      amount: 100000,
    });
    console.log('✅ Deposit address created:', deposit.depositAddress);

    // Test 2: Check fee rates
    const feeRates = await sbtcService.getFeeRates();
    console.log('✅ Fee rates fetched:', feeRates);

    // Test 3: Check balance (should be 0 for new address)
    const balance = await sbtcService.getSbtcBalance('ST000000000000000000002AMW42H');
    console.log('✅ Balance checked:', balance.toString());

    console.log('All tests passed! sBTC integration is working.');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSbtcIntegration();
```

## Production Considerations

### Security

1. **API Key Management**: Secure storage and rotation
2. **Input Validation**: Comprehensive validation for all inputs
3. **Rate Limiting**: Prevent abuse of sBTC operations
4. **Error Handling**: Graceful handling of network failures

### Monitoring

1. **Transaction Monitoring**: Real-time Bitcoin transaction tracking
2. **Emily API Health**: Monitor Emily API availability
3. **Balance Tracking**: Track sBTC minting and burning
4. **Error Alerts**: Alert on failed operations

### Scalability

1. **Caching**: Cache signer public keys and fee rates
2. **Queue Management**: Queue deposit notifications
3. **Batch Processing**: Process multiple transactions efficiently
4. **Load Balancing**: Distribute API calls across instances

This implementation provides a complete sBTC integration for the payment gateway, enabling seamless Bitcoin-to-sBTC conversions with proper monitoring and error handling.
