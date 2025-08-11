export interface WebhookPayload {
  event: string;
  payment: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    confirmedAt?: Date;
    metadata?: any;
  };
  timestamp: string;
}

export interface WebhookResponse {
  success: boolean;
  statusCode?: number;
  error?: string;
  retryAfter?: number;
}

/**
 * Webhook service for notifying merchants about payment events
 */
export class WebhookService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 5000, 15000]; // 1s, 5s, 15s

  /**
   * Trigger webhook notification
   */
  async triggerWebhook(payment: any, event: string): Promise<WebhookResponse> {
    if (!payment.urls?.webhook) {
      return { success: true }; // No webhook configured, consider it successful
    }

    const payload: WebhookPayload = {
      event,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        confirmedAt: payment.confirmedAt,
        metadata: payment.metadata,
      },
      timestamp: new Date().toISOString(),
    };

    return await this.sendWebhookWithRetry(payment.urls.webhook, payload, 0);
  }

  /**
   * Send webhook with retry logic
   */
  private async sendWebhookWithRetry(
    url: string, 
    payload: WebhookPayload, 
    attempt: number
  ): Promise<WebhookResponse> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'sBTC-Payment-Gateway/1.0',
          'X-Webhook-Signature': await this.generateSignature(payload),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        return { success: true, statusCode: response.status };
      }

      // If server error and we haven't exceeded max retries, retry
      if (response.status >= 500 && attempt < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAYS[attempt];
        await this.sleep(delay);
        return await this.sendWebhookWithRetry(url, payload, attempt + 1);
      }

      return { 
        success: false, 
        statusCode: response.status,
        error: `HTTP ${response.status}: ${response.statusText}` 
      };

    } catch (error) {
      console.error(`Webhook attempt ${attempt + 1} failed:`, error);

      // Retry on network errors
      if (attempt < this.MAX_RETRIES) {
        const delay = this.RETRY_DELAYS[attempt];
        await this.sleep(delay);
        return await this.sendWebhookWithRetry(url, payload, attempt + 1);
      }

      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }

  /**
   * Generate webhook signature for security
   */
  private async generateSignature(payload: WebhookPayload): Promise<string> {
    const secret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
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
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['verify']
      );
      
      const signatureBuffer = new Uint8Array(
        signature.match(/.{2}/g)!.map(byte => parseInt(byte, 16))
      );
      
      return await crypto.subtle.verify('HMAC', key, signatureBuffer, data);
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Test webhook endpoint
   */
  async testWebhook(url: string): Promise<WebhookResponse> {
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

    return await this.sendWebhookWithRetry(url, testPayload, 0);
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
        webhookResults.push({ success: false, error: result.reason });
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
