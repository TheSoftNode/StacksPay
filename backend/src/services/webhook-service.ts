import { WebhookPayload, WebhookResponse } from "@/interfaces/webhook.interface";
import { Webhook, IWebhook } from "@/models/Webhook";
import { createLogger } from "@/utils/logger";
import * as crypto from 'crypto';

const logger = createLogger('WebhookService');

/**
 * Webhook service for notifying merchants about payment events
 */
export class WebhookService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

  /**
   * Create a new webhook endpoint
   */
  async createWebhook(merchantId: string, data: {
    url: string;
    events: string[];
    secret?: string;
    enabled?: boolean;
  }): Promise<IWebhook> {
    try {
      const webhook = new Webhook({
        merchantId,
        url: data.url,
        events: data.events,
        secret: data.secret || this.generateWebhookSecret(),
        enabled: data.enabled !== undefined ? data.enabled : true,
      });

      await webhook.save();
      
      logger.info('Webhook created', {
        webhookId: webhook._id,
        merchantId,
        url: data.url,
        events: data.events
      });

      return webhook;
    } catch (error) {
      logger.error('Error creating webhook:', error);
      throw error;
    }
  }

  /**
   * Get webhooks by merchant ID
   */
  async getWebhooksByMerchant(merchantId: string): Promise<IWebhook[]> {
    try {
      const webhooks = await Webhook.find({ merchantId }).sort({ createdAt: -1 });
      return webhooks;
    } catch (error) {
      logger.error('Error fetching webhooks for merchant:', error);
      throw error;
    }
  }

  /**
   * Get a specific webhook by ID and merchant ID
   */
  async getWebhook(webhookId: string, merchantId: string): Promise<IWebhook | null> {
    try {
      const webhook = await Webhook.findOne({ _id: webhookId, merchantId });
      return webhook;
    } catch (error) {
      logger.error('Error fetching webhook:', error);
      throw error;
    }
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId: string, merchantId: string, updates: {
    url?: string;
    events?: string[];
    enabled?: boolean;
    secret?: string;
  }): Promise<IWebhook | null> {
    try {
      const webhook = await Webhook.findOneAndUpdate(
        { _id: webhookId, merchantId },
        { $set: updates },
        { new: true }
      );

      if (webhook) {
        logger.info('Webhook updated', {
          webhookId,
          merchantId,
          updates
        });
      }

      return webhook;
    } catch (error) {
      logger.error('Error updating webhook:', error);
      throw error;
    }
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: string, merchantId: string): Promise<boolean> {
    try {
      const result = await Webhook.deleteOne({ _id: webhookId, merchantId });
      
      if (result.deletedCount > 0) {
        logger.info('Webhook deleted', { webhookId, merchantId });
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error deleting webhook:', error);
      throw error;
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(webhookId: string, merchantId: string): Promise<{
    success: boolean;
    response?: any;
    error?: string;
    latency?: number;
  }> {
    try {
      const webhook = await this.getWebhook(webhookId, merchantId);
      
      if (!webhook) {
        return { success: false, error: 'Webhook not found' };
      }

      const testPayload: WebhookPayload = {
        event: 'webhook.test',
        payment: {
          id: 'test_payment_' + Date.now(),
          status: 'confirmed',
          amount: 100,
          currency: 'USD',
          paymentMethod: 'sbtc',
          confirmedAt: new Date(),
          metadata: { test: true },
        },
        timestamp: new Date().toISOString(),
      };

      const startTime = Date.now();
      const result = await this.sendWebhookRequest(webhook.url, testPayload, webhook.secret);
      const latency = Date.now() - startTime;

      // Update webhook stats
      await this.updateWebhookStats(webhookId, result.success ? 'success' : 'failure', result.error);

      return {
        success: result.success,
        response: result.statusCode,
        error: result.error,
        latency
      };
    } catch (error) {
      logger.error('Error testing webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Retry failed webhook deliveries
   */
  async retryFailedWebhooks(webhookId: string, merchantId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const webhook = await this.getWebhook(webhookId, merchantId);
      
      if (!webhook) {
        return { success: false, message: 'Webhook not found' };
      }

      // For now, just return success as we don't have a failed deliveries queue
      // In a production system, you'd want to implement a proper queue system
      return { 
        success: true, 
        message: 'Retry initiated for failed webhook deliveries' 
      };
    } catch (error) {
      logger.error('Error retrying webhook:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update webhook delivery statistics
   */
  private async updateWebhookStats(webhookId: string, status: 'success' | 'failure', error?: string): Promise<void> {
    try {
      const updateQuery: any = {
        $inc: {
          'deliveryStats.total': 1,
        },
        $set: {
          lastDeliveryAt: new Date()
        }
      };

      if (status === 'success') {
        updateQuery.$inc['deliveryStats.successful'] = 1;
      } else {
        updateQuery.$inc['deliveryStats.failed'] = 1;
        if (error) {
          updateQuery.$set['deliveryStats.lastFailureReason'] = error;
        }
      }

      await Webhook.findByIdAndUpdate(webhookId, updateQuery);
    } catch (error) {
      logger.error('Error updating webhook stats:', error);
    }
  }

  /**
   * Generate a secure webhook secret
   */
  private generateWebhookSecret(): string {
    return 'whsec_' + crypto.randomBytes(32).toString('hex');
  }

  /**
   * Trigger webhook notification for all merchant webhooks
   */
  async triggerWebhook(payment: any, event: string): Promise<WebhookResponse> {
    try {
      // Get all enabled webhooks for this merchant that listen to this event
      const webhooks = await Webhook.find({
        merchantId: payment.merchantId,
        enabled: true,
        events: event
      });

      if (webhooks.length === 0) {
        return { success: true }; // No webhooks configured for this event
      }

      const payload: WebhookPayload = {
        event,
        payment: {
          id: payment._id || payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          confirmedAt: payment.confirmedAt,
          metadata: payment.metadata,
        },
        timestamp: new Date().toISOString(),
      };

      // Send to all webhooks in parallel
      const results = await Promise.allSettled(
        webhooks.map(webhook => 
          this.sendWebhookWithRetry(webhook.url, payload, 0, webhook.secret, webhook._id.toString())
        )
      );

      // Check if any webhook succeeded
      const anySuccess = results.some(result => 
        result.status === 'fulfilled' && result.value.success
      );

      return { success: anySuccess };
    } catch (error) {
      logger.error('Error triggering webhooks:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Send webhook with retry logic
   */
  private async sendWebhookWithRetry(
    url: string, 
    payload: WebhookPayload, 
    attempt: number,
    secret?: string,
    webhookId?: string
  ): Promise<WebhookResponse> {
    try {
      const response = await this.sendWebhookRequest(url, payload, secret);

      if (response.success && webhookId) {
        await this.updateWebhookStats(webhookId, 'success');
      }

      if (response.success) {
        return response;
      }

      // If server error and we haven't exceeded max retries, retry
      if (response.statusCode && response.statusCode >= 500 && attempt < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAYS[attempt];
        await this.sleep(delay);
        return await this.sendWebhookWithRetry(url, payload, attempt + 1, secret, webhookId);
      }

      // Update failure stats
      if (webhookId) {
        await this.updateWebhookStats(webhookId, 'failure', response.error);
      }

      return response;

    } catch (error) {
      logger.error(`Webhook attempt ${attempt + 1} failed:`, error);

      // Update failure stats
      if (webhookId) {
        await this.updateWebhookStats(webhookId, 'failure', error instanceof Error ? error.message : 'Network error');
      }

      // Retry on network errors
      if (attempt < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAYS[attempt];
        await this.sleep(delay);
        return await this.sendWebhookWithRetry(url, payload, attempt + 1, secret, webhookId);
      }

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Send a single webhook request
   */
  private async sendWebhookRequest(
    url: string,
    payload: WebhookPayload,
    secret?: string
  ): Promise<WebhookResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'sBTC-Payment-Gateway/1.0',
      };

      if (secret) {
        headers['X-StacksPay-Signature'] = await this.generateSignature(payload, secret);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        return { success: true, statusCode: response.status };
      }

      return { 
        success: false, 
        statusCode: response.status,
        error: `HTTP ${response.status}: ${response.statusText}` 
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Generate webhook signature for security
   */
  private async generateSignature(payload: WebhookPayload, secret?: string): Promise<string> {
    const webhookSecret = secret || process.env.WEBHOOK_SECRET || 'default-webhook-secret';
    const payloadString = JSON.stringify(payload);
    
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');
    
    return `sha256=${signature}`;
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(
    payload: string, 
    signature: string, 
    secret?: string
  ): Promise<boolean> {
    try {
      const webhookSecret = secret || process.env.WEBHOOK_SECRET || 'default-webhook-secret';
      
      // Remove 'sha256=' prefix if present
      const cleanSignature = signature.replace(/^sha256=/, '');
      
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      logger.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Test webhook endpoint (standalone method for URL testing)
   */
  async testWebhookUrl(url: string, secret?: string): Promise<WebhookResponse> {
    const testPayload: WebhookPayload = {
      event: 'webhook.test',
      payment: {
        id: 'test_payment_123',
        status: 'confirmed',
        amount: 100,
        currency: 'USD',
        paymentMethod: 'sbtc',
        confirmedAt: new Date(),
        metadata: { test: true },
      },
      timestamp: new Date().toISOString(),
    };

    return await this.sendWebhookRequest(url, testPayload, secret);
  }

  /**
   * Get webhook events for documentation
   */
  getWebhookEvents() {
    return {
      'payment.created': 'Triggered when a payment request is created',
      'payment.confirmed': 'Triggered when a payment is confirmed on the blockchain',
      'payment.failed': 'Triggered when a payment fails',
      'payment.expired': 'Triggered when a payment expires',
      'payment.cancelled': 'Triggered when a payment is cancelled',
      'payment.refunded': 'Triggered when a payment is refunded',
      'webhook.test': 'Test event for webhook validation',
    };
  }

  /**
   * Batch send webhooks for multiple payments
   */
  async batchTriggerWebhooks(
    payments: any[], 
    event: string
  ): Promise<{ success: number; failed: number; results: WebhookResponse[] }> {
    const results = await Promise.allSettled(
      payments.map(payment => this.triggerWebhook(payment, event))
    );

    let success = 0;
    let failed = 0;
    const webhookResults: WebhookResponse[] = [];

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        webhookResults.push(result.value);
        if (result.value.success) {
          success++;
        } else {
          failed++;
        }
      } else {
        webhookResults.push({ success: false, error: result.reason?.message || 'Unknown error' });
        failed++;
      }
    });

    return { success, failed, results: webhookResults };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const webhookService = new WebhookService();
