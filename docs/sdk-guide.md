# StacksPay SDK Documentation

## Overview

StacksPay provides official SDKs for multiple programming languages to make integration seamless. Our SDKs are published to their respective package managers and provide a developer-friendly interface to the StacksPay API.

## Available SDKs

### Node.js SDK

- **Package**: `@stackspay/node`
- **NPM**: https://www.npmjs.com/package/@stackspay/node
- **Repository**: `/sdk/node`

### Python SDK

- **Package**: `stackspay`
- **PyPI**: https://pypi.org/project/stackspay/
- **Repository**: `/sdk/python`

## Node.js SDK

### Installation

```bash
npm install @stackspay/node
# or
yarn add @stackspay/node
```

### Quick Start

```javascript
const StacksPay = require("@stackspay/node");

// Initialize client
const client = new StacksPay({
  apiKey: "sk_test_your_api_key_here",
  environment: "test", // 'test' or 'live'
});

// Create a payment
async function createPayment() {
  try {
    const payment = await client.payments.create({
      amount: 1000000, // 0.01 BTC in satoshis
      currency: "BTC",
      description: "Order #12345",
      successUrl: "https://yoursite.com/success",
      cancelUrl: "https://yoursite.com/cancel",
    });

    console.log("Payment created:", payment.id);
    console.log("Checkout URL:", payment.checkoutUrl);
  } catch (error) {
    console.error("Error creating payment:", error.message);
  }
}

createPayment();
```

### Complete API Reference

#### Client Initialization

```javascript
const client = new StacksPay({
  apiKey: "your-api-key",
  environment: "test", // 'test' or 'live'
  baseUrl: "https://api.stackspay.com", // Optional, for custom deployments
  timeout: 30000, // Optional, request timeout in ms
});
```

#### Payments API

**Create Payment**

```javascript
const payment = await client.payments.create({
  amount: 1000000, // Amount in smallest currency unit
  currency: "BTC", // 'BTC', 'STX', or 'SBTC'
  description: "Order #123", // Payment description
  successUrl: "https://yoursite.com/success", // Optional
  cancelUrl: "https://yoursite.com/cancel", // Optional
  metadata: {
    // Optional metadata
    orderId: "12345",
    customerId: "67890",
  },
});
```

**Retrieve Payment**

```javascript
const payment = await client.payments.retrieve("payment_id");
console.log(payment.status); // 'pending', 'completed', 'failed', 'cancelled'
```

**List Payments**

```javascript
const payments = await client.payments.list({
  limit: 10,
  status: "completed",
  currency: "BTC",
});
```

**Cancel Payment**

```javascript
const payment = await client.payments.cancel("payment_id");
```

#### Webhooks API

**Create Webhook Endpoint**

```javascript
const webhook = await client.webhooks.create({
  url: "https://yoursite.com/webhooks/stackspay",
  events: ["payment.completed", "payment.failed"],
});
```

**Verify Webhook Signature**

```javascript
const isValid = client.webhooks.verifySignature(
  payload,
  signature,
  webhookSecret
);
```

#### Error Handling

```javascript
try {
  const payment = await client.payments.create(paymentData);
} catch (error) {
  if (error.type === "StacksPayError") {
    console.error("API Error:", error.message);
    console.error("Status Code:", error.statusCode);
    console.error("Error Code:", error.code);
  } else {
    console.error("Network Error:", error.message);
  }
}
```

### Express.js Integration Example

