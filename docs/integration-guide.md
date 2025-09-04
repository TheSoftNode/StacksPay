# StacksPay Integration Guide

## Getting Started

This guide will walk you through integrating StacksPay into your application to accept Bitcoin, STX, and sBTC payments.

## Prerequisites

- A StacksPay merchant account
- Basic knowledge of REST APIs
- A web application or backend service

## Integration Steps

### 1. Create Merchant Account

1. Visit the StacksPay dashboard
2. Sign up with your email
3. Verify your email address
4. Complete merchant onboarding

### 2. Generate API Keys

1. Go to **API Keys** in your dashboard
2. Click **Generate New Key**
3. Choose environment (Test/Live)
4. Set permissions
5. Save the API key securely

### 3. Install SDK (Optional)

**Node.js:**

```bash
npm install @stackspay/node
```

**Python:**

```bash
pip install stackspay
```

### 4. Create Your First Payment

**Using Node.js SDK:**

```javascript
const StacksPay = require("@stackspay/node");

const client = new StacksPay({
  apiKey: "sk_test_your_api_key_here",
});

const payment = await client.payments.create({
  amount: 1000000, // 0.01 BTC in satoshis
  currency: "BTC",
  description: "Test payment",
});

console.log("Checkout URL:", payment.checkoutUrl);
```

**Using Direct API:**

```bash
curl -X POST https://api-testnet.stackspay.com/api/payments \
  -H "Authorization: Bearer sk_test_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000000,
    "currency": "BTC",
    "description": "Test payment"
  }'
```

## Integration Patterns

### 1. E-commerce Integration

Perfect for online stores and marketplaces.

**Flow:**

1. Customer adds items to cart
2. Checkout process begins
3. Create StacksPay payment
4. Redirect to StacksPay checkout
5. Handle webhook notifications
6. Fulfill order

**Example Implementation:**

```javascript
// E-commerce checkout
app.post("/checkout", async (req, res) => {
  const { cartItems, customerEmail } = req.body;

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  // Create payment
  const payment = await stacksPayClient.payments.create({
    amount: total * 100000000, // Convert to satoshis
    currency: "BTC",
    description: `Order for ${customerEmail}`,
    successUrl: `${baseUrl}/order/success`,
    cancelUrl: `${baseUrl}/cart`,
    metadata: {
      customerEmail,
      orderItems: JSON.stringify(cartItems),
    },
  });

  res.json({ checkoutUrl: payment.checkoutUrl });
});

// Webhook handler
app.post("/webhooks/stackspay", (req, res) => {
  const { type, data } = req.body;

  if (type === "payment.completed") {
    const { payment } = data;

    // Parse order details from metadata
    const customerEmail = payment.metadata.customerEmail;
    const orderItems = JSON.parse(payment.metadata.orderItems);

    // Fulfill order
    fulfillOrder(customerEmail, orderItems);

    // Send confirmation email
    sendOrderConfirmation(customerEmail, payment.id);
  }

  res.status(200).send("OK");
});
```

### 2. Subscription/SaaS Integration

For recurring payments and subscription services.

```javascript
// Subscription signup
app.post("/subscribe", async (req, res) => {
  const { plan, customerEmail } = req.body;

  const payment = await stacksPayClient.payments.create({
    amount: plan.price * 100000000,
    currency: "BTC",
    description: `${plan.name} subscription`,
    metadata: {
      type: "subscription",
      customerEmail,
      planId: plan.id,
    },
  });

  res.json({ checkoutUrl: payment.checkoutUrl });
});

// Webhook handler for subscriptions
app.post("/webhooks/stackspay", (req, res) => {
  const { type, data } = req.body;

  if (
    type === "payment.completed" &&
    data.payment.metadata.type === "subscription"
  ) {
    const { payment } = data;

    // Activate subscription
    activateSubscription(
      payment.metadata.customerEmail,
      payment.metadata.planId,
      payment.id
    );
  }

  res.status(200).send("OK");
});
```

### 3. Marketplace Integration

For platforms with multiple vendors.

