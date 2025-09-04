import { Request, Response } from 'express';
import { PaymentService } from '@/services/payment-service';
import { createLogger } from '@/utils/logger';
import { 
  PaymentCreateRequest, 
  PaymentUpdateRequest, 
  PaymentListQuery 
} from '@/interfaces/payment.interface';
import * as QRCode from 'qrcode';

const logger = createLogger('PaymentController');

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Payment creation request received', { 
        body: req.body, 
        merchant: req.merchant,
        authHeader: req.headers.authorization?.substring(0, 20) + '...'
      });

      const merchantId = req.merchant?.id;
      if (!merchantId) {
        logger.error('No merchant ID found in request', { merchant: req.merchant });
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const paymentData = {
        merchantId,
        amount: req.body.amount,
        currency: req.body.currency,
        paymentMethod: req.body.paymentMethod,
        payoutMethod: req.body.payoutMethod || 'usd',
        description: req.body.description,
        metadata: req.body.metadata,
        customerInfo: req.body.customerInfo,
        webhookUrl: req.body.webhookUrl,
        successUrl: req.body.successUrl,
        cancelUrl: req.body.cancelUrl,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
        allowedPaymentMethods: req.body.allowedPaymentMethods,
        preferredPaymentMethod: req.body.preferredPaymentMethod,
      };

      const result = await this.paymentService.createPayment(paymentData);

      if (result.success) {
        logger.info('Payment created via API', {
          paymentId: result.payment?.id,
          merchantId,
          amount: paymentData.amount,
          currency: paymentData.currency
        });

        res.status(201).json({
          success: true,
          data: result.payment
        });
      } else {
        logger.error('Payment creation failed in service', { 
          error: result.error, 
          paymentData,
          merchantId 
        });
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Payment creation API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const merchantId = req.merchant?.id;

      const payment = await this.paymentService.getPayment(paymentId, merchantId);

      if (payment) {
        res.json({
          success: true,
          data: payment
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

    } catch (error) {
      logger.error('Get payment API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const merchantId = req.merchant?.id;
      const updateData: PaymentUpdateRequest = req.body;

      if (!updateData.status) {
        res.status(400).json({
          success: false,
          error: 'Status is required for payment update'
        });
        return;
      }

      // Map controller status to service status
      let serviceStatus: 'confirmed' | 'failed';
      switch (updateData.status) {
        case 'completed':
          serviceStatus = 'confirmed';
          break;
        case 'failed':
        case 'cancelled':
          serviceStatus = 'failed';
          break;
        default:
          res.status(400).json({
            success: false,
            error: 'Invalid status. Use: completed, failed, or cancelled'
          });
          return;
      }

      const result = await this.paymentService.updatePaymentStatus(
        paymentId, 
        serviceStatus, 
        updateData.transactionId ? {
          txId: updateData.transactionId,
          confirmations: updateData.confirmations,
          timestamp: new Date()
        } : undefined
      );

      if (result.success) {
        logger.info('Payment updated via API', {
          paymentId,
          merchantId,
          status: updateData.status
        });

        res.json({
          success: true,
          message: 'Payment updated successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Update payment API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async listPayments(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const queryOptions = {
        status: req.query.status as string,
        paymentMethod: req.query.paymentMethod as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        startDate: req.query.startDate ? (req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? (req.query.endDate as string) : undefined,
      };

      const result = await this.paymentService.listPayments(merchantId, queryOptions);

      res.json({
        success: true,
        data: {
          payments: result.payments,
          pagination: result.pagination
        }
      });

    } catch (error) {
      logger.error('List payments API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async cancelPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const merchantId = req.merchant?.id;

      // Validate paymentId
      if (!paymentId || paymentId === 'undefined') {
        logger.error('Invalid payment ID for cancellation:', { paymentId, params: req.params });
        res.status(400).json({
          success: false,
          error: 'Valid payment ID is required'
        });
        return;
      }

      logger.info('Payment cancellation request', { paymentId, merchantId });

      const result = await this.paymentService.updatePaymentStatus(
        paymentId, 
        'failed', // Map cancelled to failed status 
        { 
          timestamp: new Date(),
          fromAddress: merchantId // Include merchant ID for tracking
        }
      );

      if (result.success) {
        logger.info('Payment cancelled via API', {
          paymentId,
          merchantId
        });

        res.json({
          success: true,
          message: 'Payment cancelled successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Cancel payment API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get real-time payment status (public endpoint)
   * This endpoint provides live updates for the checkout page
   */
  async getRealtimePaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      const payment = await this.paymentService.getPayment(paymentId);

      if (payment) {
        // Check for any recent updates
        if (payment.paymentMethod === 'bitcoin' && payment.bitcoin?.depositAddress) {
          // Check Bitcoin deposit status
          const depositStatus = await (await import('../services/sbtc-service')).sbtcService.checkDepositStatus(payment.bitcoin.depositAddress);
          
          // Update payment if status changed
          if (depositStatus.status === 'confirmed' && payment.status === 'pending') {
            // Update payment to confirmed status with blockchain data
            payment.status = 'confirmed';
            payment.confirmations = depositStatus.confirmations;
            payment.blockchainData = {
              txId: depositStatus.txid || '',
              confirmations: depositStatus.confirmations,
              timestamp: new Date().toISOString(),
              amount: depositStatus.amount || 0,
              blockHeight: depositStatus.blockHeight
            };
            
            // Save the updated payment
            await payment.save();
          }
        }

        // Extract payment address based on payment method
        let paymentAddress = '';
        const paymentMethod = payment.paymentMethod || 'bitcoin';
        
        switch (paymentMethod) {
          case 'bitcoin':
          case 'btc':
            paymentAddress = payment.bitcoin?.depositAddress || '';
            break;
          case 'stx':
            paymentAddress = payment.stx?.toAddress || '';
            break;
          case 'sbtc':
            paymentAddress = payment.sbtc?.depositAddress || '';
            break;
          default:
            paymentAddress = payment.bitcoin?.depositAddress || payment.stx?.toAddress || payment.sbtc?.depositAddress || '';
        }

        // Generate QR code for payment address (not checkout URL)
        const qrCodeDataUrl = await QRCode.toDataURL(paymentAddress, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Generate payment instructions
        const displayMethod = paymentMethod.toUpperCase();
        const amount = payment.amount || payment.paymentAmount || 0;
        const currency = payment.currency || payment.paymentCurrency || 'BTC';
        
        const paymentInstructions = {
          title: `Pay with ${displayMethod}`,
          steps: [
            `Send exactly ${amount} ${currency}`,
            `To address: ${paymentAddress}`,
            payment.status === 'pending' ? 'Waiting for your payment...' : 'Processing your payment...',
            payment.status === 'confirmed' ? 'Payment confirmed!' : 'Payment will be automatically verified'
          ],
          amount: `${amount} ${currency}`,
          note: payment.status === 'pending' ? 
            'Make sure to send the exact amount to avoid delays.' :
            payment.status === 'processing' ?
            'Your payment is being processed. This may take a few minutes.' :
            'Payment completed successfully!'
        };

        res.json({
          success: true,
          data: {
            id: payment._id?.toString() || payment.id,
            status: payment.status,
            amount: amount,
            currency: currency,
            paymentMethod: paymentMethod,
            paymentAddress: paymentAddress,
            description: payment.description || 'Payment',
            expiresAt: payment.expiresAt,
            qrCode: qrCodeDataUrl,
            confirmations: payment.confirmations || 0,
            blockchainData: payment.blockchainData,
            merchantInfo: {
              name: payment.merchantId?.businessName || 'StacksPay Merchant',
              logo: payment.merchantId?.logo || null
            },
            paymentInstructions: paymentInstructions,
            lastUpdated: new Date().toISOString()
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

    } catch (error) {
      logger.error('Get realtime payment status API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      const payment = await this.paymentService.getPayment(paymentId);

      if (payment) {
        // Check for any recent updates for real-time status
        if (payment.paymentMethod === 'bitcoin' && payment.bitcoin?.depositAddress) {
          // Check Bitcoin deposit status
          const { sbtcService } = await import('../services/sbtc-service');
          const depositStatus = await sbtcService.checkDepositStatus(payment.bitcoin.depositAddress);
          
          // Update payment if status changed
          if (depositStatus.status === 'confirmed' && payment.status === 'pending') {
            // Update payment to confirmed status with blockchain data
            payment.status = 'confirmed';
            payment.confirmations = depositStatus.confirmations;
            payment.blockchainData = {
              txId: depositStatus.txid || '',
              confirmations: depositStatus.confirmations,
              timestamp: new Date().toISOString(),
              amount: depositStatus.amount || 0,
              blockHeight: depositStatus.blockHeight
            };
            
            // Save the updated payment
            await payment.save();
          }
        }

        // Extract payment address based on payment method
        let paymentAddress = '';
        const paymentMethod = payment.paymentMethod || 'bitcoin';
        
        switch (paymentMethod) {
          case 'bitcoin':
          case 'btc':
            paymentAddress = payment.bitcoin?.depositAddress || '';
            break;
          case 'stx':
            paymentAddress = payment.stx?.toAddress || '';
            break;
          case 'sbtc':
            paymentAddress = payment.sbtc?.depositAddress || '';
            break;
          default:
            paymentAddress = payment.bitcoin?.depositAddress || payment.stx?.toAddress || payment.sbtc?.depositAddress || '';
        }

        // Generate QR code for payment address (not checkout URL)
        const qrCodeDataUrl = await QRCode.toDataURL(paymentAddress, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        // Generate payment instructions
        const displayMethod = paymentMethod.toUpperCase();
        const amount = payment.amount || payment.paymentAmount || 0;
        const currency = payment.currency || payment.paymentCurrency || 'BTC';
        
        const paymentInstructions = {
          title: `Pay with ${displayMethod}`,
          steps: [
            `Send exactly ${amount} ${currency}`,
            `To address: ${paymentAddress}`,
            payment.status === 'pending' ? 'Waiting for your payment...' : 'Processing your payment...',
            payment.status === 'confirmed' ? 'Payment confirmed!' : 'Payment will be automatically verified'
          ],
          amount: `${amount} ${currency}`,
          note: payment.status === 'pending' ? 
            'Make sure to send the exact amount to avoid delays.' :
            payment.status === 'processing' ?
            'Your payment is being processed. This may take a few minutes.' :
            'Payment completed successfully!'
        };

        res.json({
          success: true,
          data: {
            id: payment._id?.toString() || payment.id,
            status: payment.status,
            amount: amount,
            currency: currency,
            paymentMethod: paymentMethod,
            paymentAddress: paymentAddress,
            description: payment.description || 'Payment',
            expiresAt: payment.expiresAt,
            qrCode: qrCodeDataUrl,
            confirmations: payment.confirmations || 0,
            blockchainData: payment.blockchainData,
            merchantInfo: {
              name: payment.merchantId?.businessName || 'StacksPay Merchant',
              logo: payment.merchantId?.logo || null
            },
            paymentInstructions: paymentInstructions,
            lastUpdated: new Date().toISOString()
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

    } catch (error) {
      logger.error('Get payment status API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { signature, blockchainData, customerWalletAddress } = req.body;

      if (!signature) {
        res.status(400).json({
          success: false,
          error: 'Wallet signature is required for payment verification'
        });
        return;
      }

      const verificationData = {
        paymentId,
        signature,
        blockchainData,
        customerWalletAddress,
        txHash: blockchainData?.txId || blockchainData?.txHash
      };

      const result = await this.paymentService.verifyPaymentSignature(verificationData);

      if (result.success) {
        logger.info('Payment verified via API', {
          paymentId,
          txId: blockchainData?.txId
        });

        res.json({
          success: true,
          message: 'Payment verified and confirmed',
          data: {
            txId: blockchainData?.txId,
            status: 'confirmed'
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Payment verification API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async refundPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const merchantId = req.merchant?.id;
      const { amount, reason, blockchainRefundData } = req.body;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      if (!blockchainRefundData?.transactionId) {
        res.status(400).json({
          success: false,
          error: 'Blockchain refund transaction data is required'
        });
        return;
      }

      const result = await this.paymentService.refundPayment(
        paymentId,
        merchantId,
        {
          amount,
          reason,
          blockchainRefundData: {
            transactionId: blockchainRefundData.transactionId,
            blockHeight: blockchainRefundData.blockHeight,
            status: blockchainRefundData.status || 'confirmed',
            feesPaid: blockchainRefundData.feesPaid
          }
        }
      );

      if (result.success) {
        logger.info('Payment refunded via API', {
          paymentId,
          merchantId,
          refundTxId: blockchainRefundData.transactionId,
          amount
        });

        res.json({
          success: true,
          message: 'Refund processed successfully',
          data: result.refund
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Refund payment API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Process customer payment (public endpoint)
   */
  async processCustomerPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const { walletAddress, transactionId, signature, paymentMethod } = req.body;

      if (!walletAddress || !transactionId || !paymentMethod) {
        res.status(400).json({
          success: false,
          error: 'Wallet address, transaction ID, and payment method are required'
        });
        return;
      }

      // Get the payment to update
      const payment = await this.paymentService.getPayment(paymentId);
      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      // For demo purposes, we'll mark the payment as confirmed immediately
      // In production, this would verify the actual blockchain transaction
      payment.status = 'confirmed';
      payment.confirmations = 1;
      payment.blockchainData = {
        txId: transactionId,
        confirmations: 1,
        timestamp: new Date().toISOString(),
        customerWalletAddress: walletAddress,
        paymentMethod: paymentMethod
      };

      // Save the updated payment
      await payment.save();

      logger.info('Customer payment processed', {
        paymentId,
        txId: transactionId,
        walletAddress,
        paymentMethod
      });

      res.json({
        success: true,
        message: 'Payment processed and confirmed',
        data: {
          txId: transactionId,
          status: 'confirmed',
          confirmations: 1
        }
      });

    } catch (error) {
      logger.error('Process customer payment API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Generate QR code for payment (public endpoint)
   */
  async generatePublicQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const size = req.query.size ? parseInt(req.query.size as string) : 256;

      const payment = await this.paymentService.getPayment(paymentId);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      // For public QR codes, use just the URL for better compatibility
      const qrCodeDataUrl = await QRCode.toDataURL(`${process.env.FRONTEND_URL}/checkout/${paymentId}`, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      res.json({
        success: true,
        data: {
          qrUrl: qrCodeDataUrl,
          paymentUrl: `${process.env.FRONTEND_URL}/checkout/${paymentId}`,
          size
        }
      });

    } catch (error) {
      logger.error('Generate public QR code API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Generate QR code for merchant dashboard
   */
  async generateQRCode(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;
      const merchantId = req.merchant?.id;
      const size = req.query.size ? parseInt(req.query.size as string) : 256;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const payment = await this.paymentService.getPayment(paymentId, merchantId);

      if (!payment) {
        res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
        return;
      }

      // For merchant QR codes, include more detailed info
      // For merchant QR codes, use just the URL for better compatibility
      const qrCodeDataUrl = await QRCode.toDataURL(`${process.env.FRONTEND_URL}/checkout/${paymentId}`, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      res.json({
        success: true,
        data: {
          qrUrl: qrCodeDataUrl,
          paymentUrl: `${process.env.FRONTEND_URL}/checkout/${paymentId}`,
          payment: {
            id: payment._id || payment.id,
            amount: payment.amount || payment.paymentAmount,
            currency: payment.currency || payment.paymentCurrency,
            address: payment.depositAddress || payment.paymentAddress,
            expiresAt: payment.expiresAt
          },
          size
        }
      });

    } catch (error) {
      logger.error('Generate QR code API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Create payment link for sharing (merchant dashboard)
   */
  async createPaymentLink(req: Request, res: Response): Promise<void> {
    try {
      logger.info('Payment link creation request received', { 
        body: req.body, 
        merchant: req.merchant,
        authHeader: req.headers.authorization?.substring(0, 20) + '...'
      });

      const merchantId = req.merchant?.id;
      if (!merchantId) {
        logger.error('No merchant ID found in request', { merchant: req.merchant });
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      // Validate required fields
      if (!req.body.amount || !req.body.currency) {
        res.status(400).json({
          success: false,
          error: 'Amount and currency are required'
        });
        return;
      }

      // Set default paymentMethod based on currency if not provided
      let paymentMethod = req.body.paymentMethod;
      if (!paymentMethod) {
        const currency = req.body.currency.toLowerCase();
        switch (currency) {
          case 'btc':
            paymentMethod = 'btc';
            break;
          case 'stx':
            paymentMethod = 'stx';
            break;
          case 'sbtc':
            paymentMethod = 'sbtc';
            break;
          default:
            paymentMethod = 'btc'; // Default fallback
        }
      }

      // Create payment with the same logic as regular payments
      const paymentData = {
        merchantId,
        amount: req.body.amount,
        currency: req.body.currency,
        paymentMethod: paymentMethod,
        payoutMethod: req.body.payoutMethod || 'usd',
        description: req.body.description || 'Payment Link',
        metadata: { 
          ...req.body.metadata,
          isPaymentLink: true,
          source: 'payment_link'
        },
        customerInfo: req.body.customerInfo,
        webhookUrl: req.body.webhookUrl,
        successUrl: req.body.successUrl,
        cancelUrl: req.body.cancelUrl,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
        allowedPaymentMethods: req.body.allowedPaymentMethods,
        preferredPaymentMethod: req.body.preferredPaymentMethod
      } as any;

      logger.info('Creating payment for payment link', { 
        merchantId,
        amount: paymentData.amount,
        currency: paymentData.currency
      });

      const result = await this.paymentService.createPayment(paymentData);

      if (result.success && result.payment) {
        // Generate payment URL and QR code
        const paymentUrl = `${process.env.FRONTEND_URL}/checkout/${result.payment.id}`;
        
        // Generate QR code for the payment link - just use the URL for better compatibility
        const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });

        res.status(201).json({
          success: true,
          data: {
            id: result.payment.id,
            url: paymentUrl,
            qrCode: qrCodeDataUrl,
            payment: result.payment,
            expiresAt: result.payment.expiresAt
          }
        });
      } else {
        logger.error('Payment link creation failed in service', { 
          error: result.error, 
          paymentData,
          merchantId 
        });
        res.status(400).json({
          success: false,
          error: result.error
        });
      }

    } catch (error) {
      logger.error('Payment link creation API error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}