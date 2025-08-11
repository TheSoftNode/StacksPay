# User Experience Guide - For All Audiences

**Project**: sBTC Payment Gateway  
**Audience**: Customers, Merchants, and Developers  
**Last Updated**: August 11, 2025

## 🎯 Three User Types Overview

The sBTC Payment Gateway serves three distinct user types, each with different needs and experiences:

### 👤 **Customers** - Payment Users

People making purchases online who need to pay with Bitcoin

### 🏪 **Merchants** - Business Owners

Businesses that want to accept Bitcoin payments (like using Stripe)

### 👨‍💻 **Developers** - Integration Specialists

Technical teams integrating Bitcoin payments into applications

---

## 👤 Customer Experience

### What Customers See

**Simple Payment Flow:**

1. **Shop normally** on merchant websites
2. **Choose Bitcoin payment** at checkout
3. **Scan QR code** or copy Bitcoin address
4. **Send payment** from any Bitcoin wallet
5. **Get confirmation** when payment is complete

### Customer Benefits

✅ **Familiar Experience**: Works like any online payment  
✅ **Any Bitcoin Wallet**: Use Coinbase, Cash App, hardware wallets, etc.  
✅ **Global Access**: No geographic restrictions  
✅ **Privacy**: No personal banking information required  
✅ **Fast Settlement**: Near-instant confirmation  
✅ **Low Fees**: Typically lower than credit cards

### Customer Payment Process

#### Step 1: Checkout

```
🛒 Customer completes shopping cart
💰 Selects "Pay with Bitcoin" option
📱 Gets payment details screen
```

#### Step 2: Payment

```
📱 QR Code displayed for mobile wallets
📋 Bitcoin address and amount shown
⏱️ 30-minute payment window
🔄 Real-time status updates
```

#### Step 3: Confirmation

```
✅ Payment detected instantly
⏳ Waiting for Bitcoin confirmations
🎉 Order confirmed and fulfilled
📧 Email receipt sent
```

### Mobile-First Design

- **Large QR codes** for easy scanning
- **Copy/paste buttons** for addresses
- **Real-time updates** during payment
- **Clear instructions** in multiple languages

---

## 🏪 Merchant Experience

### What Merchants Get

**Stripe-like Dashboard:**

- Real-time payment monitoring
- Transaction history and analytics
- Customer management
- Webhook configuration
- API key management
- Financial reporting

### Merchant Benefits

✅ **Easy Setup**: Register and start accepting payments in minutes  
✅ **Lower Fees**: Typically 1-2% vs 3-4% for credit cards  
✅ **No Chargebacks**: Bitcoin transactions are final  
✅ **Global Reach**: Accept payments from anywhere  
✅ **Fast Settlement**: Receive sBTC immediately  
✅ **API Integration**: Works with existing e-commerce platforms

### Merchant Onboarding Process

#### Step 1: Registration (5 minutes)

```typescript
// Merchant signs up at dashboard.sbtc-gateway.com
{
  businessName: "My Online Store",
  email: "owner@mystore.com",
  businessType: "e-commerce",
  website: "https://mystore.com"
}
```

#### Step 2: Setup (10 minutes)

```typescript
// Configure payment settings
{
  stacksAddress: "SP2H8PY...",  // Where to receive sBTC
  webhookUrl: "https://mystore.com/webhooks/sbtc",
  minAmount: 10000,  // $1 minimum (0.0001 BTC)
  maxAmount: 100000000,  // $1000 maximum (0.1 BTC)
  confirmationThreshold: 6  // Bitcoin confirmations required
}
```

#### Step 3: Integration (30 minutes)

```javascript
// Add to existing checkout
const payment = await sbtcGateway.payments.create({
  amount: 50000, // $5 in satoshis
  customer_email: 'customer@example.com',
  metadata: { order_id: 'order_123' },
});

// Display Bitcoin payment page
window.location.href = payment.payment_url;
```

### Merchant Dashboard Features

#### 📊 **Analytics Dashboard**

- Real-time transaction monitoring
- Revenue analytics and trends
- Payment success rates
- Customer geography insights
- Peak transaction times

#### 💳 **Payment Management**

- View all transactions
- Refund management
- Dispute resolution
- Payment status tracking
- Customer communication

#### 🔧 **Configuration**

- API key management
- Webhook setup and testing
- Payment limits and rules
- Business information updates
- Security settings

#### 📈 **Business Intelligence**

- Revenue forecasting
- Payment pattern analysis
- Customer behavior insights
- Conversion rate optimization
- Financial reporting

---

## 👨‍💻 Developer Experience

### What Developers Get

**Stripe-Compatible API:**

- RESTful API endpoints
- Comprehensive documentation
- Multiple SDKs (JS, Python, PHP, etc.)
- Sandbox environment
- Webhook testing tools
- Real-time status updates

### Developer Benefits

✅ **Familiar API**: Stripe-like interface for easy migration  
✅ **Comprehensive SDKs**: Pre-built libraries for popular languages  
✅ **Sandbox Testing**: Full testnet environment  
✅ **Detailed Docs**: Interactive API explorer  
✅ **Webhook Testing**: Built-in webhook testing tools  
✅ **Developer Support**: Dedicated technical support

