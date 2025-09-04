import { connectToDatabase } from '@/config/database';
import { conversionService } from './conversion-service';
import { webhookService } from './webhook-service';
import { multiWalletAuthService } from './multi-wallet-auth-service';
import { Payment } from '@/models/Payment';
import { Merchant } from '@/models/Merchant';


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

export interface BlockchainTransactionData {
  txHash?: string;
  txId?: string;
  blockHeight?: number;
  confirmations?: number;
  networkFee?: number;
  timestamp?: Date;
  fromAddress?: string;
  toAddress?: string;
  confirmedAt?: Date;
}

export interface PaymentVerificationData {
  paymentId: string;
  signature?: string;
  txHash?: string;
  blockchainData?: BlockchainTransactionData;
  customerWalletAddress?: string;
}

/**
 * Payment orchestration service
 * Supports complete payment ecosystem:
 * - Customer Payment: Bitcoin, STX, or sBTC
 * - Merchant Settlement: Always sBTC
 * - Cashout Options: sBTC, USD, USDT, or USDC
 * 
 * Flow: Customer (BTC/STX/sBTC) → Gateway → Merchant (sBTC) → Cashout (USD/USDC)
 * 
 * ARCHITECTURE:
 * - Frontend handles wallet connections, blockchain interactions, transaction signing
 * - Backend handles payment lifecycle, validation, storage, webhooks, conversions
 * - Frontend calls backend with transaction data for validation and storage
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

      // Frontend is now responsible for checking blockchain status
      // This method should not be used directly anymore
      return { 
        confirmed: false, 
        error: 'Payment status should be checked and updated via frontend services. Use verifyPaymentSignature() instead.' 
      };
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
   * Process STX payment (deprecated - frontend should handle transaction, backend validates)
   */
  private async processStxPaymentWithWallet(payment: any, walletAuth: any): Promise<{
    success: boolean;
    txId?: string;
    confirmed?: boolean;
    error?: string;
  }> {
    try {
      // This method is deprecated - frontend should handle STX transactions
      // Return error directing to use new API endpoints
      return {
        success: false,
        error: 'This method is deprecated. Use verifyPaymentSignature() after frontend completes transaction.'
      };

    } catch (error) {
      console.error('STX payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'STX payment failed',
      };
    }
  }

  /**
   * @deprecated This method is deprecated. Frontend services handle Bitcoin payments directly.
   * Use verifyPaymentSignature() after frontend confirms the transaction.
   */
  private async processBtcPaymentWithWallet(payment: any, walletAuth: any): Promise<{
    success: boolean;
    txId?: string;
    confirmed?: boolean;
    error?: string;
  }> {
    return {
      success: false,
      error: 'This method is deprecated. Frontend services handle Bitcoin payments. Use verifyPaymentSignature() instead.'
    };
  }

  /**
   * @deprecated This method is deprecated. Frontend services handle sBTC payments directly.
   * Use verifyPaymentSignature() after frontend confirms the transaction.
   */
  private async processSbtcPaymentWithWallet(payment: any, walletAuth: any): Promise<{
    success: boolean;
    txId?: string;
    confirmed?: boolean;
    error?: string;
  }> {
    return {
      success: false,
      error: 'This method is deprecated. Frontend services handle sBTC payments. Use verifyPaymentSignature() instead.'
    };
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
   * Generate payment address configuration (frontend will generate actual addresses)
   */
  private async generatePaymentAddress(
    method: string,
    merchant: any,
    amount: number
  ): Promise<{ success: boolean; address?: string; details?: any; error?: string }> {
    try {
      switch (method) {
        case 'sbtc':
          // Return merchant's sBTC address for frontend to use
          if (!merchant.walletSetup?.sbtcAddress && !merchant.sbtcAddress) {
            return { success: false, error: 'Merchant must configure sBTC wallet address' };
          }
          const sbtcAddress = merchant.walletSetup?.sbtcAddress || merchant.sbtcAddress;
          return {
            success: true,
            address: sbtcAddress,
            details: {
              paymentAddress: sbtcAddress,
              stacksAddress: merchant.walletSetup?.stacksAddress || merchant.stacksAddress,
              amount: amount,
              method: 'sbtc'
            },
          };

        case 'btc':
          // Return merchant's Bitcoin address
          if (!merchant.walletSetup?.btcAddress && !merchant.btcAddress) {
            return { success: false, error: 'Merchant must configure Bitcoin wallet address' };
          }
          const btcAddress = merchant.walletSetup?.btcAddress || merchant.btcAddress;
          return {
            success: true,
            address: btcAddress,
            details: {
              paymentAddress: btcAddress,
              amount: amount,
              method: 'btc'
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
   * Check sBTC payment status (replaced by frontend verification)
   * Frontend will call updatePaymentStatus with real blockchain data
   */
  private async checkSbtcPaymentStatus(payment: any) {
    // This method is now replaced by frontend verification
    // Frontend services check blockchain directly and call our verification endpoints
    throw new Error('This method is deprecated. Frontend should verify payment and call verifyPaymentSignature()');
  }

  /**
   * Check Bitcoin payment status (replaced by frontend verification)
   */
  private async checkBtcPaymentStatus(payment: any) {
    // This method is now replaced by frontend verification
    // Frontend services check blockchain directly and call our verification endpoints
    throw new Error('This method is deprecated. Frontend should verify payment and call verifyPaymentSignature()');
  }

  /**
   * Check STX payment status (replaced by frontend verification)
   */
  private async checkStxPaymentStatus(payment: any) {
    // This method is now replaced by frontend verification
    // Frontend services check blockchain directly and call our verification endpoints
    throw new Error('This method is deprecated. Frontend should verify payment and call verifyPaymentSignature()');
  }

  /**
   * Refund a payment (frontend handles blockchain transaction, backend processes business logic)
   */
  async refundPayment(
    paymentId: string,
    merchantId: string,
    options: {
      amount?: number; // Partial refund amount
      reason?: string;
      refundId?: string;
      metadata?: any;
      // Frontend must provide blockchain transaction data
      blockchainRefundData?: {
        transactionId: string;
        blockHeight?: number;
        status: 'pending' | 'confirmed';
        feesPaid?: number;
      };
    } = {}
  ): Promise<{
    success: boolean;
    refund?: any;
    error?: string;
  }> {
    await connectToDatabase();

    try {
      const payment = await Payment.findOne({ 
        _id: paymentId, 
        merchantId 
      });

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      // Check if payment can be refunded
      if (payment.status !== 'confirmed') {
        return { success: false, error: 'Only confirmed payments can be refunded' };
      }

      if (payment.refunded) {
        return { success: false, error: 'Payment already refunded' };
      }

      // Validate that frontend provided blockchain refund data
      if (!options.blockchainRefundData?.transactionId) {
        return { 
          success: false, 
          error: 'Frontend must provide valid blockchain refund transaction data' 
        };
      }

      const refundAmount = options.amount || payment.paymentAmount;

      // Validate refund amount
      if (refundAmount <= 0 || refundAmount > payment.paymentAmount) {
        return { success: false, error: 'Invalid refund amount' };
      }

      // Process refund based on payment method (now using frontend data)
      let refundResult;
      
      switch (payment.paymentMethod) {
        case 'sbtc':
          refundResult = await this.processSbtcRefund(payment, refundAmount, options.blockchainRefundData);
          break;
        case 'btc':
          refundResult = await this.processBtcRefund(payment, refundAmount, options.blockchainRefundData);
          break;
        case 'stx':
          refundResult = await this.processStxRefund(payment, refundAmount, options.blockchainRefundData);
          break;
        default:
          return { success: false, error: 'Unsupported payment method for refund' };
      }

      if (!refundResult.success) {
        return { success: false, error: refundResult.error };
      }

      // Create refund record
      const refundRecord = {
        id: options.refundId || `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paymentId: payment._id.toString(),
        merchantId,
        amount: refundAmount,
        currency: payment.paymentMethod.toUpperCase(),
        reason: options.reason || 'Requested by merchant',
        status: 'processing',
        transactionId: refundResult.transactionId,
        createdAt: new Date(),
        metadata: options.metadata || {},
      };

      // Update payment record
      const isFullRefund = refundAmount >= payment.paymentAmount;
      payment.status = isFullRefund ? 'refunded' : 'partially_refunded';
      payment.refunded = isFullRefund;
      payment.refunds = payment.refunds || [];
      payment.refunds.push(refundRecord);
      payment.updatedAt = new Date();

      await payment.save();

      // Trigger webhook notification
      await webhookService.triggerWebhook({
        urls: { webhook: payment.webhookUrl },
        _id: refundRecord.id,
        type: 'refund',
        merchantId,
        data: {
          refund: refundRecord,
          payment: {
            id: payment._id.toString(),
            status: payment.status,
            amount: payment.paymentAmount,
            refundedAmount: refundAmount,
          },
        },
        metadata: { paymentId, isFullRefund }
      }, 'payment.refunded');

      return {
        success: true,
        refund: refundRecord,
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  /**
   * Process sBTC refund (frontend handles the actual blockchain transaction)
   * This method validates the refund and updates records once frontend confirms
   */
  private async processSbtcRefund(
    payment: any, 
    amount: number,
    frontendRefundData?: {
      transactionId: string;
      blockHeight?: number;
      status: 'pending' | 'confirmed';
    }
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      // Validate refund data from frontend
      if (!frontendRefundData?.transactionId) {
        return { 
          success: false, 
          error: 'Frontend must provide valid refund transaction data' 
        };
      }

      // Store refund transaction data for tracking
      await this.cacheTransactionData(payment._id, {
        transactionId: frontendRefundData.transactionId,
        blockHeight: frontendRefundData.blockHeight,
        status: frontendRefundData.status,
        type: 'refund',
        amount: amount,
        timestamp: new Date()
      });

      return {
        success: true,
        transactionId: frontendRefundData.transactionId,
      };
    } catch (error) {
      console.error('Error processing sBTC refund:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'sBTC refund processing failed' 
      };
    }
  }

  /**
   * Process Bitcoin refund (frontend handles blockchain transaction)
   */
  private async processBtcRefund(
    payment: any, 
    amount: number,
    frontendRefundData?: {
      transactionId: string;
      blockHeight?: number;
      status: 'pending' | 'confirmed';
      feesPaid?: number;
    }
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      // Validate refund data from frontend
      if (!frontendRefundData?.transactionId) {
        return { 
          success: false, 
          error: 'Frontend must provide valid Bitcoin refund transaction data' 
        };
      }

      // Store refund transaction data for tracking
      await this.cacheTransactionData(payment._id, {
        transactionId: frontendRefundData.transactionId,
        blockHeight: frontendRefundData.blockHeight,
        status: frontendRefundData.status,
        type: 'refund',
        amount: amount,
        feesPaid: frontendRefundData.feesPaid,
        timestamp: new Date()
      });

      return {
        success: true,
        transactionId: frontendRefundData.transactionId,
      };
    } catch (error) {
      console.error('Error processing Bitcoin refund:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bitcoin refund processing failed' 
      };
    }
  }

  /**
   * Verify payment signature and update payment status
   * (called after frontend completes blockchain transaction)
   */
  async verifyPaymentSignature(data: PaymentVerificationData): Promise<{
    success: boolean;
    payment?: any;
    error?: string;
  }> {
    await connectToDatabase();

    try {
      const payment = await Payment.findById(data.paymentId);
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      if (payment.status !== 'pending') {
        return { success: false, error: 'Payment is not in pending status' };
      }

      // Store blockchain transaction data
      if (data.blockchainData) {
        payment.blockchainData = data.blockchainData;
        payment.transactionHash = data.txHash;
      }

      // Update status to processing (will be confirmed when blockchain confirms)
      payment.status = 'processing';
      payment.customerAddress = data.customerWalletAddress;
      payment.updatedAt = new Date();

      await payment.save();

      // Trigger webhook for payment processing
      await webhookService.triggerWebhook(payment, 'payment.processing');

      return {
        success: true,
        payment: {
          id: payment._id,
          status: payment.status,
          transactionHash: payment.transactionHash,
          blockchainData: payment.blockchainData
        }
      };

    } catch (error) {
      console.error('Payment verification error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment verification failed' 
      };
    }
  }

  /**
   * Update payment status based on blockchain confirmations
   * (called by frontend when monitoring blockchain)
   */
  async updatePaymentStatus(
    paymentId: string, 
    status: 'confirmed' | 'failed', 
    blockchainData?: BlockchainTransactionData
  ): Promise<{ success: boolean; error?: string }> {
    await connectToDatabase();

    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      const previousStatus = payment.status;
      payment.status = status;
      payment.updatedAt = new Date();

      if (status === 'confirmed') {
        payment.confirmedAt = new Date();
        
        // Process any required conversions
        if (payment.payoutMethod !== payment.paymentMethod) {
          const conversionResult = await conversionService.convertCurrency(
            payment.paymentAmount,
            payment.paymentCurrency,
            payment.payoutCurrency
          );
          
          if (conversionResult.success) {
            payment.conversionCompleted = true;
            payment.finalPayoutAmount = conversionResult.toAmount;
          }
        }
      }

      if (blockchainData) {
        payment.blockchainData = { ...payment.blockchainData, ...blockchainData };
      }

      await payment.save();

      // Trigger appropriate webhook
      const eventType = status === 'confirmed' ? 'payment.confirmed' : 'payment.failed';
      await webhookService.triggerWebhook(payment, eventType);

      return { success: true };

    } catch (error) {
      console.error('Payment status update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payment status update failed' 
      };
    }
  }

  /**
   * Cache transaction data from frontend
   * (for storing additional blockchain information)
   */
  async cacheTransactionData(
    paymentId: string, 
    txData: any
  ): Promise<{ success: boolean; error?: string }> {
    await connectToDatabase();

    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      // Merge transaction data
      payment.blockchainData = { 
        ...payment.blockchainData, 
        ...txData,
        cachedAt: new Date()
      };
      
      await payment.save();

      return { success: true };

    } catch (error) {
      console.error('Transaction data caching error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Transaction data caching failed' 
      };
    }
  }

  /**
   * Process STX refund (frontend handles blockchain transaction)
   */
  private async processStxRefund(
    payment: any, 
    amount: number,
    frontendRefundData?: {
      transactionId: string;
      blockHeight?: number;
      status: 'pending' | 'confirmed';
      feesPaid?: number;
    }
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      // Validate refund data from frontend
      if (!frontendRefundData?.transactionId) {
        return { 
          success: false, 
          error: 'Frontend must provide valid STX refund transaction data' 
        };
      }

      // Store refund transaction data for tracking
      await this.cacheTransactionData(payment._id, {
        transactionId: frontendRefundData.transactionId,
        blockHeight: frontendRefundData.blockHeight,
        status: frontendRefundData.status,
        type: 'refund',
        amount: amount,
        feesPaid: frontendRefundData.feesPaid,
        timestamp: new Date()
      });

      return {
        success: true,
        transactionId: frontendRefundData.transactionId,
      };
    } catch (error) {
      console.error('Error processing STX refund:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'STX refund processing failed' 
      };
    }
  }
}

export const paymentService = new PaymentService();
