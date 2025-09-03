import { connectToDatabase } from '@/config/database';
import { webhookService } from './webhook-service';
import { MerchantNotificationOptions, NotificationData, NotificationPreferences } from '@/interfaces/notification.interface';


/**
 * Notification Service - Multi-channel notification system
 * 
 * Handles all notifications including:
 * - Email notifications (transactional & marketing)  
 * - SMS notifications for critical alerts
 * - In-app notifications
 * - Webhook notifications
 * - Delivery tracking and analytics
 * - Preference management
 */
export class NotificationService {

  /**
   * Send merchant notification
   */
  async sendMerchantNotification(
    merchantId: string, 
    options: MerchantNotificationOptions
  ): Promise<{ success: boolean; notificationIds: string[]; error?: string }> {
    await connectToDatabase();
    
    try {
      const preferences = await this.getMerchantPreferences(merchantId);
      const notifications: NotificationData[] = [];
      const notificationIds: string[] = [];

      // Determine channels to use
      const channels = options.channels || this.getDefaultChannels(options.urgency || 'medium');

      // Email notification
      if (channels.includes('email') && preferences.email.enabled) {
        if (this.shouldSendEmailNotification(options.type, preferences)) {
          const emailNotification = await this.createEmailNotification(merchantId, options, preferences);
          notifications.push(emailNotification);
          notificationIds.push(emailNotification.id);
        }
      }

      // SMS notification  
      if (channels.includes('sms') && preferences.sms.enabled && preferences.sms.phone) {
        if (this.shouldSendSmsNotification(options.type, preferences)) {
          const smsNotification = await this.createSmsNotification(merchantId, options, preferences);
          notifications.push(smsNotification);
          notificationIds.push(smsNotification.id);
        }
      }

      // Webhook notification
      if (channels.includes('webhook') && preferences.webhook.enabled && preferences.webhook.url) {
        await webhookService.triggerWebhook({
          urls: { webhook: preferences.webhook.url },
          _id: `notification_${Date.now()}`,
          type: 'notification',
          merchantId,
          data: options,
          metadata: { notificationType: options.type, urgency: options.urgency }
        }, `merchant.notification.${options.type}`);
      }

      // In-app notification
      if (channels.includes('in_app') && preferences.inApp.enabled) {
        const inAppNotification = await this.createInAppNotification(merchantId, options);
        notifications.push(inAppNotification);
        notificationIds.push(inAppNotification.id);
      }

      // Send all notifications
      await Promise.all(notifications.map(notification => this.sendNotification(notification)));

      return { success: true, notificationIds };
    } catch (error) {
      console.error('Error sending merchant notification:', error);
      return { 
        success: false, 
        notificationIds: [], 
        error: error instanceof Error ? error.message : 'Notification failed' 
      };
    }
  }