```javascript
// Marketplace payment with splits
app.post("/marketplace/checkout", async (req, res) => {
  const { items, buyerEmail } = req.body;

  // Calculate totals and vendor splits
  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);
  const platformFee = totalAmount * 0.05; // 5% platform fee

  const payment = await stacksPayClient.payments.create({
    amount: totalAmount * 100000000,
    currency: "BTC",
    description: "Marketplace purchase",
    metadata: {
      type: "marketplace",
      buyerEmail,
      items: JSON.stringify(items),
      platformFee: platformFee.toString(),
    },
  });

  res.json({ checkoutUrl: payment.checkoutUrl });
});
```

### 4. Donation/Crowdfunding Integration

For accepting donations and crowdfunding.

```javascript
// Donation form
app.post("/donate", async (req, res) => {
  const { amount, donorEmail, message, campaign } = req.body;

  const payment = await stacksPayClient.payments.create({
    amount: amount * 100000000,
    currency: "BTC",
    description: `Donation to ${campaign}`,
    metadata: {
      type: "donation",
      donorEmail,
      message,
      campaign,
    },
  });

  res.json({ checkoutUrl: payment.checkoutUrl });
});
```

## Advanced Features

### 1. Multi-Currency Support

```javascript
// Let users choose payment currency
const currencies = ["BTC", "STX", "SBTC"];
const amounts = {
  BTC: 1000000, // 0.01 BTC
  STX: 10000000, // 10 STX
  SBTC: 1000000, // 0.01 sBTC
};

app.post("/create-payment", async (req, res) => {
  const { currency } = req.body;

  if (!currencies.includes(currency)) {
    return res.status(400).json({ error: "Invalid currency" });
  }

  const payment = await stacksPayClient.payments.create({
    amount: amounts[currency],
    currency,
    description: "Multi-currency payment",
  });

  res.json({ checkoutUrl: payment.checkoutUrl });
});
```

### 2. Custom Checkout Experience

Instead of redirecting to StacksPay's checkout, embed the payment in your app:

```javascript
// Get payment details for custom UI
app.get("/payment/:id/details", async (req, res) => {
  const payment = await stacksPayClient.payments.retrieve(req.params.id);

  res.json({
    amount: payment.amount,
    currency: payment.currency,
    address: payment.addresses[payment.currency.toLowerCase()].depositAddress,
    qrCode: payment.qrCode,
    status: payment.status,
  });
});

// Frontend JavaScript for custom checkout
async function createCustomCheckout(paymentId) {
  const response = await fetch(`/payment/${paymentId}/details`);
  const payment = await response.json();

  // Display payment details in your UI
  document.getElementById("payment-amount").textContent = `${
    payment.amount / 100000000
  } ${payment.currency}`;
  document.getElementById("payment-address").textContent = payment.address;
  document.getElementById("qr-code").src = payment.qrCode;

  // Poll for payment status
  const pollInterval = setInterval(async () => {
    const statusResponse = await fetch(`/payment/${paymentId}/details`);
    const updatedPayment = await statusResponse.json();

    if (updatedPayment.status === "completed") {
      clearInterval(pollInterval);
      window.location.href = "/success";
    }
  }, 5000);
}
```

### 3. Webhook Security

Always verify webhook signatures:

```javascript
const crypto = require("crypto");

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post(
  "/webhooks/stackspay",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signature = req.headers["stackspay-signature"];
    const payload = req.body;

    if (
      !verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)
    ) {
      return res.status(400).send("Invalid signature");
    }

    // Process webhook
    const data = JSON.parse(payload);
    handleWebhookEvent(data);

    res.status(200).send("OK");
  }
);
```

## Framework-Specific Guides

### Express.js Integration

```javascript
const express = require("express");
const StacksPay = require("@stackspay/node");

const app = express();
const stacksPay = new StacksPay({ apiKey: process.env.STACKSPAY_API_KEY });

app.use(express.json());

// Create payment endpoint
app.post("/payments", async (req, res) => {
  try {
    const payment = await stacksPay.payments.create(req.body);
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get payment status
app.get("/payments/:id", async (req, res) => {
  try {
    const payment = await stacksPay.payments.retrieve(req.params.id);
    res.json(payment);
  } catch (error) {
    res.status(404).json({ error: "Payment not found" });
  }
});

app.listen(3000);
```

