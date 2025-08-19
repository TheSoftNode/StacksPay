# StacksPay Merchant Dashboard - Complete Usage Guide

## Overview

The StacksPay merchant dashboard is a comprehensive business management platform that enables merchants to accept payments, manage finances, monitor analytics, and integrate with their websites. This guide covers how merchants and developers use every aspect of the dashboard.

## For Merchants - Complete Dashboard Usage

### 1. Dashboard Overview Page (`/dashboard`)

**Purpose**: Central command center for business metrics and quick actions

**Key Features**:

- **Revenue Summary**: Total earnings across all payment methods (BTC, sBTC, USD, USDC)
- **Transaction Metrics**: Daily/weekly/monthly transaction counts and trends
- **Quick Actions**: Direct access to create payments, view recent transactions, manage settings
- **Performance Insights**: Conversion rates, average transaction value, popular payment methods
- **Recent Activity**: Latest payments, customer interactions, system notifications

**Merchant Workflow**:

1. **Morning Check**: Review overnight transactions and revenue
2. **Performance Monitoring**: Track key metrics against business goals
3. **Quick Actions**: Handle urgent tasks directly from overview cards
4. **Trend Analysis**: Identify patterns in customer behavior and payment preferences

### 2. Payments Management (`/dashboard/payments`)

**Purpose**: Complete payment processing and transaction management

**Key Features**:

- **Payment Creation**: Generate payment links, QR codes, and embedded widgets
- **Transaction History**: Searchable, filterable list of all payments
- **Payment Status**: Real-time tracking of pending, completed, and failed payments
- **Refund Management**: Process refunds and handle disputes
- **Payment Methods**: Support for BTC, sBTC, credit cards, and bank transfers

**Merchant Workflow**:

1. **Create Payments**:
   - Generate payment links for products/services
   - Create QR codes for in-person payments
   - Set up recurring payment schedules
2. **Monitor Transactions**:
   - Track payment statuses in real-time
   - Handle failed or pending transactions
   - Generate payment confirmations
3. **Customer Service**:
   - Process refunds when needed
   - Resolve payment disputes
   - Provide payment proof to customers

### 3. Analytics & Reporting (`/dashboard/analytics`)

**Purpose**: Business intelligence and performance analysis

**Key Features**:

- **Revenue Analytics**: Detailed breakdown by time period, payment method, currency
- **Customer Insights**: Geographic distribution, spending patterns, retention metrics
- **Performance Metrics**: Conversion rates, average order value, transaction success rates
- **Comparative Analysis**: Month-over-month, year-over-year comparisons
- **Export Capabilities**: PDF reports, CSV data exports for accounting

**Merchant Workflow**:

1. **Regular Reporting**:
   - Generate monthly/quarterly business reports
   - Track progress against business goals
   - Identify seasonal trends and patterns
2. **Data-Driven Decisions**:
   - Optimize pricing based on analytics
   - Identify best-performing products/services
   - Adjust marketing strategies based on customer data
3. **Financial Planning**:
   - Forecast future revenue based on trends
   - Plan inventory and staffing needs
   - Prepare financial statements for investors/lenders

### 4. Balance & Conversion Management (`/dashboard/conversion`)

**Purpose**: Financial asset management and currency operations

**Key Features**:

- **Multi-Currency Balances**: View BTC, sBTC, USD, USDC holdings
- **Currency Conversion**: Convert between crypto and fiat currencies
- **Withdrawal Management**: Transfer funds to bank accounts or crypto wallets
- **Rate Monitoring**: Track exchange rates and optimize conversion timing
- **Transaction History**: Complete audit trail of all financial operations

**Merchant Workflow**:

1. **Daily Balance Check**:
   - Monitor cash flow across all currencies
   - Identify conversion opportunities
2. **Strategic Conversion**:
   - Convert volatile crypto to stable currencies
   - Time conversions based on market conditions
3. **Fund Management**:
   - Schedule regular withdrawals to business accounts
   - Maintain operational reserves in preferred currencies

### 5. Customer Management (`/dashboard/customers`)

**Purpose**: Customer relationship and data management

**Key Features**:

- **Customer Profiles**: Detailed customer information and payment history
- **Segmentation**: Group customers by spending, frequency, location
- **Communication Tools**: Send payment reminders, promotional messages
- **Loyalty Programs**: Reward frequent customers with discounts
- **Support Integration**: Track customer service interactions

**Merchant Workflow**:

1. **Customer Service**:
   - Look up customer payment history
   - Resolve payment issues and disputes
   - Provide account assistance
