import { connectToDatabase } from '@/config/database';
import { conversionService } from './conversion-service';
import { webhookService } from './webhook-service';
import { signatureVerificationService } from './signature-verification-service';
import { sbtcService } from './sbtc-service';
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
   * Normalize currency names to match conversion service expectations
   */
  private normalizeCurrency(currency: string): string {
    if (!currency) {
      return 'BTC'; // Default fallback
    }
    const normalized = currency.toLowerCase();
    switch (normalized) {
      case 'sbtc':
        return 'sBTC';
      case 'btc':
        return 'BTC';
      case 'stx':
        return 'STX';
      case 'usd':
        return 'USD';
      case 'usdc':
        return 'USDC';
      case 'usdt':
        return 'USDT';
      case 'eth':
        return 'ETH';
      default:
        return currency.toUpperCase();
    }
  }

  /**
   * Normalize payment method to match Payment model enum values
   */
  private normalizePaymentMethod(paymentMethod: string): string {
    if (!paymentMethod) {
      return 'bitcoin'; // Default fallback
    }
    const normalized = paymentMethod.toLowerCase();
    switch (normalized) {
      case 'btc':
        return 'bitcoin';
      case 'stx':
        return 'stx';
      case 'sbtc':
        return 'sbtc';
      default:
        return normalized;
    }
  }

  /**
   * Normalize payout method to match expected values
   */
  private normalizePayoutMethod(payoutMethod: string): string {
    if (!payoutMethod) {
      return 'usd'; // Default fallback
    }
    const normalized = payoutMethod.toLowerCase();
    switch (normalized) {
      case 'sbtc':
        return 'sbtc';
      case 'usd':
        return 'usd';
      case 'usdc':
        return 'usdc';
      case 'usdt':
        return 'usdt';
      default:
        return normalized;
    }
  }

  /**
   * Get customer wallet type based on payment method
   */
  private getCustomerWalletType(paymentMethod: string): string {
    if (!paymentMethod) {
      return 'stacks'; // Default fallback
    }
    const normalized = paymentMethod.toLowerCase();
    switch (normalized) {
      case 'btc':
        return 'bitcoin';
      case 'stx':
      case 'sbtc':
        return 'stacks';
      default:
        return 'stacks';
    }
  }

  /**
   * Get required confirmations based on payment method
   */
  private getRequiredConfirmations(paymentMethod: string): number {
    if (!paymentMethod) {
      return 1; // Default fallback
    }
    const normalized = paymentMethod.toLowerCase();
    switch (normalized) {
      case 'btc':
        return 1;
      case 'stx':
        return 1;
      case 'sbtc':
        return 1;
      default:
        return 1;
    }
  }

  /**
   * Create a new payment request
   */
  async createPayment(options: CreatePaymentOptions): Promise<PaymentResult> {
    await connectToDatabase();

    try {
      console.log('PaymentService.createPayment called with options:', options);
      
      // Get merchant details
      const merchant = await Merchant.findById(options.merchantId);
      if (!merchant) {
        console.log('Merchant not found:', options.merchantId);
        return { success: false, error: 'Merchant not found' };
      }
      
      console.log('Merchant found:', merchant._id, merchant.businessName);

      // Calculate customer payment conversion using ConversionService
      // Skip conversion if currency and payment method are the same
      console.log('Starting currency conversion check');
      let paymentConversion;
      const fromCurrency = this.normalizeCurrency(options.currency);
      const toCurrency = this.normalizeCurrency(options.paymentMethod);
      
      console.log('Normalized currencies:', { fromCurrency, toCurrency });
      
      if (fromCurrency === toCurrency) {
        // No conversion needed - same currency
        console.log('Skipping conversion - same currency');
        paymentConversion = {
          success: true,
          fromAmount: options.amount,
          fromCurrency,
          toAmount: options.amount,
          toCurrency,
          rate: 1,
          fees: {
            conversion: 0,
            network: 0,
            total: 0
          }
        };
      } else {
        console.log('Different currencies - performing conversion');
        paymentConversion = await conversionService.convertCurrency(
          options.amount,
          fromCurrency,
          toCurrency
        );
        
        if (!paymentConversion.success) {
          return { success: false, error: 'Payment currency conversion failed' };
        }
      }

      console.log('Payment conversion completed:', paymentConversion);

      // Calculate merchant payout conversion (payment method to payout method)
      // Skip conversion if payment method and payout method are the same
      console.log('Starting payout conversion check');
      let payoutConversion;
      const paymentMethodCurrency = paymentConversion.toCurrency;
      const payoutMethodCurrency = this.normalizeCurrency(options.payoutMethod);
      
      console.log('Payout currencies:', { paymentMethodCurrency, payoutMethodCurrency });
      
      if (paymentMethodCurrency === payoutMethodCurrency) {
        // No conversion needed - same currency
        payoutConversion = {
          success: true,
          fromAmount: paymentConversion.toAmount,
          fromCurrency: paymentMethodCurrency,
          toAmount: paymentConversion.toAmount,
          toCurrency: payoutMethodCurrency,
          rate: 1,
          fees: {
            conversion: 0,
            network: 0,
            total: 0
          }
        };
      } else {
        console.log('Performing payout conversion from', paymentConversion.toCurrency, 'to', payoutMethodCurrency);
        try {
          payoutConversion = await conversionService.convertCurrency(
            paymentConversion.toAmount,
            paymentConversion.toCurrency,
            payoutMethodCurrency
          );

          console.log('Payout conversion result:', payoutConversion);
          
          if (!payoutConversion.success) {
            console.log('Payout conversion failed');
            return { success: false, error: 'Payout currency conversion failed' };
          }
        } catch (conversionError) {
          console.log('Payout conversion threw error:', conversionError);
          return { 
            success: false, 
            error: `Payout currency conversion failed: ${conversionError instanceof Error ? conversionError.message : conversionError}` 
          };
        }
      }

      console.log('Payout conversion completed:', payoutConversion);

      // Generate payment address using specialized services
      console.log('Generating payment address for method:', options.paymentMethod);
      const addressResult = await this.generatePaymentAddress(
        options.paymentMethod,
        merchant,
        paymentConversion.toAmount
      );

      console.log('Address generation result:', addressResult);
      
      if (!addressResult.success) {
        console.log('Address generation failed:', addressResult.error);
        return { success: false, error: addressResult.error };
      }

      // Calculate total fees (payment + payout conversions)
      const totalFees = {
        conversion: paymentConversion.fees.conversion + payoutConversion.fees.conversion,
        network: paymentConversion.fees.network + payoutConversion.fees.network,
        total: paymentConversion.fees.total + payoutConversion.fees.total,
      };

      // Create payment record with model-compliant data
      const payment = new Payment({
        merchantId: options.merchantId,
        amount: options.amount,
        currency: options.currency,
        paymentMethod: this.normalizePaymentMethod(options.paymentMethod), // Convert btc→bitcoin
        merchantReceivesCurrency: this.normalizePayoutMethod(options.payoutMethod), // Convert sbtc→sbtc  
        customerWalletType: this.getCustomerWalletType(options.paymentMethod), // Required field
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: this.getRequiredConfirmations(options.paymentMethod),
        expiresAt: options.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000),
        metadata: options.metadata || {},
        customerInfo: options.customerInfo || {},
        // Store conversion data in metadata for reference
        exchangeRate: {
          btcToUsd: paymentConversion.rate * (paymentConversion.fromCurrency === 'BTC' ? 45000 : 1),
          timestamp: new Date(),
        },
        conversionFee: totalFees.total,
        // Store payment address details in the appropriate section with full sBTC integration
        ...(options.paymentMethod === 'btc' && {
          bitcoin: {
            depositAddress: addressResult.address, // Real Bitcoin deposit address
            depositScript: addressResult.details?.depositScript,
            reclaimScript: addressResult.details?.reclaimScript,
            signerPublicKey: addressResult.details?.signerPublicKey,
            targetStacksAddress: addressResult.details?.stacksAddress, // Where sBTC will be sent
          }
        }),
        ...(options.paymentMethod === 'stx' && {
          stx: {
            toAddress: addressResult.address,
          }
        }),
        ...(options.paymentMethod === 'sbtc' && {
          sbtc: {
            depositAddress: addressResult.address,
          }
        }),
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

      // Start payment monitoring for real-time status updates
      this.startPaymentMonitoring(payment._id.toString());

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

      if (payment) {
        const paymentObj = payment.toObject();
        return {
          ...paymentObj,
          id: paymentObj._id.toString(),
        };
      }

      return null;
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

      // Transform MongoDB documents to include 'id' field for frontend compatibility
      const transformedPayments = payments.map(payment => {
        const paymentObj = payment.toObject();
        return {
          ...paymentObj,
          id: paymentObj._id.toString(),
        };
      });

      const total = await Payment.countDocuments(query);

      return {
        payments: transformedPayments,
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
      // Use SignatureVerificationService for wallet verification
      const authResult = await signatureVerificationService.verifyPaymentAuthorization({
        address: authRequest.address,
        signature: authRequest.signature,
        message: authRequest.message,
        publicKey: authRequest.publicKey,
        walletType: authRequest.walletType,
        paymentId: authRequest.paymentId,
        amount: authRequest.amount,
      });
      
      return {
        success: authResult.success,
        verified: authResult.verified,
        walletType: authResult.walletType,
        paymentMethod: authResult.paymentMethod,
        error: authResult.error,
      };
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
    return signatureVerificationService.generatePaymentChallenge(address, walletType, paymentId || '', amount || 0);
  }

  /**
   * Get supported wallets for payment options
   */
  getSupportedWallets() {
    return signatureVerificationService.getSupportedWallets();
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
          // Check multiple possible locations for sBTC address
          let sbtcAddress = 
            merchant.walletSetup?.sBTCWallet?.address || 
            merchant.connectedWallets?.stacksAddress || 
            merchant.stacksAddress;
          
          // For demo purposes, use a default testnet address if none configured
          if (!sbtcAddress) {
            console.log('⚠️  Warning: Merchant has no sBTC address configured, using demo address');
            sbtcAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Demo testnet address
          }
          
          return {
            success: true,
            address: sbtcAddress,
            details: {
              paymentAddress: sbtcAddress,
              stacksAddress: sbtcAddress,
              amount: amount,
              method: 'sbtc',
              isDemo: !merchant.stacksAddress // Flag to indicate this is a demo setup
            },
          };

        case 'btc':
          // For BTC payments, generate a real Bitcoin deposit address using sBTC service
          let btcStacksAddress = 
            merchant.connectedWallets?.stacksAddress || 
            merchant.stacksAddress;
          
          // For demo purposes, use a default testnet address if none configured
          if (!btcStacksAddress) {
            console.log('⚠️  Warning: Merchant has no Stacks address configured for BTC payments, using demo address');
            btcStacksAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Demo testnet address
          }
          
          try {
            // Use real sBTC service to generate Bitcoin deposit address
            const depositResult = await sbtcService.createBitcoinDepositAddress({
              stacksAddress: btcStacksAddress,
              amountSats: Math.floor(amount * 100000000), // Convert BTC to satoshis
            });
            
            if (!depositResult.success) {
              return { success: false, error: depositResult.error || 'Failed to generate Bitcoin deposit address' };
            }
            
            return {
              success: true,
              address: depositResult.depositAddress!, // Real Bitcoin address for customer to send to
              details: {
                ...depositResult.details,
                bitcoinDepositAddress: depositResult.depositAddress,
                stacksAddress: btcStacksAddress, // Where sBTC will be sent after conversion
                amount: amount,
                method: 'btc',
                note: 'Send Bitcoin to this address and receive sBTC automatically'
              },
            };
          } catch (error) {
            console.error('Error generating Bitcoin deposit address:', error);
            return { success: false, error: 'Failed to generate Bitcoin deposit address' };
          }

        case 'stx':
          // Use merchant's Stacks address for STX payments
          let stxStacksAddress = 
            merchant.connectedWallets?.stacksAddress || 
            merchant.stacksAddress;
          
          // For demo purposes, use a default testnet address if none configured
          if (!stxStacksAddress) {
            console.log('⚠️  Warning: Merchant has no Stacks address configured for STX payments, using demo address');
            stxStacksAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Demo testnet address
          }
          
          return {
            success: true,
            address: stxStacksAddress,
            details: { 
              address: stxStacksAddress,
              isDemo: !merchant.stacksAddress // Flag to indicate this is a demo setup
            },
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
   * Generate payment monitoring and status updates
   */
  async startPaymentMonitoring(paymentId: string): Promise<void> {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        console.error('Payment not found for monitoring:', paymentId);
        return;
      }

      // For Bitcoin payments, monitor the deposit address
      if (payment.paymentMethod === 'bitcoin' && payment.bitcoin?.depositAddress) {
        this.monitorBitcoinDeposit(paymentId, payment.bitcoin.depositAddress);
      }
      
      // For STX payments, monitor the Stacks address
      if (payment.paymentMethod === 'stx' && payment.stx?.toAddress) {
        this.monitorStacksTransaction(paymentId, payment.stx.toAddress);
      }
      
      // For sBTC payments, monitor the sBTC address
      if (payment.paymentMethod === 'sbtc' && payment.sbtc?.depositAddress) {
        this.monitorSbtcTransaction(paymentId, payment.sbtc.depositAddress);
      }
    } catch (error) {
      console.error('Error starting payment monitoring:', error);
    }
  }

  /**
   * Monitor Bitcoin deposit for sBTC conversion
   */
  private async monitorBitcoinDeposit(paymentId: string, depositAddress: string): Promise<void> {
    const checkDeposit = async () => {
      try {
        const depositStatus = await sbtcService.checkDepositStatus(depositAddress);
        const payment = await Payment.findById(paymentId);
        
        if (!payment) return;

        if (depositStatus.status === 'confirmed' && payment.status === 'pending') {
          // Update payment status
          payment.status = 'processing';
          payment.confirmations = depositStatus.confirmations;
          payment.blockchainData = {
            txId: depositStatus.txid || '',
            confirmations: depositStatus.confirmations,
            timestamp: new Date().toISOString(),
            amount: depositStatus.amount || 0,
            blockHeight: depositStatus.blockHeight
          };
          
          await payment.save();

          // Notify sBTC signers if we have the deposit details
          if (depositStatus.txid && payment.bitcoin?.depositScript) {
            await sbtcService.notifyDeposit({
              txid: depositStatus.txid,
              depositScript: payment.bitcoin.depositScript,
              reclaimScript: payment.bitcoin.reclaimScript || '',
            });
          }

          // Send webhook notification if configured
          try {
            await webhookService.triggerWebhook(payment, 'payment.confirmed');
          } catch (webhookError) {
            console.error('Webhook notification failed:', webhookError);
          }
          
          console.log(`Bitcoin deposit confirmed for payment ${paymentId}`);
        }
      } catch (error) {
        console.error('Error monitoring Bitcoin deposit:', error);
      }
    };

    // Check immediately and then every 30 seconds
    checkDeposit();
    const interval = setInterval(checkDeposit, 30000);
    
    // Stop monitoring after 24 hours
    setTimeout(() => clearInterval(interval), 24 * 60 * 60 * 1000);
  }

  /**
   * Monitor Stacks transactions
   */
  private async monitorStacksTransaction(paymentId: string, address: string): Promise<void> {
    // Implementation for monitoring STX transactions
    console.log(`Monitoring STX transaction for payment ${paymentId} at address ${address}`);
  }

  /**
   * Monitor sBTC transactions
   */
  private async monitorSbtcTransaction(paymentId: string, address: string): Promise<void> {
    // Implementation for monitoring sBTC transactions
    console.log(`Monitoring sBTC transaction for payment ${paymentId} at address ${address}`);
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
        // Bitcoin URI scheme for wallet compatibility
        qrData = `bitcoin:${address}?amount=${amount / 100000000}`; // Convert satoshis to BTC
        break;
      case 'stx':
        // Stacks payment URI
        qrData = `stacks:${address}?amount=${amount / 1000000}`; // Convert microSTX to STX
        break;
      default:
        qrData = address;
    }
    
    return await QRCode.toDataURL(qrData, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
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