### Next.js Integration

```javascript
// pages/api/payments.js
import StacksPay from '@stackspay/node';

const stacksPay = new StacksPay({ apiKey: process.env.STACKSPAY_API_KEY });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payment = await stacksPay.payments.create(req.body);
      res.status(200).json(payment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// pages/checkout.js
export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1000000,
          currency: 'BTC',
          description: 'Next.js payment'
        })
      });

      const payment = await response.json();
      window.location.href = payment.checkoutUrl;
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Creating Payment...' : 'Pay with StacksPay'}
    </button>
  );
}
```

### Django Integration

```python
# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import stackspay

client = stackspay.Client(api_key=settings.STACKSPAY_API_KEY)

@csrf_exempt
def create_payment(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        try:
            payment = client.payments.create(
                amount=data['amount'],
                currency=data['currency'],
                description=data['description']
            )
            return JsonResponse(payment.to_dict())
        except stackspay.StacksPayError as e:
            return JsonResponse({'error': e.message}, status=400)

@csrf_exempt
def webhook_handler(request):
    # Verify signature and process webhook
    pass
```

## Testing Your Integration

### 1. Use Test API Keys

Always start with test API keys:

- No real money is involved
- Full functionality available
- Easy to test edge cases

### 2. Test Different Scenarios

```javascript
// Test successful payment
const successPayment = await stacksPay.payments.create({
  amount: 1000000,
  currency: "BTC",
  description: "Success test",
});

// Test with invalid amount
try {
  await stacksPay.payments.create({
    amount: -1000,
    currency: "BTC",
    description: "Error test",
  });
} catch (error) {
  console.log("Expected error:", error.message);
}
```

### 3. Test Webhooks Locally

Use tools like ngrok to test webhooks during development:

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL for webhook endpoint
https://abc123.ngrok.io/webhooks/stackspay
```

## Production Deployment

### 1. Environment Variables

```bash
# Production environment variables
STACKSPAY_API_KEY=sk_live_your_production_key
WEBHOOK_SECRET=your_webhook_secret
NODE_ENV=production
```

### 2. Security Checklist

- ✅ Use HTTPS for all endpoints
- ✅ Validate webhook signatures
- ✅ Store API keys securely
- ✅ Implement rate limiting
- ✅ Log all transactions
- ✅ Monitor for errors

### 3. Error Handling

```javascript
app.use((error, req, res, next) => {
  console.error("StacksPay Error:", error);

  if (error.type === "StacksPayError") {
    res.status(error.statusCode || 400).json({
      error: error.message,
      code: error.code,
    });
  } else {
    res.status(500).json({
      error: "Internal server error",
    });
  }
});
```

## Troubleshooting

### Common Issues

**1. Invalid API Key**

- Check environment variables
- Verify key format (sk*test* or sk*live*)
- Ensure key is active in dashboard

**2. Webhook Not Received**

- Verify webhook URL is accessible
- Check signature verification
- Monitor webhook logs in dashboard

**3. Payment Not Completing**

- Check payment expiration time
- Verify correct addresses
- Monitor blockchain confirmations

### Getting Help

- **Documentation**: https://docs.stackspay.com
- **Support**: support@stackspay.com
- **Discord**: Join our developer community
- **GitHub**: Report issues and contribute

## Best Practices

1. **Always verify webhooks** - Never trust payment status without verification
2. **Handle idempotency** - Store payment IDs to prevent duplicates
3. **Implement retries** - Handle network errors gracefully
4. **Monitor performance** - Track API response times and error rates
5. **Keep SDKs updated** - Regularly update to latest versions
6. **Test thoroughly** - Test all payment flows before going live

## Next Steps

- Explore our [SDK documentation](./sdk-guide.md)
- Check out the [API reference](./api-reference.md)
- Read about [system architecture](./architecture.md)
- Join our developer community
