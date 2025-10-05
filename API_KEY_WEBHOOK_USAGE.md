# API Key & Webhook Usage After Onboarding

## Complete Guide: How Merchants Use API Keys and Webhooks

---

## 🔑 API Key Lifecycle

### **During Onboarding (Step 5)**

1. **Backend Generates Keys:**
   ```typescript
   POST /api/api-keys/onboarding

   Response:
   {
     "success": true,
     "keys": {
       "test": {
         "apiKey": "sk_test_1a2b3c4d5e6f7g8h9i...",  // ONLY TIME THIS IS SHOWN
         "keyPreview": "sk_test_...8h9i",
         "environment": "test"
       },
       "live": {
         "apiKey": "sk_live_9z8y7x6w5v4u3t2s1r...",  // ONLY TIME THIS IS SHOWN
         "keyPreview": "sk_live_...2s1r",
         "environment": "live"
       }
     },
     "webhookSecret": "whsec_abc123def456..."  // For webhook signature verification
   }
   ```

2. **Storage:**
   - **Database**: Keys are hashed with bcrypt and stored in merchant.apiKeys[]
   - **Frontend**: Merchant copies keys (they're never shown again)
   - **Merchant's Server**: Merchant stores keys in their environment variables

---

## 💻 How Merchants Use API Keys

### **1. Creating Payments from Merchant's Server**

After onboarding, merchants integrate payments into their application:

```javascript
// Merchant's backend (e.g., Node.js/Express)
const fetch = require('node-fetch');

// API key from onboarding
const STACKSPAY_API_KEY = process.env.STACKSPAY_API_KEY; // sk_test_...

app.post('/create-checkout', async (req, res) => {
  const { orderId, amount, customerEmail } = req.body;

  // Call StacksPay API to create payment
  const response = await fetch('http://localhost:4000/api/payments/stx', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STACKSPAY_API_KEY}`, // ← API KEY USED HERE
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      expectedAmount: amount * 1000000, // Convert STX to microSTX
      metadata: `Order #${orderId}`,
      expiresInMinutes: 30,
      customerEmail: customerEmail,
      successUrl: 'https://mystore.com/success',
      cancelUrl: 'https://mystore.com/cancel'
    })
  });

  const payment = await response.json();

  // payment.data contains:
  // - paymentLink: URL for customer to pay
  // - qrCode: QR code for mobile payments
  // - uniqueAddress: Stacks address to receive payment

  res.json({ checkoutUrl: payment.data.paymentLink });
});
```

### **2. Backend API Key Authentication Flow**

When the merchant's server makes the request:

```
┌─────────────────────────────────────────────────────┐
│ 1. Merchant's Server                                 │
│    POST /api/payments/stx                            │
│    Authorization: Bearer sk_test_abc123...           │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 2. StacksPay Backend - apiKeyMiddleware              │
│    /backend/src/middleware/auth.middleware.ts        │
│                                                       │
│    a) Extract API key from header                    │
│    b) Validate format (sk_test_* or sk_live_*)       │
│    c) Hash the key with bcrypt                       │
│    d) Query database for matching hashed key         │
│    e) Verify key is active and not expired           │
│    f) Check IP restrictions (if configured)          │
│    g) Check rate limits                              │
│    h) Attach merchant info to req.merchant           │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 3. Payment Controller                                │
│    /backend/src/controllers/payment/                 │
│    STXPaymentController.ts                           │
│                                                       │
│    - Creates unique STX address for payment          │
│    - Generates QR code                               │
│    - Registers payment with smart contract           │
│    - Stores payment in database                      │
│    - Returns payment link + details                  │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 4. Response to Merchant                              │
│    {                                                 │
│      "success": true,                                │
│      "payment": {                                    │
│        "paymentId": "pay_xyz789",                    │
│        "paymentLink": "https://pay.stackspay.com/...",│
│        "qrCode": "data:image/png;base64,...",        │
│        "uniqueAddress": "ST1ABC...",                 │
│        "expectedAmount": 1000000,                    │
│        "expiresAt": "2025-01-05T12:00:00Z"           │
│      }                                               │
│    }                                                 │
└─────────────────────────────────────────────────────┘
```

### **3. Other API Key Operations**

All these endpoints require API key authentication:

```javascript
// Get payment status
GET /api/payments/stx/:paymentId
Authorization: Bearer sk_test_abc123...

// List all payments
GET /api/payments/stx?page=1&limit=20&status=completed
Authorization: Bearer sk_test_abc123...

// Cancel payment
POST /api/payments/stx/:paymentId/cancel
Authorization: Bearer sk_test_abc123...

// Get analytics
GET /api/payments/stx/analytics
Authorization: Bearer sk_test_abc123...

