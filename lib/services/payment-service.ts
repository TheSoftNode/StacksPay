import { Payment } from '@/models/payment';
import { Merchant } from '@/models/merchant';
import { connectToDatabase } from '@/lib/database/mongodb';
import { sbtcService } from './sbtc-service';
import { walletService } from './wallet-service';
import { conversionService } from './conversion-service';
import { webhookService } from './webhook-service';
import { multiWalletAuthService } from './multi-wallet-auth-service';


export interface CreatePaymentOptions {
  merchantId: string;
  amount: number;
  currency: 'USD' | 'BTC' | 'STX' | 'sBTC';
  paymentMethod: 'sbtc' | 'btc' | 'stx';
  payoutMethod: 'sbtc' | 'usd' | 'usdt' | 'usdc';
  description?: string;
  metadata?: any;
  customerInfo?: any;
  successUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  expiresAt?: Date;
  allowedPaymentMethods?: ('bitcoin' | 'stx' | 'sbtc')[];
  preferredPaymentMethod?: 'bitcoin' | 'stx' | 'sbtc';
}

export interface PaymentResult {
  success: boolean;
  payment?: any;
  error?: string;
  qrCode?: string;
  instructions?: any;
  conversion?: any;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentAddress: string;
  createdAt: Date;
  confirmedAt?: Date;
  expiresAt?: Date;
  blockchain?: any;
}

/**
 * Payment orchestration service
 * Supports complete payment ecosystem:
 * - Customer Payment: Bitcoin, STX, or sBTC
 * - Merchant Settlement: Always sBTC
 * - Cashout Options: sBTC, USD, USDT, or USDC
 * 
 * Flow: Customer (BTC/STX/sBTC) → Gateway → Merchant (sBTC) → Cashout (USD/USDC)
 */
