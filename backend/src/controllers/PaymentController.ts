import { Request, Response } from 'express';
import { PaymentService } from '@/services/payment-service';
import { createLogger } from '@/utils/logger';
import { 
  PaymentCreateRequest, 
  PaymentUpdateRequest, 
  PaymentListQuery 
} from '@/interfaces/payment.interface';

const logger = createLogger('PaymentController');

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      if (!merchantId) {
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

  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { paymentId } = req.params;

      const payment = await this.paymentService.getPayment(paymentId);

      if (payment) {
        res.json({
          success: true,
          data: {
            id: payment._id?.toString() || payment.id,
            status: payment.status,
            amount: payment.amount || payment.paymentAmount,
            currency: payment.currency || payment.paymentCurrency,
            paymentMethod: payment.paymentMethod,
            expiresAt: payment.expiresAt,
            depositAddress: payment.depositAddress || payment.paymentAddress,
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

      const verificationData = {
        paymentId,
        signature,
        blockchainData: {
          txId: transactionId,
          timestamp: new Date()
        },
        customerWalletAddress: walletAddress
      };

      const result = await this.paymentService.verifyPaymentSignature(verificationData);

      if (result.success) {
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

      // For public QR codes, include basic payment info
      const qrData = {
        paymentId: payment._id || payment.id,
        amount: payment.amount || payment.paymentAmount,
        currency: payment.currency || payment.paymentCurrency,
        address: payment.depositAddress || payment.paymentAddress,
        url: `${process.env.FRONTEND_URL}/pay/${paymentId}`
      };

      // Generate QR code (you'll need to implement QR generation)
      // For now, return the data that would be in the QR code
      res.json({
        success: true,
        data: {
          qrData: JSON.stringify(qrData),
          qrUrl: `data:image/svg+xml;base64,${Buffer.from(JSON.stringify(qrData)).toString('base64')}`,
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
      const qrData = {
        paymentId: payment._id || payment.id,
        amount: payment.amount || payment.paymentAmount,
        currency: payment.currency || payment.paymentCurrency,
        address: payment.depositAddress || payment.paymentAddress,
        merchantId,
        url: `${process.env.FRONTEND_URL}/pay/${paymentId}`,
        expiresAt: payment.expiresAt
      };

      res.json({
        success: true,
        data: {
          qrData: JSON.stringify(qrData),
          qrUrl: `data:image/svg+xml;base64,${Buffer.from(JSON.stringify(qrData)).toString('base64')}`,
          size,
          expiresAt: payment.expiresAt
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
}