// Get Chainhook config
GET /api/chainhook/stx/config
Authorization: Bearer sk_test_abc123...
```

---

## 🔔 How Webhooks Work

### **During Onboarding (Step 6)**

Merchant configures webhook endpoint:

```typescript
POST /api/onboarding/webhook-config

Request:
{
  "webhookUrl": "https://mystore.com/webhooks/stackspay",
  "events": [
    "payment.created",
    "payment.completed",
    "payment.failed",
    "payment.expired"
  ]
}

Response:
{
  "success": true,
  "data": {
    "webhookUrl": "https://mystore.com/webhooks/stackspay",
    "webhookSecret": "whsec_abc123...",  // Already generated in step 5
    "events": ["payment.created", "payment.completed", "payment.failed", "payment.expired"]
  }
}
```

### **Webhook Flow During Payment**

```
┌─────────────────────────────────────────────────────┐
│ 1. Customer Pays                                     │
│    - Sends STX to unique address                     │
│    - Transaction broadcasts to Stacks blockchain     │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 2. Chainhook Detects Transaction                     │
│    - Monitors blockchain for STX transfers           │
│    - Matches payment address                         │
│    - Sends event to StacksPay backend                │
│                                                       │
│    POST /api/chainhook/stx/transfers                 │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 3. StacksPay Backend Processes Event                 │
│    /backend/src/controllers/webhook/                 │
│    STXWebhookController.ts                           │
│                                                       │
│    a) Validates Chainhook signature                  │
│    b) Finds payment by address                       │
│    c) Verifies amount matches expected               │
│    d) Updates payment status to 'completed'          │
│    e) Calls smart contract to confirm payment        │
│    f) TRIGGERS MERCHANT WEBHOOK ───────────┐         │
└────────────────────────────────────────────┼─────────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────┐
│ 4. StacksPay Sends Webhook to Merchant               │
│    /backend/src/services/webhook/webhook-service.ts  │
│                                                       │
│    POST https://mystore.com/webhooks/stackspay       │
│    Headers:                                          │
│      Content-Type: application/json                  │
│      X-Webhook-Signature: abc123...  ← HMAC-SHA256   │
│      X-Webhook-Event: payment.completed              │
│                                                       │
│    Body:                                             │
│    {                                                 │
│      "event": "payment.completed",                   │
│      "timestamp": "2025-01-05T10:30:00Z",            │
│      "data": {                                       │
│        "paymentId": "pay_xyz789",                    │
│        "merchantId": "merchant_123",                 │
│        "amount": 1000000,                            │
│        "currency": "STX",                            │
│        "status": "completed",                        │
│        "txId": "0xabc123...",                        │
│        "metadata": "Order #12345"                    │
│      }                                               │
│    }                                                 │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────┐
│ 5. Merchant's Server Receives Webhook                │
│    (Merchant's implementation)                       │
└─────────────────────────────────────────────────────┘
```

### **Merchant's Webhook Handler Implementation**

```javascript
// Merchant's backend (Express.js example)
const express = require('express');
const crypto = require('crypto');

const app = express();

// Webhook secret from onboarding
const WEBHOOK_SECRET = process.env.STACKSPAY_WEBHOOK_SECRET; // whsec_abc123...

app.post('/webhooks/stackspay', express.json(), (req, res) => {
  // 1. Get signature from header
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];

  // 2. Verify signature (CRITICAL for security!)
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('❌ Invalid webhook signature!');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 3. Process webhook event
  console.log('✅ Valid webhook received:', event);

  const { event: eventType, data } = req.body;

  switch (eventType) {
    case 'payment.created':
      // Payment was created, show pending status
      console.log('Payment created:', data.paymentId);
      break;

    case 'payment.completed':
      // Payment successful! Fulfill order
      console.log('Payment completed:', data.paymentId);
      fulfillOrder(data.paymentId, data.metadata);
      break;

    case 'payment.failed':
      // Payment failed, notify customer
      console.log('Payment failed:', data.paymentId);
      notifyCustomerOfFailure(data.paymentId);
      break;

    case 'payment.expired':
      // Payment link expired
      console.log('Payment expired:', data.paymentId);
      break;
  }

  // 4. Always respond with 200 OK
  res.status(200).json({ received: true });
});

async function fulfillOrder(paymentId, metadata) {
  // Extract order ID from metadata
  const orderId = metadata.replace('Order #', '');

  // Update order status in database
  await db.orders.update(orderId, { status: 'paid', paymentId });

  // Send confirmation email
  await emailService.sendOrderConfirmation(orderId);

  // Trigger fulfillment process
  await fulfillmentService.process(orderId);

  console.log(`✅ Order ${orderId} fulfilled!`);
}