### Integration Examples

#### Quick Start (JavaScript/Node.js)

```javascript
// Install SDK
npm install @sbtc-gateway/node

// Initialize client
const SbtcGateway = require('@sbtc-gateway/node');
const gateway = new SbtcGateway('sk_test_...');

// Create payment
const payment = await gateway.payments.create({
  amount: 100000,  // 0.001 BTC in satoshis
  currency: 'BTC',
  customer_email: 'customer@example.com',
  metadata: {
    order_id: 'order_123',
    product_name: 'Digital Product'
  }
});

// Redirect customer to payment page
res.json({
  payment_url: `https://checkout.sbtc-gateway.com/${payment.id}`,
  bitcoin_address: payment.payment_method_data.bitcoin.address,
  qr_code: payment.payment_method_data.bitcoin.qr_code
});
```

#### Webhook Handler

```javascript
app.post('/webhooks/sbtc', (req, res) => {
  const signature = req.headers['x-sbtc-signature'];
  const payload = req.body;

  // Verify webhook signature
  if (!gateway.webhooks.verify(payload, signature, webhook_secret)) {
    return res.status(400).send('Invalid signature');
  }

  // Handle payment events
  switch (payload.type) {
    case 'payment.completed':
      // Fulfill order
      fulfillOrder(payload.data.object.metadata.order_id);
      break;
    case 'payment.failed':
      // Handle failure
      handlePaymentFailure(payload.data.object.id);
      break;
  }

  res.status(200).send('OK');
});
```

#### E-commerce Platform Integration

**WooCommerce Plugin:**

```php
// wp-content/plugins/sbtc-gateway/sbtc-gateway.php
class WC_Gateway_SBTC extends WC_Payment_Gateway {
    public function process_payment($order_id) {
        $order = wc_get_order($order_id);

        $payment = $this->sbtc_client->payments->create([
            'amount' => $order->get_total() * 100000000, // Convert to satoshis
            'customer_email' => $order->get_billing_email(),
            'metadata' => ['order_id' => $order_id]
        ]);

        return [
            'result' => 'success',
            'redirect' => $payment->payment_url
        ];
    }
}
```

**Shopify App:**

```javascript
// Shopify app integration
app.post('/payment/create', async (req, res) => {
  const { amount, customer, order } = req.body;

  const payment = await sbtcGateway.payments.create({
    amount: Math.round(amount * 100000000), // USD to satoshis
    customer_email: customer.email,
    metadata: {
      shopify_order_id: order.id,
      shop_domain: req.headers['x-shopify-shop-domain'],
    },
  });

  res.json({
    payment_url: payment.payment_url,
    bitcoin_address: payment.payment_method_data.bitcoin.address,
  });
});
```

### Developer Tools

#### 🛠️ **API Explorer**

- Interactive API documentation
- Try endpoints directly in browser
- Code generation for multiple languages
- Request/response examples

#### 🧪 **Sandbox Environment**

- Full testnet integration
- Simulated Bitcoin payments
- Webhook testing
- Performance testing

#### 📚 **Documentation**

- Step-by-step integration guides
- Platform-specific tutorials
- Best practices and patterns
- Troubleshooting guides

#### 🔍 **Monitoring & Debugging**

- Real-time API logs
- Error tracking and alerts
- Performance metrics
- Request replay tools

---

## 🔄 Complete User Journey

### Example: Online Store Purchase

#### 1. **Customer** visits merchant website

```
👤 Customer browses products
🛒 Adds items to cart
💳 Proceeds to checkout
```

#### 2. **Merchant** processes checkout

```
🏪 Merchant's system calls sBTC Gateway API
📱 Payment page generated with QR code
🔗 Customer redirected to payment page
```

#### 3. **Developer** integration works

```
👨‍💻 API creates payment intent
🔧 Webhook system monitors payment
⚡ Real-time updates sent to merchant
```

#### 4. **Customer** completes payment

```
📱 Customer scans QR code
💰 Sends Bitcoin from wallet
✅ Payment confirmed automatically
```

#### 5. **Everyone** gets notified

```
👤 Customer: Order confirmation email
🏪 Merchant: Payment received notification
👨‍💻 Developer: Webhook fired, order fulfilled
```

---

## 🎯 Getting Started by User Type

### 👤 **For Customers**

- No registration required
- Works with any Bitcoin wallet
- Follow payment instructions on checkout pages
- Contact merchant for payment support

### 🏪 **For Merchants**

1. **Sign up** at [dashboard.sbtc-gateway.com](https://dashboard.sbtc-gateway.com)
2. **Complete verification** (business info, Stacks address)
3. **Get API keys** from dashboard
4. **Integrate** with your website or platform
5. **Start accepting** Bitcoin payments immediately

### 👨‍💻 **For Developers**

1. **Review API docs** at [docs.sbtc-gateway.com](https://docs.sbtc-gateway.com)
2. **Get sandbox keys** for testing
3. **Install SDK** for your language
4. **Build integration** using provided examples
5. **Test thoroughly** before going live

---

This multi-audience approach ensures that each user type gets the information and experience they need, while maintaining the familiar patterns they expect from modern payment systems like Stripe.