  /**
   * Send individual notification
   */
  private async sendNotification(notification: NotificationData): Promise<boolean> {
    try {
      switch (notification.type) {
        case 'email':
          return await this.sendEmail(notification);
        case 'sms':
          return await this.sendSms(notification);
        case 'in_app':
          return await this.storeInAppNotification(notification);
        default:
          console.warn(`Unknown notification type: ${notification.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Error sending ${notification.type} notification:`, error);
      
      // Update notification status
      notification.status = 'failed';
      notification.failedAt = new Date();
      notification.attempts++;
      
      return false;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: NotificationData): Promise<boolean> {
    try {
      // In production, integrate with email service (SendGrid, Mailgun, SES, etc.)
      console.log(`Sending email to ${notification.recipient}: ${notification.subject}`);
      
      // Simulate email sending
      const success = Math.random() > 0.05; // 95% success rate
      
      if (success) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        
        // Simulate delivery confirmation
        setTimeout(() => {
          notification.status = 'delivered';
          notification.deliveredAt = new Date();
        }, 1000);
      } else {
        notification.status = 'failed';
        notification.failedAt = new Date();
      }
      
      notification.attempts++;
      notification.lastAttemptAt = new Date();
      
      return success;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSms(notification: NotificationData): Promise<boolean> {
    try {
      // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log(`Sending SMS to ${notification.recipient}: ${notification.message.substring(0, 50)}...`);
      
      // Simulate SMS sending  
      const success = Math.random() > 0.02; // 98% success rate
      
      if (success) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        
        // Simulate delivery confirmation
        setTimeout(() => {
          notification.status = 'delivered';
          notification.deliveredAt = new Date();
        }, 500);
      } else {
        notification.status = 'failed';
        notification.failedAt = new Date();
      }
      
      notification.attempts++;
      notification.lastAttemptAt = new Date();
      
      return success;
    } catch (error) {
      console.error('SMS sending error:', error);
      return false;
    }
  }

  /**
   * Store in-app notification
   */
  private async storeInAppNotification(notification: NotificationData): Promise<boolean> {
    try {
      // Store in database for in-app display
      notification.status = 'delivered';
      notification.sentAt = new Date();
      notification.deliveredAt = new Date();
      notification.attempts++;
      notification.lastAttemptAt = new Date();
      
      return true;
    } catch (error) {
      console.error('In-app notification storage error:', error);
      return false;
    }
  }

  /**
   * Get merchant notification preferences
   */
  private async getMerchantPreferences(merchantId: string): Promise<NotificationPreferences> {
    // In production, retrieve from database
    return this.getDefaultNotificationPreferences(merchantId);
  }

  /**
   * Create email notification for merchant
   */
  private async createEmailNotification(
    merchantId: string, 
    options: MerchantNotificationOptions,
    preferences: NotificationPreferences
  ): Promise<NotificationData> {
    return {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'email',
      recipient: preferences.email.address,
      subject: this.getEmailSubject(options.type, options),
      message: this.getEmailMessage(options.type, options),
      data: options,
      status: 'pending',
      attempts: 0,
      maxAttempts: 3,
      metadata: { merchantId, notificationType: options.type },
      merchantId,
      customerId: options.customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Create SMS notification for merchant
   */
  private async createSmsNotification(
    merchantId: string, 
    options: MerchantNotificationOptions,
    preferences: NotificationPreferences
  ): Promise<NotificationData> {
    return {
      id: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'sms',
      recipient: preferences.sms.phone!,
      message: this.getSmsMessage(options.type, options),
      data: options,
      status: 'pending',
      attempts: 0,
      maxAttempts: 2,
      metadata: { merchantId, notificationType: options.type },
      merchantId,
      customerId: options.customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Create in-app notification for merchant
   */
  private async createInAppNotification(
    merchantId: string, 
    options: MerchantNotificationOptions
  ): Promise<NotificationData> {
    return {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'in_app',
      recipient: merchantId,
      message: this.getInAppMessage(options.type, options),
      data: options,
      status: 'pending',
      attempts: 0,
      maxAttempts: 1,
      metadata: { merchantId, notificationType: options.type },
      merchantId,
      customerId: options.customerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Message generation methods
  private getEmailSubject(type: string, options: MerchantNotificationOptions): string {
    const subjects: Record<string, string> = {
      'payment_received': `Payment Received - ${options.amount ? `$${(options.amount / 100).toFixed(2)}` : 'New Payment'}`,
      'payment_failed': 'Payment Failed - Action Required',
      'subscription_created': 'New Subscription Created',
      'subscription_canceled': 'Subscription Canceled',
      'subscription_payment_failed': 'Subscription Payment Failed',
      'low_balance': 'Low Balance Alert',
      'security_alert': 'Security Alert - Immediate Action Required',
    };
    return subjects[type] || `Notification: ${type}`;
  }

  private getEmailMessage(type: string, options: MerchantNotificationOptions): string {
    // In production, use email templates
    return `You have a new ${type} notification. Details: ${JSON.stringify(options, null, 2)}`;
  }

  private getSmsMessage(type: string, options: MerchantNotificationOptions): string {
    const messages: Record<string, string> = {
      'payment_failed': `Payment failed for ${options.amount ? `$${(options.amount / 100).toFixed(2)}` : 'payment'}. Check your dashboard.`,
      'security_alert': 'SECURITY ALERT: Unusual activity detected. Login to your dashboard immediately.',
      'subscription_payment_failed': `Subscription payment failed${options.failedPaymentCount ? ` (attempt ${options.failedPaymentCount})` : ''}. Update payment method.`,
    };
    return messages[type] || `${type}: Check your dashboard for details.`;
  }

  private getInAppMessage(type: string, options: MerchantNotificationOptions): string {
    return `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Click for details`;
  }

  // Helper methods
  private shouldSendEmailNotification(type: string, preferences: NotificationPreferences): boolean {
    const typeMapping: Record<string, keyof NotificationPreferences['email']['types']> = {
      'payment_received': 'payment_received',
      'payment_failed': 'payment_failed', 
      'subscription_created': 'subscription_created',
      'subscription_canceled': 'subscription_canceled',
      'low_balance': 'low_balance',
      'security_alert': 'security_alerts',
    };
    
    const prefKey = typeMapping[type];
    return prefKey ? preferences.email.types[prefKey] : true;
  }

  private shouldSendSmsNotification(type: string, preferences: NotificationPreferences): boolean {
    const typeMapping: Record<string, keyof NotificationPreferences['sms']['types']> = {
      'payment_failed': 'payment_failed',
      'security_alert': 'security_alerts',
    };
    
    const prefKey = typeMapping[type];
    return prefKey ? preferences.sms.types[prefKey] : false;
  }

  private getDefaultChannels(urgency: string): ('email' | 'sms' | 'webhook' | 'in_app')[] {
    switch (urgency) {
      case 'critical':
        return ['email', 'sms', 'webhook', 'in_app'];
      case 'high':
        return ['email', 'webhook', 'in_app'];
      case 'medium':
        return ['email', 'in_app'];
      case 'low':
        return ['in_app'];
      default:
        return ['email'];
    }
  }

  private getDefaultNotificationPreferences(merchantId: string): NotificationPreferences {
    return {
      merchantId,
      email: {
        enabled: true,
        address: 'merchant@example.com', // Would get from merchant profile
        verificationRequired: true,
        types: {
          payment_received: true,
          payment_failed: true,
          subscription_created: true,
          subscription_canceled: true,
          low_balance: true,
          security_alerts: true,
          system_updates: false,
          marketing: false,
        },
      },
      sms: {
        enabled: false,
        verificationRequired: true,
        types: {
          critical_alerts: true,
          payment_failed: true,
          security_alerts: true,
        },
      },
      webhook: {
        enabled: true,
        events: ['payment.*', 'subscription.*'],
      },
      inApp: {
        enabled: true,
        types: {
          all_events: false,
          important_only: true,
        },
      },
    };
  }
}

export const notificationService = new NotificationService();