2. **Marketing Campaigns**:
   - Segment customers for targeted promotions
   - Send personalized offers based on purchase history
   - Track campaign effectiveness
3. **Relationship Building**:
   - Identify VIP customers for special treatment
   - Monitor customer satisfaction metrics
   - Implement loyalty programs

### 6. API Keys & Integration (`/dashboard/api`)

**Purpose**: Technical integration and API management

**Key Features**:

- **API Key Generation**: Create and manage authentication keys
- **Webhook Configuration**: Set up real-time event notifications
- **Integration Testing**: Test API connections and webhook deliveries
- **Usage Monitoring**: Track API calls, rate limits, and performance
- **Security Management**: Rotate keys, set permissions, monitor access

**Merchant Workflow**:

1. **Initial Setup**:
   - Generate API keys for website integration
   - Configure webhooks for payment notifications
   - Test integration before going live
2. **Ongoing Management**:
   - Monitor API usage and performance
   - Rotate keys regularly for security
   - Update webhook endpoints as needed
3. **Troubleshooting**:
   - Debug integration issues
   - Review API logs for errors
   - Update configurations as business needs change

### 7. Webhook Management (`/dashboard/webhooks`)

**Purpose**: Real-time event handling and system integration

**Key Features**:

- **Webhook Creation**: Set up endpoints for different event types
- **Event Filtering**: Choose which events trigger notifications
- **Delivery Monitoring**: Track webhook delivery success/failure rates
- **Retry Configuration**: Set retry policies for failed deliveries
- **Testing Tools**: Test webhook endpoints before deployment

**Merchant Workflow**:

1. **System Integration**:
   - Connect StacksPay to existing business systems
   - Automate inventory updates based on payments
   - Sync customer data across platforms
2. **Real-Time Operations**:
   - Receive instant payment confirmations
   - Trigger fulfillment processes automatically
   - Update accounting systems in real-time
3. **Monitoring & Maintenance**:
   - Monitor webhook delivery rates
   - Debug failed webhook deliveries
   - Update endpoints during system changes

### 8. Developer Tools (`/dashboard/developer`)

**Purpose**: Technical documentation and development resources

**Key Features**:

- **API Documentation**: Complete API reference with examples
- **SDK Downloads**: Client libraries for popular programming languages
- **Code Examples**: Sample implementations for common use cases
- **Testing Environment**: Sandbox mode for development and testing
- **Integration Guides**: Step-by-step setup instructions

**Merchant Workflow**:

1. **Development Phase**:
   - Access API documentation for custom integrations
   - Download SDKs for preferred programming languages
   - Use sandbox environment for testing
2. **Implementation**:
   - Follow integration guides for specific platforms
   - Implement custom payment flows
   - Test thoroughly before production deployment
3. **Maintenance**:
   - Stay updated on API changes and new features
   - Implement security best practices
   - Monitor and optimize integration performance

### 9. Settings & Configuration (`/dashboard/settings`)

**Purpose**: Account management and system configuration

**Key Features**:

- **Business Profile**: Company information, branding, contact details
- **Payment Settings**: Default currencies, conversion preferences, fee structures
- **Security Settings**: Two-factor authentication, IP restrictions, session management
- **Notification Preferences**: Email alerts, SMS notifications, dashboard alerts
- **Team Management**: User roles, permissions, access controls

**Merchant Workflow**:

1. **Initial Setup**:
   - Complete business profile with accurate information
   - Configure payment preferences and fee structures
   - Set up security features and team access
2. **Regular Maintenance**:
   - Update business information as needed
   - Review and adjust notification settings
   - Manage team member access and permissions
3. **Security Management**:
   - Enable two-factor authentication
   - Review access logs regularly
   - Update security settings based on business needs

## For Developers - Complete Integration Guide

### 1. Initial Setup and Authentication

#### API Key Management

```typescript
// Generate API keys through dashboard
const apiKey = await generateAPIKey({
  name: 'Production Website',
  permissions: ['payments:read', 'payments:write', 'webhooks:manage'],
  ipRestrictions: ['192.168.1.100', '10.0.0.0/24'],
  rateLimits: {
    requestsPerMinute: 1000,
    requestsPerHour: 10000,
  },
});

// Use API key for authentication
const headers = {
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
};
```

#### Environment Configuration