```javascript
const express = require("express");
const StacksPay = require("@stackspay/node");

const app = express();
const client = new StacksPay({ apiKey: process.env.STACKSPAY_API_KEY });

app.use(express.json());

// Create payment endpoint
app.post("/create-payment", async (req, res) => {
  try {
    const { amount, currency, description } = req.body;

    const payment = await client.payments.create({
      amount,
      currency,
      description,
      successUrl: `${req.protocol}://${req.get("host")}/success`,
      cancelUrl: `${req.protocol}://${req.get("host")}/cancel`,
    });

    res.json({
      id: payment.id,
      checkoutUrl: payment.checkoutUrl,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Webhook handler
app.post("/webhooks/stackspay", (req, res) => {
  const signature = req.headers["stackspay-signature"];
  const payload = JSON.stringify(req.body);

  if (
    client.webhooks.verifySignature(
      payload,
      signature,
      process.env.WEBHOOK_SECRET
    )
  ) {
    const { type, data } = req.body;

    switch (type) {
      case "payment.completed":
        console.log("Payment completed:", data.payment.id);
        // Update your database, send confirmation email, etc.
        break;
      case "payment.failed":
        console.log("Payment failed:", data.payment.id);
        // Handle failed payment
        break;
    }

    res.status(200).send("OK");
  } else {
    res.status(400).send("Invalid signature");
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

## Python SDK

### Installation

```bash
pip install stackspay
```

### Quick Start

```python
import stackspay

# Initialize client
client = stackspay.Client(
    api_key='sk_test_your_api_key_here',
    environment='test'  # 'test' or 'live'
)

# Create a payment
def create_payment():
    try:
        payment = client.payments.create(
            amount=1000000,  # 0.01 BTC in satoshis
            currency='BTC',
            description='Order #12345',
            success_url='https://yoursite.com/success',
            cancel_url='https://yoursite.com/cancel'
        )

        print(f'Payment created: {payment.id}')
        print(f'Checkout URL: {payment.checkout_url}')
        return payment
    except stackspay.StacksPayError as e:
        print(f'Error creating payment: {e.message}')
        return None

payment = create_payment()
```

### Complete API Reference

#### Client Initialization

```python
import stackspay

client = stackspay.Client(
    api_key='your-api-key',
    environment='test',  # 'test' or 'live'
    base_url='https://api.stackspay.com',  # Optional
    timeout=30  # Optional, timeout in seconds
)
```

#### Payments API

**Create Payment**

```python
payment = client.payments.create(
    amount=1000000,
    currency='BTC',
    description='Order #123',
    success_url='https://yoursite.com/success',
    cancel_url='https://yoursite.com/cancel',
    metadata={
        'order_id': '12345',
        'customer_id': '67890'
    }
)
```

**Retrieve Payment**

```python
payment = client.payments.retrieve('payment_id')
print(payment.status)  # 'pending', 'completed', 'failed', 'cancelled'
```

**List Payments**

```python
payments = client.payments.list(
    limit=10,
    status='completed',
    currency='BTC'
)

for payment in payments:
    print(f'Payment {payment.id}: {payment.amount} {payment.currency}')
```

**Cancel Payment**

```python
payment = client.payments.cancel('payment_id')
```

#### Webhooks API

**Create Webhook Endpoint**

```python
webhook = client.webhooks.create(
    url='https://yoursite.com/webhooks/stackspay',
    events=['payment.completed', 'payment.failed']
)
```

**Verify Webhook Signature**

```python
is_valid = client.webhooks.verify_signature(
    payload,
    signature,
    webhook_secret
)
```

### Django Integration Example

```python
# views.py
import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import stackspay

client = stackspay.Client(api_key=settings.STACKSPAY_API_KEY)

@require_http_methods(["POST"])
@csrf_exempt
def create_payment(request):
    try:
        data = json.loads(request.body)

        payment = client.payments.create(
            amount=data['amount'],
            currency=data['currency'],
            description=data['description'],
            success_url=f"{request.scheme}://{request.get_host()}/success/",
            cancel_url=f"{request.scheme}://{request.get_host()}/cancel/"
        )

        return JsonResponse({
            'id': payment.id,
            'checkout_url': payment.checkout_url
        })
    except stackspay.StacksPayError as e:
        return JsonResponse({'error': e.message}, status=400)

@csrf_exempt
def webhook_handler(request):
    signature = request.META.get('HTTP_STACKSPAY_SIGNATURE')
    payload = request.body.decode('utf-8')

    if client.webhooks.verify_signature(payload, signature, settings.WEBHOOK_SECRET):
        data = json.loads(payload)
        event_type = data['type']

        if event_type == 'payment.completed':
            payment_data = data['data']['payment']
            # Update your database, send emails, etc.
            print(f"Payment completed: {payment_data['id']}")
        elif event_type == 'payment.failed':
            payment_data = data['data']['payment']
            # Handle failed payment
            print(f"Payment failed: {payment_data['id']}")

        return HttpResponse('OK')
    else:
        return HttpResponse('Invalid signature', status=400)
```

### Flask Integration Example

```python
from flask import Flask, request, jsonify
import stackspay
import os

app = Flask(__name__)
client = stackspay.Client(api_key=os.environ['STACKSPAY_API_KEY'])

@app.route('/create-payment', methods=['POST'])
def create_payment():
    try:
        data = request.json

        payment = client.payments.create(
            amount=data['amount'],
            currency=data['currency'],
            description=data['description'],
            success_url=f"{request.scheme}://{request.host}/success",
            cancel_url=f"{request.scheme}://{request.host}/cancel"
        )

        return jsonify({
            'id': payment.id,
            'checkout_url': payment.checkout_url
        })
    except stackspay.StacksPayError as e:
        return jsonify({'error': e.message}), 400

@app.route('/webhooks/stackspay', methods=['POST'])
def webhook_handler():
    signature = request.headers.get('StacksPay-Signature')
    payload = request.get_data(as_text=True)

    if client.webhooks.verify_signature(payload, signature, os.environ['WEBHOOK_SECRET']):
        data = request.json
        event_type = data['type']

        if event_type == 'payment.completed':
            payment_data = data['data']['payment']
            print(f"Payment completed: {payment_data['id']}")
        elif event_type == 'payment.failed':
            payment_data = data['data']['payment']
            print(f"Payment failed: {payment_data['id']}")

        return 'OK'
    else:
        return 'Invalid signature', 400

if __name__ == '__main__':
    app.run(debug=True)
```

## SDK Publishing Process

### Node.js SDK Publishing

The Node.js SDK is published to NPM using the following process:

1. **Build Process**

   ```bash
   cd sdk/node
   npm run build  # Compiles TypeScript to JavaScript
   npm run test   # Runs test suite
   ```

2. **Version Management**

   ```bash
   npm version patch  # Increment version
   ```

3. **Publishing**

   ```bash
   npm publish --access public
   ```

4. **Package.json Configuration**
   ```json
   {
     "name": "@stackspay/node",
     "version": "1.0.0",
     "description": "Official StacksPay Node.js SDK",
     "main": "dist/index.js",
     "types": "dist/index.d.ts",
     "files": ["dist/"],
     "keywords": ["stackspay", "bitcoin", "stacks", "sbtc", "payments"],
     "repository": {
       "type": "git",
       "url": "https://github.com/TheSoftNode/sbtc-payment-gateway",
       "directory": "sdk/node"
     }
   }
   ```

### Python SDK Publishing

The Python SDK is published to PyPI:

1. **Build Process**

   ```bash
   cd sdk/python
   python -m build  # Creates wheel and source distribution
   ```

2. **Version Management**

   ```python
   # setup.py or pyproject.toml
   version = "1.0.0"
   ```

3. **Publishing**

   ```bash
   python -m twine upload dist/*
   ```

4. **Package Configuration**
   ```toml
   [project]
   name = "stackspay"
   version = "1.0.0"
   description = "Official StacksPay Python SDK"
   keywords = ["stackspay", "bitcoin", "stacks", "sbtc", "payments"]
   authors = [{ name = "StacksPay Team" }]
   ```

## SDK Development Guidelines

### Design Principles

1. **Consistency**: All SDKs follow the same API patterns
2. **Type Safety**: Full TypeScript support for Node.js, type hints for Python
3. **Error Handling**: Comprehensive error types and messages
4. **Documentation**: Inline documentation and examples
5. **Testing**: 100% test coverage requirement

### Common Patterns

#### Authentication

All SDKs use API key authentication:

```
Authorization: Bearer sk_test_1234567890abcdef
```

#### Response Format

Standardized response format across all endpoints:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

#### Error Handling

Consistent error types:

- `AuthenticationError`: Invalid API key
- `ValidationError`: Invalid request parameters
- `RateLimitError`: Rate limit exceeded
- `NetworkError`: Connection issues
- `APIError`: Server errors

### Future SDKs

Planned SDK releases:

- **Go SDK**: For backend services
- **PHP SDK**: For WordPress/WooCommerce
- **Ruby SDK**: For Rails applications
- **Java SDK**: For enterprise applications
- **C# SDK**: For .NET applications

## Support and Resources

### Documentation

- **API Reference**: https://docs.stackspay.com/api
- **SDK Documentation**: https://docs.stackspay.com/sdks
- **Tutorials**: https://docs.stackspay.com/tutorials

### Community

- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our developer community
- **Stack Overflow**: Tag questions with `stackspay`

### Getting Help

- **Email**: sdk@stackspay.com
- **Documentation**: Comprehensive guides and examples
- **Sample Projects**: Full integration examples

The StacksPay SDKs are designed to make cryptocurrency payments as simple as traditional payment processing, with the added benefits of blockchain security and decentralization.