app.listen(3000);
```

---

## 🔒 Security Best Practices

### **API Keys**

1. **Never Commit to Git**
   ```bash
   # .gitignore
   .env
   .env.local
   ```

2. **Environment Variables**
   ```bash
   # .env
   STACKSPAY_API_KEY=sk_test_abc123...
   STACKSPAY_WEBHOOK_SECRET=whsec_xyz789...
   ```

3. **Separate Test/Live Keys**
   ```javascript
   const apiKey = process.env.NODE_ENV === 'production'
     ? process.env.STACKSPAY_LIVE_API_KEY
     : process.env.STACKSPAY_TEST_API_KEY;
   ```

4. **Rotate Keys Regularly**
   - Go to `/dashboard/api-keys`
   - Generate new key
   - Update environment variables
   - Delete old key

### **Webhooks**

1. **Always Verify Signature**
   ```javascript
   // NEVER skip signature verification!
   if (signature !== expectedSignature) {
     return res.status(401).json({ error: 'Invalid signature' });
   }
   ```

2. **Use HTTPS Only**
   - Webhook URLs must use HTTPS in production
   - HTTP only allowed for localhost testing

3. **Idempotency**
   ```javascript
   // Handle duplicate webhooks
   const processed = await db.webhooks.find({ id: req.body.id });
   if (processed) {
     return res.status(200).json({ received: true }); // Already processed
   }
   ```

4. **Error Handling**
   ```javascript
   app.post('/webhooks/stackspay', async (req, res) => {
     try {
       // Process webhook
       await processWebhook(req.body);
       res.status(200).json({ received: true });
     } catch (error) {
       console.error('Webhook processing error:', error);
       // Still return 200 to prevent retries
       res.status(200).json({ received: true, error: error.message });
     }
   });
   ```

---

## 📊 Complete Integration Example

```javascript
// ==========================================
// MERCHANT'S COMPLETE INTEGRATION
// ==========================================

const express = require('express');
const crypto = require('crypto');
const fetch = require('node-fetch');

const app = express();

// From onboarding
const STACKSPAY_API_KEY = process.env.STACKSPAY_API_KEY;       // sk_test_...
const WEBHOOK_SECRET = process.env.STACKSPAY_WEBHOOK_SECRET;   // whsec_...

// ============ CREATING PAYMENTS ============
app.post('/api/checkout', async (req, res) => {
  const { productId, quantity, customerEmail } = req.body;

  // Calculate amount
  const product = await db.products.find(productId);
  const amountSTX = product.price * quantity;

  // Create payment with StacksPay
  const response = await fetch('http://localhost:4000/api/payments/stx', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STACKSPAY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      expectedAmount: amountSTX * 1000000, // Convert to microSTX
      metadata: `Order-${Date.now()}`,
      customerEmail,
      expiresInMinutes: 30,
      successUrl: 'https://mystore.com/success',
      cancelUrl: 'https://mystore.com/cart'
    })
  });

  const payment = await response.json();

  // Store payment reference
  await db.orders.create({
    paymentId: payment.payment.paymentId,
    amount: amountSTX,
    status: 'pending',
    customerEmail
  });

  // Redirect customer to payment page
  res.json({ checkoutUrl: payment.payment.paymentLink });
});

// ============ RECEIVING WEBHOOKS ============
app.post('/webhooks/stackspay', express.json(), async (req, res) => {
  // Verify signature
  const signature = req.headers['x-webhook-signature'];
  const expectedSig = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (signature !== expectedSig) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process event
  const { event, data } = req.body;

  if (event === 'payment.completed') {
    // Update order status
    await db.orders.update(
      { paymentId: data.paymentId },
      { status: 'paid', txId: data.txId }
    );

    // Send confirmation email
    await sendEmail(data.customerEmail, 'Order Confirmed!');

    // Fulfill order
    await fulfillmentService.ship(data.paymentId);
  }

  res.status(200).json({ received: true });
});

app.listen(3000);
```

---

## 🎯 Summary

### **API Keys Enable:**
- ✅ Creating payments from merchant's server
- ✅ Checking payment status
- ✅ Listing payments
- ✅ Canceling payments
- ✅ Getting analytics
- ✅ Accessing Chainhook config

### **Webhooks Enable:**
- ✅ Real-time payment notifications
- ✅ Automatic order fulfillment
- ✅ Status updates without polling
- ✅ Event-driven architecture
- ✅ Reliable payment confirmation

### **Complete Flow:**
1. **Onboarding**: Merchant gets API key + webhook secret
2. **Integration**: Merchant adds API key to their server
3. **Create Payment**: Merchant calls StacksPay API with API key
4. **Customer Pays**: Customer sends STX to unique address
5. **Blockchain Event**: Chainhook detects transaction
6. **StacksPay Processes**: Updates payment status
7. **Webhook Sent**: StacksPay sends signed webhook to merchant
8. **Merchant Fulfills**: Merchant's server processes order

---

**This is exactly how Stripe, PayPal, and other payment gateways work! 🚀**