export class PaymentService {
  /**
   * Create a new payment request
   */
  async createPayment(options: CreatePaymentOptions): Promise<PaymentResult> {
    await connectToDatabase();

    try {
      // Get merchant details
      const merchant = await Merchant.findById(options.merchantId);
      if (!merchant) {
        return { success: false, error: 'Merchant not found' };
      }

      // Calculate customer payment conversion using ConversionService
      const paymentConversion = await conversionService.convertCurrency(
        options.amount,
        options.currency,
        options.paymentMethod.toUpperCase()
      );

      if (!paymentConversion.success) {
        return { success: false, error: 'Payment currency conversion failed' };
      }

      // Calculate merchant payout conversion (payment method to payout method)
      const payoutConversion = await conversionService.convertCurrency(
        paymentConversion.toAmount,
        paymentConversion.toCurrency,
        options.payoutMethod.toUpperCase()
      );

      if (!payoutConversion.success) {
        return { success: false, error: 'Payout currency conversion failed' };
      }

      // Generate payment address using specialized services
      const addressResult = await this.generatePaymentAddress(
        options.paymentMethod,
        merchant,
        paymentConversion.toAmount
      );

      if (!addressResult.success) {
        return { success: false, error: addressResult.error };
      }

      // Calculate total fees (payment + payout conversions)
      const totalFees = {
        conversion: paymentConversion.fees.conversion + payoutConversion.fees.conversion,
        network: paymentConversion.fees.network + payoutConversion.fees.network,
        total: paymentConversion.fees.total + payoutConversion.fees.total,
      };

      // Create payment record
      const payment = new Payment({
        merchantId: options.merchantId,
        amount: options.amount,
        currency: options.currency,
        paymentMethod: options.paymentMethod,
        payoutMethod: options.payoutMethod,
        paymentAmount: paymentConversion.toAmount,
        paymentCurrency: paymentConversion.toCurrency,
        payoutAmount: payoutConversion.toAmount,
        payoutCurrency: payoutConversion.toCurrency,
        conversionRate: paymentConversion.rate,
        payoutConversionRate: payoutConversion.rate,
        fees: totalFees,
        netAmount: payoutConversion.toAmount - totalFees.total,
        status: 'pending',
        paymentAddress: addressResult.address,
        paymentDetails: addressResult.details,
        description: options.description,
        metadata: options.metadata || {},
        customerInfo: options.customerInfo || {},
        urls: {
          success: options.successUrl,
          cancel: options.cancelUrl,
          webhook: options.webhookUrl,
        },
        expiresAt: options.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      await payment.save();

      // Generate QR code
      const qrCode = await this.generatePaymentQR(
        options.paymentMethod,
        addressResult.address!,
        paymentConversion.toAmount
      );

      // Generate payment instructions
      const instructions = this.generatePaymentInstructions(
        options.paymentMethod,
        addressResult.address!,
        paymentConversion.toAmount
      );

      // For now, skip multi-currency options to simplify
      // const paymentOptions = await this.generatePaymentOptions(...)

      return {
        success: true,
        payment: {
          id: payment._id,
          amount: options.amount,
          currency: options.currency,
          paymentMethod: options.paymentMethod,
          payoutMethod: options.payoutMethod,
          paymentAmount: paymentConversion.toAmount,
          paymentCurrency: paymentConversion.toCurrency,
          paymentAddress: addressResult.address,
          status: 'pending',
          expiresAt: payment.expiresAt,
          checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${payment._id}`,
          statusUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/${payment._id}/status`,
        },
        qrCode,
        instructions,
        conversion: {
          originalAmount: options.amount,
          originalCurrency: options.currency,
          paymentAmount: paymentConversion.toAmount,
          paymentCurrency: paymentConversion.toCurrency,
          rate: paymentConversion.rate,
          payoutAmount: payoutConversion.toAmount,
          payoutCurrency: payoutConversion.toCurrency,
          payoutRate: payoutConversion.rate,
          fees: totalFees,
          netAmount: payoutConversion.toAmount - totalFees.total,
        },
      };

    } catch (error) {
      console.error('Payment creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment creation failed' 
      };
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string, merchantId?: string): Promise<any> {
    await connectToDatabase();

    try {
      const query: any = { _id: paymentId };
      if (merchantId) {
        query.merchantId = merchantId;
      }

      const payment = await Payment.findOne(query)
        .populate('merchantId', 'businessName email')
        .select('-paymentDetails.privateKey');

      return payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      return null;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: string,
    status: string,
    metadata?: any
  ): Promise<{ success: boolean; payment?: any; error?: string }> {
    await connectToDatabase();

    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      const oldStatus = payment.status;
      payment.status = status;

      if (status === 'confirmed' && oldStatus !== 'confirmed') {
        payment.confirmedAt = new Date();
      }

      if (metadata) {
        payment.paymentDetails = { ...payment.paymentDetails, ...metadata };
      }

      await payment.save();

      // Trigger webhook if status changed
      if (oldStatus !== status) {
        await webhookService.triggerWebhook(payment, `payment.${status}`);
      }

      return { success: true, payment };
    } catch (error) {
      console.error('Payment status update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Status update failed' 
      };
    }
  }

  /**
   * List payments for merchant
   */
  async listPayments(
    merchantId: string,
    options: {
      page?: number;
      limit?: number;
      status?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<{
    payments: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    await connectToDatabase();

    try {
      const page = options.page || 1;
      const limit = Math.min(options.limit || 50, 100);
      const skip = (page - 1) * limit;

      const query: any = { merchantId };

      // Apply filters
      if (options.status) {
        query.status = options.status;
      }
      if (options.paymentMethod) {
        query.paymentMethod = options.paymentMethod;
      }
      if (options.startDate || options.endDate) {
        query.createdAt = {};
        if (options.startDate) query.createdAt.$gte = new Date(options.startDate);
        if (options.endDate) query.createdAt.$lte = new Date(options.endDate);
      }

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-paymentDetails.privateKey');

      const total = await Payment.countDocuments(query);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Error listing payments:', error);
      return {
        payments: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  /**
   * Check blockchain status for a payment
   */
  async checkPaymentStatus(paymentId: string): Promise<{
    confirmed: boolean;
    txId?: string;
    blockHeight?: number;
    confirmations?: number;
    error?: string;
  }> {
    try {
      const payment = await this.getPayment(paymentId);
      if (!payment) {
        return { confirmed: false, error: 'Payment not found' };
      }

      switch (payment.paymentMethod) {
        case 'sbtc':
          return await this.checkSbtcPaymentStatus(payment);
        case 'btc':
          return await this.checkBtcPaymentStatus(payment);
        case 'stx':
          return await this.checkStxPaymentStatus(payment);
        default:
          return { confirmed: false, error: 'Unknown payment method' };
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      return { 
        confirmed: false, 
        error: error instanceof Error ? error.message : 'Status check failed' 
      };
    }
  }

  /**
   * Authenticate wallet for payment authorization
   */
  async authenticateWallet(authRequest: {
    address: string;
    signature: string;
    message: string;
    publicKey: string;
    walletType: 'stacks' | 'bitcoin';
    paymentId?: string;
    amount?: number;
  }): Promise<{
    success: boolean;
    verified: boolean;
    walletType: 'stacks' | 'bitcoin';
    paymentMethod?: 'bitcoin' | 'stx' | 'sbtc';
    error?: string;
  }> {
    try {
      // Use MultiWalletAuthService for wallet verification
      const authResult = await multiWalletAuthService.verifyWalletSignature(authRequest);
      
      return authResult;
    } catch (error) {
      console.error('Wallet authentication error:', error);
      return {
        success: false,
        verified: false,
        walletType: authRequest.walletType,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * Process payment with wallet authorization
   */
  async processPaymentWithWallet(options: {
    paymentId: string;
    walletAuth: {
      address: string;
      signature: string;
      message: string;
      publicKey: string;
      walletType: 'stacks' | 'bitcoin';
    };
  }): Promise<{
    success: boolean;
    txId?: string;
    confirmed?: boolean;
    error?: string;
  }> {
    try {
      // First authenticate the wallet
      const authResult = await this.authenticateWallet({
        ...options.walletAuth,
        paymentId: options.paymentId,
      });

      if (!authResult.verified) {
        return {
          success: false,
          error: authResult.error || 'Wallet authentication failed',
        };
      }

      // Get payment details
      const payment = await this.getPayment(options.paymentId);
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      // Process payment based on wallet type and payment method
      switch (authResult.paymentMethod) {
        case 'stx':
          return await this.processStxPaymentWithWallet(payment, options.walletAuth);
          
        case 'bitcoin':
          return await this.processBtcPaymentWithWallet(payment, options.walletAuth);
          
        case 'sbtc':
          return await this.processSbtcPaymentWithWallet(payment, options.walletAuth);
          
        default:
          return { success: false, error: 'Unsupported payment method' };
      }

    } catch (error) {
      console.error('Payment processing with wallet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  /**
   * Process STX payment using WalletService
   */
  private async processStxPaymentWithWallet(payment: any, walletAuth: any): Promise<{
    success: boolean;
    txId?: string;
    confirmed?: boolean;
    error?: string;
  }> {
    try {
      // Use WalletService to authorize and execute STX payment
      const result = await walletService.authorizeStxPayment({
        paymentId: payment._id.toString(),
        amount: payment.paymentAmount,
        recipient: payment.paymentAddress,
        message: `Payment ${payment._id}`,
      });

      if (result.success) {
        // Update payment status
        await this.updatePaymentStatus(payment._id.toString(), 'confirmed', {
          txId: result.txId,
          confirmedAt: new Date(),
        });

        // Send webhook notification
        await webhookService.triggerWebhook(payment, 'confirmed');
      }

      return result;
    } catch (error) {
      console.error('STX payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'STX payment failed',
      };
    }
  }

  /**
   * Process Bitcoin payment with wallet integration
   */
  private async processBtcPaymentWithWallet(payment: any, walletAuth: any): Promise<{
    success: boolean;
    txId?: string;
    confirmed?: boolean;
    error?: string;
  }> {
    try {
      // For Bitcoin payments, we primarily monitor the address
      // The actual transaction is done by the user's wallet
      // We just validate the payment was received
      
      const statusCheck = await this.checkBtcPaymentStatus(payment);
      
      if (statusCheck.confirmed) {
        await this.updatePaymentStatus(payment._id.toString(), 'confirmed', {
          txId: statusCheck.txId,
          confirmedAt: new Date(),
          blockHeight: statusCheck.blockHeight,
          confirmations: statusCheck.confirmations,
        });

        // Send webhook notification
        await webhookService.triggerWebhook(payment, 'confirmed');

        return {
          success: true,
          txId: statusCheck.txId,
          confirmed: true,
        };
      }

      return {
        success: true,
        confirmed: false,
        error: 'Payment not yet confirmed on blockchain',
      };

    } catch (error) {
      console.error('Bitcoin payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bitcoin payment failed',
      };
    }
  }

  /**
   * Process sBTC payment using SbtcService
   */
  private async processSbtcPaymentWithWallet(payment: any, walletAuth: any): Promise<{
    success: boolean;
    txId?: string;
    confirmed?: boolean;
    error?: string;
  }> {
    try {
      // Use SbtcService to handle sBTC operations
      const statusCheck = await this.checkSbtcPaymentStatus(payment);
      
      if (statusCheck.confirmed) {
        await this.updatePaymentStatus(payment._id.toString(), 'confirmed', {
          txId: statusCheck.txId,
          confirmedAt: new Date(),
          blockHeight: statusCheck.blockHeight,
          confirmations: statusCheck.confirmations,
        });

        // Send webhook notification
        await webhookService.triggerWebhook(payment, 'confirmed');

        return {
          success: true,
          txId: statusCheck.txId,
          confirmed: true,
        };
      }

      return {
        success: true,
        confirmed: false,
        error: 'sBTC payment not yet confirmed',
      };

    } catch (error) {
      console.error('sBTC payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'sBTC payment failed',
      };
    }
  }

  /**
   * Generate wallet challenge message for authentication
   */
  generateWalletChallenge(
    address: string,
    walletType: 'stacks' | 'bitcoin',
    paymentId?: string,
    amount?: number
  ): string {
    return multiWalletAuthService.generateWalletChallenge(address, walletType, paymentId, amount);
  }

  /**
   * Get supported wallets for payment options
   */
  getSupportedWallets() {
    return multiWalletAuthService.getSupportedWallets();
  }

  /**
   * Generate payment address using specialized services
   */
  private async generatePaymentAddress(
    method: string,
    merchant: any,
    amount: number
  ): Promise<{ success: boolean; address?: string; details?: any; error?: string }> {
    try {
      switch (method) {
        case 'sbtc':
          // Use SbtcService for sBTC deposit address generation
          const sbtcResult = await sbtcService.createDepositAddress({
            stacksAddress: merchant.walletSetup?.stacksAddress || merchant.stacksAddress,
            amountSats: Math.round(amount * 100000000),
          });
          return {
            success: true,
            address: sbtcResult.depositAddress,
            details: {
              depositAddress: sbtcResult.depositAddress,
              depositScript: sbtcResult.depositScript,
              stacksAddress: sbtcResult.stacksAddress,
            },
          };

        case 'btc':
          // Generate Bitcoin address (keep existing logic for now)
          const btcAddress = await this.generateBitcoinAddress();
          return {
            success: true,
            address: btcAddress.address,
            details: {
              address: btcAddress.address,
              privateKey: btcAddress.privateKey,
              publicKey: btcAddress.publicKey,
            },
          };

        case 'stx':
          // Use merchant's Stacks address for STX payments
          if (!merchant.walletSetup?.stacksAddress && !merchant.stacksAddress) {
            return { success: false, error: 'Merchant must configure Stacks wallet for STX payments' };
          }
          const stacksAddress = merchant.walletSetup?.stacksAddress || merchant.stacksAddress;
          
          // Simple address validation (Stacks addresses start with SP or SM)
          if (!stacksAddress.match(/^S[PM][0-9A-Z]{39}$/)) {
            return { success: false, error: 'Invalid Stacks address configured for merchant' };
          }
          
          return {
            success: true,
            address: stacksAddress,
            details: { address: stacksAddress },
          };

        default:
          return { success: false, error: `Unsupported payment method: ${method}` };
      }
    } catch (error) {
      console.error('Address generation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Address generation failed' 
      };
    }
  }

  /**
   * Generate Bitcoin address
   */
  private async generateBitcoinAddress(): Promise<{
    address: string;
    privateKey: string;
    publicKey: string;
  }> {
    const bitcoin = require('bitcoinjs-lib');
    const ECPair = require('ecpair');
    const tinysecp = require('tiny-secp256k1');
    
    const ECPairFactory = ECPair.ECPairFactory(tinysecp);
    const network = process.env.NODE_ENV === 'production' 
      ? bitcoin.networks.bitcoin 
      : bitcoin.networks.testnet;
    
    const keyPair = ECPairFactory.makeRandom();
    const { address } = bitcoin.payments.p2wpkh({ 
      pubkey: keyPair.publicKey, 
      network 
    });
    
    return {
      address: address!,
      privateKey: keyPair.toWIF(),
      publicKey: keyPair.publicKey.toString('hex'),
    };
  }

  /**
   * Generate QR code for payment
   */
  private async generatePaymentQR(method: string, address: string, amount: number): Promise<string> {
    const QRCode = require('qrcode');
    
    let qrData: string;
    
    switch (method) {
      case 'btc':
      case 'sbtc':
        qrData = `bitcoin:${address}?amount=${amount}`;
        break;
      case 'stx':
        qrData = `stacks:${address}?amount=${amount}`;
        break;
      default:
        qrData = address;
    }
    
    return await QRCode.toDataURL(qrData);
  }

  /**
   * Generate payment instructions
   */
  private generatePaymentInstructions(method: string, address: string, amount: number) {
    const instructions = {
      sbtc: {
        title: 'sBTC Payment Instructions',
        steps: [
          'Send Bitcoin to the deposit address below',
          'The Bitcoin will be automatically converted to sBTC',
          'Payment will be confirmed once sBTC is minted',
          'Network confirmation time: 10-20 minutes',
        ],
        address,
        amount: `${amount} BTC`,
        note: 'Send the exact amount to ensure proper processing',
      },
      btc: {
        title: 'Bitcoin Payment Instructions',
        steps: [
          'Send Bitcoin to the address below',
          'Include appropriate network fees',
          'Payment will be confirmed after 1 block confirmation',
          'Network confirmation time: 10-20 minutes',
        ],
        address,
        amount: `${amount} BTC`,
        note: 'Minimum confirmations required: 1',
      },
      stx: {
        title: 'Stacks (STX) Payment Instructions',
        steps: [
          'Send STX to the address below',
          'Use your Stacks wallet (Hiro, Xverse, etc.)',
          'Payment will be confirmed after block confirmation',
          'Network confirmation time: 10 minutes',
        ],
        address,
        amount: `${amount} STX`,
        note: 'Ensure you have enough STX for network fees',
      },
    };

    return instructions[method as keyof typeof instructions];
  }

  /**
   * Check sBTC payment status using SbtcService
   */
  private async checkSbtcPaymentStatus(payment: any) {
    try {
      // Use SbtcService to get UTXO information
      const utxos = await sbtcService.getUtxos(payment.paymentAddress);
      const targetAmount = payment.paymentAmount * 100000000; // Convert to satoshis
      
      let confirmedAmount = 0;
      let latestTxId = null;
      let blockHeight = null;
      let confirmations = 0;

      for (const utxo of utxos) {
        if (utxo.confirmations >= 1) {
          confirmedAmount += utxo.value;
          
          if (!latestTxId || utxo.height > blockHeight) {
            latestTxId = utxo.txid;
            blockHeight = utxo.height;
            confirmations = utxo.confirmations;
          }
        }
      }

      const confirmed = confirmedAmount >= targetAmount;

      if (confirmed && latestTxId) {
        // Use SbtcService to get transaction status
        const sbtcStatus = await sbtcService.getTransactionStatus(latestTxId);
        return {
          confirmed: sbtcStatus.status === 'confirmed',
          txId: latestTxId,
          blockHeight,
          confirmations,
        };
      }

      return { confirmed: false, txId: latestTxId, blockHeight, confirmations };
    } catch (error) {
      console.error('Error checking sBTC payment status:', error);
      return { confirmed: false, error: error instanceof Error ? error.message : 'Status check failed' };
    }
  }

  /**
   * Check Bitcoin payment status using SbtcService
   */
  private async checkBtcPaymentStatus(payment: any) {
    try {
      // Use SbtcService to get UTXO information (it handles Bitcoin APIs)
      const utxos = await sbtcService.getUtxos(payment.paymentAddress);
      const targetAmount = payment.paymentAmount * 100000000; // Convert to satoshis
      
      let confirmedAmount = 0;
      let latestTxId = null;
      let blockHeight = null;
      let confirmations = 0;

      for (const utxo of utxos) {
        if (utxo.confirmations >= 1) {
          confirmedAmount += utxo.value;
          
          if (!latestTxId || utxo.height > blockHeight) {
            latestTxId = utxo.txid;
            blockHeight = utxo.height;
            confirmations = utxo.confirmations;
          }
        }
      }

      return {
        confirmed: confirmedAmount >= targetAmount,
        txId: latestTxId,
        blockHeight,
        confirmations,
      };
    } catch (error) {
      console.error('Error checking Bitcoin payment status:', error);
      return { confirmed: false, error: error instanceof Error ? error.message : 'Status check failed' };
    }
  }

  /**
   * Check STX payment status using API calls
   */
  private async checkStxPaymentStatus(payment: any) {
    try {
      // For STX payments, we need to check the API directly since WalletService 
      // getStxBalance() doesn't take address parameters (it's for connected wallets)
      const response = await fetch(
        `https://api.${process.env.STACKS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'}.stacks.co/extended/v1/address/${payment.paymentAddress}/transactions?limit=20`
      );
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      const transactions = data.results || [];
      const targetAmount = payment.paymentAmount * 1000000; // Convert to microSTX
      
      let confirmedAmount = 0;
      let latestTxId = null;
      let blockHeight = null;
      let confirmations = 0;

      // Check recent transactions for STX transfers to this address
      for (const tx of transactions) {
        if (tx.tx_status === 'success' && tx.tx_type === 'token_transfer') {
          // Check if this transaction is TO our payment address
          if (tx.token_transfer.recipient_address === payment.paymentAddress) {
            const amount = parseInt(tx.token_transfer.amount);
            confirmedAmount += amount;
            
            if (!latestTxId || tx.block_height > blockHeight) {
              latestTxId = tx.tx_id;
              blockHeight = tx.block_height;
              confirmations = tx.confirmations || 0;
            }
          }
        }
      }

      return {
        confirmed: confirmedAmount >= targetAmount,
        txId: latestTxId,
        blockHeight,
        confirmations,
      };
    } catch (error) {
      console.error('Error checking STX payment status:', error);
      return { confirmed: false, error: error instanceof Error ? error.message : 'Status check failed' };
    }
  }
}

export const paymentService = new PaymentService();
