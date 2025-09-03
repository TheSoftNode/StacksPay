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

      const result = await this.paymentService.getPayment(paymentId, merchantId);

      if (result.success) {
        res.json({
          success: true,
          data: result.payment
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
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

      const result = await this.paymentService.updatePaymentStatus(
        paymentId, 
        updateData.status, 
        { merchantId, ...updateData.metadata }
      );

      if (result.success) {
        logger.info('Payment updated via API', {
          paymentId,
          merchantId,
          status: updateData.status
        });

        res.json({
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
        'cancelled', 
        { merchantId, cancelledBy: 'merchant' }
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

      const result = await this.paymentService.getPayment(paymentId);

      if (result.success) {
        res.json({
          success: true,
          data: {
            id: result.data?.id,
            status: result.data?.status,
            amount: result.data?.amount,
            currency: result.data?.currency,
            paymentMethod: result.data?.paymentMethod,
            expiresAt: result.data?.expiresAt,
            depositAddress: result.data?.depositAddress,
          }
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
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
}