```typescript
// Development environment
const config = {
  apiBaseUrl: 'https://sandbox-api.stackspay.com',
  dashboardUrl: 'https://sandbox-dashboard.stackspay.com',
  webhookSecret: process.env.STACKSPAY_WEBHOOK_SECRET_DEV,
};

// Production environment
const prodConfig = {
  apiBaseUrl: 'https://api.stackspay.com',
  dashboardUrl: 'https://dashboard.stackspay.com',
  webhookSecret: process.env.STACKSPAY_WEBHOOK_SECRET_PROD,
};
```

### 2. Website Integration

#### Payment Integration

```typescript
import { StacksPaySDK } from '@stackspay/sdk';

const stacksPay = new StacksPaySDK({
  apiKey: process.env.STACKSPAY_API_KEY,
  environment: 'production', // or 'sandbox'
});

// Create payment
const payment = await stacksPay.payments.create({
  amount: 29.99,
  currency: 'USD',
  description: 'Premium subscription',
  customerEmail: 'customer@example.com',
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cancel',
  metadata: {
    orderId: 'ORDER-12345',
    customerId: 'CUST-67890',
  },
});

// Redirect customer to payment page
window.location.href = payment.checkoutUrl;
```

#### Embedded Payment Widget

```typescript
// HTML
<div id="stackspay-widget"></div>;

// JavaScript
StacksPay.embed({
  containerId: 'stackspay-widget',
  publicKey: 'pk_live_...',
  amount: 29.99,
  currency: 'USD',
  onSuccess: (payment) => {
    console.log('Payment successful:', payment);
    // Handle successful payment
  },
  onCancel: () => {
    console.log('Payment cancelled');
    // Handle cancelled payment
  },
  style: {
    theme: 'light',
    borderRadius: '8px',
    primaryColor: '#6366f1',
  },
});
```

### 3. Webhook Implementation

#### Webhook Handler Setup

```typescript
import crypto from 'crypto';
import express from 'express';

const app = express();
app.use(express.raw({ type: 'application/json' }));

app.post('/webhooks/stackspay', (req, res) => {
  const signature = req.headers['x-stackspay-signature'];
  const payload = req.body;

  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.STACKSPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(payload.toString());

  // Handle different event types
  switch (event.type) {
    case 'payment.completed':
      handlePaymentCompleted(event.data);
      break;
    case 'payment.failed':
      handlePaymentFailed(event.data);
      break;
    case 'refund.processed':
      handleRefundProcessed(event.data);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).send('Webhook received');
});

// Event handlers
async function handlePaymentCompleted(payment) {
  // Update order status in database
  await updateOrderStatus(payment.metadata.orderId, 'paid');

  // Send confirmation email
  await sendOrderConfirmation(payment.customerEmail, payment);

  // Update inventory
  await updateInventory(payment.metadata.productId, -1);

  // Trigger fulfillment process
  await triggerFulfillment(payment.metadata.orderId);
}
```

### 4. Real-Time Dashboard Integration

#### WebSocket Connection

```typescript
// Connect to real-time updates
const socket = new WebSocket('wss://api.stackspay.com/ws/merchant/live');

socket.onopen = () => {
  console.log('Connected to StacksPay real-time updates');

  // Subscribe to specific events
  socket.send(
    JSON.stringify({
      type: 'subscribe',
      events: ['payments', 'balances', 'analytics'],
    })
  );
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'payment_update':
      updateDashboardPayments(data.payment);
      break;
    case 'balance_update':
      updateDashboardBalances(data.balances);
      break;
    case 'analytics_update':
      updateDashboardAnalytics(data.metrics);
      break;
  }
};
```

### 5. Advanced Integration Patterns

#### Subscription Management

```typescript
// Create subscription
const subscription = await stacksPay.subscriptions.create({
  customerId: 'cust_12345',
  planId: 'plan_premium',
  trialDays: 14,
  metadata: {
    source: 'website',
    referrer: 'google',
  },
});

// Handle subscription events
app.post('/webhooks/subscription', (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'subscription.created':
      // Grant access to premium features
      grantPremiumAccess(event.data.customerId);
      break;
    case 'subscription.cancelled':
      // Revoke premium access
      revokePremiumAccess(event.data.customerId);
      break;
    case 'subscription.payment_failed':
      // Send payment retry notification
      sendPaymentRetryNotification(event.data);
      break;
  }
});
```

#### Multi-Platform Integration

