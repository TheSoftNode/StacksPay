import { Request, Response } from 'express';
import { webhookService } from '@/services/webhook-service';
import { createLogger } from '@/utils/logger';

const logger = createLogger('WebhookController');

export class WebhookController {
  /**
   * Create a new webhook endpoint
   */
  async createWebhook(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const { url, events, secret } = req.body;

      if (!url || !events || !Array.isArray(events)) {
        res.status(400).json({
          success: false,
          error: 'URL and events array are required'
        });
        return;
      }

      const webhook = await webhookService.createWebhook(merchantId, {
        url,
        events,
        secret
      });

      logger.info('Webhook created', {
        merchantId,
        webhookId: webhook.id,
        url,
        events
      });

      res.status(201).json({
        success: true,
        data: webhook
      });
    } catch (error: any) {
      logger.error('Create webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create webhook'
      });
    }
  }

  /**
   * List merchant webhooks
   */
  async listWebhooks(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const webhooks = await webhookService.getWebhooksByMerchant(merchantId);

      res.json({
        success: true,
        data: webhooks
      });
    } catch (error: any) {
      logger.error('List webhooks error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch webhooks'
      });
    }
  }

  /**
   * Get webhook details
   */
  async getWebhook(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      const webhookId = req.params.id;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const webhook = await webhookService.getWebhook(webhookId, merchantId);

      if (!webhook) {
        res.status(404).json({
          success: false,
          error: 'Webhook not found'
        });
        return;
      }

      res.json({
        success: true,
        data: webhook
      });
    } catch (error: any) {
      logger.error('Get webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch webhook'
      });
    }
  }

  /**
   * Update webhook
   */
  async updateWebhook(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      const webhookId = req.params.id;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const updates = req.body;
      const webhook = await webhookService.updateWebhook(webhookId, merchantId, updates);

      if (!webhook) {
        res.status(404).json({
          success: false,
          error: 'Webhook not found'
        });
        return;
      }

      logger.info('Webhook updated', {
        merchantId,
        webhookId,
        updates
      });

      res.json({
        success: true,
        data: webhook
      });
    } catch (error: any) {
      logger.error('Update webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update webhook'
      });
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      const webhookId = req.params.id;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      await webhookService.deleteWebhook(webhookId, merchantId);

      logger.info('Webhook deleted', {
        merchantId,
        webhookId
      });

      res.json({
        success: true,
        message: 'Webhook deleted successfully'
      });
    } catch (error: any) {
      logger.error('Delete webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete webhook'
      });
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      const webhookId = req.params.id;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const testResult = await webhookService.testWebhook(webhookId, merchantId);

      res.json({
        success: true,
        data: testResult
      });
    } catch (error: any) {
      logger.error('Test webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to test webhook'
      });
    }
  }

  /**
   * Retry failed webhook deliveries
   */
  async retryWebhook(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      const webhookId = req.params.id;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const retryResult = await webhookService.retryFailedWebhooks(webhookId, merchantId);

      res.json({
        success: true,
        data: retryResult
      });
    } catch (error: any) {
      logger.error('Retry webhook error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to retry webhook'
      });
    }
  }
}

export const webhookController = new WebhookController();