```typescript
// E-commerce platform integration (Shopify, WooCommerce, etc.)
class StacksPayEcommerceIntegration {
  constructor(platformConfig) {
    this.platform = platformConfig.platform;
    this.stacksPay = new StacksPaySDK(platformConfig.stacksPay);
  }

  async syncProducts() {
    const products = await this.platform.getProducts();

    for (const product of products) {
      await this.stacksPay.products.upsert({
        externalId: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        description: product.description,
      });
    }
  }

  async processOrder(order) {
    const payment = await this.stacksPay.payments.create({
      amount: order.total,
      currency: order.currency,
      orderId: order.id,
      items: order.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    return payment;
  }
}
```

## Business Workflows

### Complete Merchant Journey

1. **Onboarding**:

   - Sign up and complete business verification
   - Configure payment settings and preferences
   - Set up API keys and webhook endpoints
   - Test integration in sandbox environment
   - Go live with production configuration

2. **Daily Operations**:

   - Check dashboard overview for key metrics
   - Monitor incoming payments and transactions
   - Handle customer service inquiries
   - Process refunds and disputes as needed
   - Review and optimize conversion rates

3. **Weekly Management**:

   - Analyze performance metrics and trends
   - Generate financial reports for accounting
   - Review customer data and segmentation
   - Update pricing and promotional strategies
   - Optimize conversion and withdrawal schedules

4. **Monthly Planning**:
   - Comprehensive business performance review
   - Financial planning and forecasting
   - API usage analysis and optimization
   - Security audit and key rotation
   - Team access and permission reviews

### Developer Integration Process

1. **Planning Phase**:

   - Review API documentation and capabilities
   - Design integration architecture
   - Plan webhook event handling
   - Set up development environment

2. **Development Phase**:

   - Implement payment integration
   - Set up webhook handlers
   - Build admin dashboard connections
   - Implement error handling and logging
   - Create automated testing suite

3. **Testing Phase**:

   - Test all payment scenarios
   - Verify webhook delivery and handling
   - Load test API integrations
   - Security testing and vulnerability assessment
   - User acceptance testing

4. **Deployment Phase**:

   - Deploy to production environment
   - Configure production API keys and webhooks
   - Monitor integration performance
   - Set up alerting and monitoring
   - Create operational documentation

5. **Maintenance Phase**:
   - Monitor API performance and usage
   - Handle integration issues and bug fixes
   - Implement new features and improvements
   - Keep up with API updates and changes
   - Optimize performance and security

## Key Integration Points

### How Merchants Connect Dashboard to Website

1. **API Integration**:

   - Generate API keys from `/dashboard/api`
   - Implement payment endpoints on website
   - Configure webhook URLs for real-time updates
   - Test integration using sandbox mode

2. **Payment Flow**:

   - Customer initiates payment on merchant website
   - Website calls StacksPay API to create payment
   - Customer redirects to StacksPay checkout
   - Payment processed and webhook sent to merchant
   - Customer redirects back to merchant website
   - Merchant dashboard updates in real-time

3. **Dashboard Monitoring**:
   - Real-time payment notifications in dashboard
   - Transaction history automatically updated
   - Analytics and reporting reflect website sales
   - Customer data synced across platforms

### How Developers Use Dashboard Features

1. **Development Tools** (`/dashboard/developer`):

   - Access comprehensive API documentation
   - Download SDKs for various programming languages
   - Use interactive API explorer for testing
   - Access code examples and tutorials

2. **API Management** (`/dashboard/api`):

   - Generate and manage API keys with specific permissions
   - Monitor API usage and performance metrics
   - Set up rate limiting and security controls
   - Test API endpoints directly from dashboard

3. **Webhook Configuration** (`/dashboard/webhooks`):

   - Set up webhook endpoints for different events
   - Test webhook delivery and retry logic
   - Monitor webhook success/failure rates
   - Debug webhook issues with detailed logs

4. **Integration Testing**:
   - Use sandbox environment for safe testing
   - Simulate various payment scenarios
   - Test error handling and edge cases
   - Validate webhook event handling

## Success Metrics and KPIs

### For Merchants

- **Revenue Growth**: Track total revenue across all payment methods
- **Conversion Rate**: Monitor checkout completion rates
- **Customer Retention**: Analyze repeat purchase behavior
- **Payment Method Performance**: Compare success rates across BTC, sBTC, fiat
- **Geographic Performance**: Track sales by region and optimize accordingly

### For Developers

- **Integration Performance**: API response times and error rates
- **Webhook Reliability**: Delivery success rates and retry metrics
- **User Experience**: Payment flow completion rates
- **Security Metrics**: Failed authentication attempts and security events
- **System Uptime**: API availability and performance monitoring

This comprehensive dashboard provides merchants with complete business management capabilities while offering developers robust APIs and tools for seamless integration with any website or platform.
