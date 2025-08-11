# Webhooks Documentation

**Real-time notifications for payment events with Stacks ecosystem support**

## Overview

Webhooks allow your application to receive real-time notifications when payment events occur. This is essential for updating order status, triggering fulfillment, and providing immediate user feedback.

**Hackathon Special**: Full support for **both Bitcoin AND STX** payments with automatic conversion to sBTC! Give your customers options - traditional Bitcoin security or modern STX speed.

## Supported Events

### Payment Events

| Event                | Description                             | When Triggered                   |
| -------------------- | --------------------------------------- | -------------------------------- |
| `payment.created`    | Payment session created                 | When customer starts checkout    |
| `payment.pending`    | Payment received, awaiting confirmation | Bitcoin/STX transaction detected |
| `payment.processing` | Payment being processed                 | sBTC conversion in progress      |
| `payment.completed`  | Payment successfully completed          | sBTC received in merchant wallet |
| `payment.failed`     | Payment failed or expired               | Transaction failed or timeout    |
| `payment.refunded`   | Payment refunded to customer            | Refund processed                 |

### STX-Specific Events (Hackathon Feature!)

| Event                      | Description                  | When Triggered            |
| -------------------------- | ---------------------------- | ------------------------- |
| `stx.payment.received`     | STX payment received         | STX transaction confirmed |
| `stx.conversion.started`   | STX to sBTC conversion began | Smart contract initiated  |
| `stx.conversion.completed` | STX converted to sBTC        | Conversion successful     |
| `stx.conversion.failed`    | STX conversion failed        | Conversion error occurred |

### Wallet Connection Events

| Event                      | Description               | When Triggered                 |
| -------------------------- | ------------------------- | ------------------------------ |
| `wallet.connected`         | Stacks wallet connected   | Xverse/Hiro/Leather connection |
| `wallet.payment.initiated` | Payment started in wallet | User confirms payment          |
| `wallet.payment.signed`    | Transaction signed        | Wallet signs transaction       |

## Webhook Payload Structure

### STX Payment Completed Event

```json
{
  "id": "evt_1NvU8n2eZvKYlo2CNtbxF3Qr",
  "type": "payment.completed",
  "created": 1692388000,
  "data": {
    "object": {
      "id": "pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
      "object": "payment",
      "amount": 5000000,
      "amount_received": 5000000,
      "currency": "sbtc",
      "description": "Wireless Headphones",
      "metadata": {
        "order_id": "order_12345",
        "customer_id": "cust_abc123"
      },
      "payment_method": {
        "type": "stx",
        "wallet": "xverse",
        "stx_address": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        "conversion_rate": "0.0004",
        "original_amount": "12500",
        "network_fee": "25"
      },
      "receipt_url": "https://pay.sbtc-gateway.com/receipts/pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
      "status": "completed",
      "created": 1692388000
    }
  }
}
```

### STX Conversion Event

```json
{
  "id": "evt_stx_conversion_123",
  "type": "stx.conversion.completed",
  "created": 1692388120,
  "data": {
    "object": {
      "payment_id": "pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
      "stx_amount": "12500",
      "stx_txid": "0x8912469c8b065c6e2eff5e8f7c9a0d7f6e5a8b9c2d3e4f5a6b7c8d9e0f1a2b3c",
      "sbtc_amount": "5000000",
      "sbtc_txid": "bc1qxy2kgdygjrsqtzq2n0c3kqjx5c5fcjsxwqj5q3j5k8z2x8v9w0e7r6t5y4u3i",
      "conversion_rate": "0.0004",
      "conversion_fee": "25",
      "net_sbtc_received": "4999000",
      "conversion_time": 180,
      "smart_contract": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.sbtc-payment"
    }
  }
}
```

## Stacks Wallet Integration

### Handling Multiple Wallet Types

```javascript
// Express.js webhook handler
app.post('/webhooks/sbtc-gateway', (request, response) => {
  const event = request.body;

  switch (event.type) {
    case 'payment.completed':
      const payment = event.data.object;

      // Handle different payment methods
      if (payment.payment_method.type === 'stx') {
        handleStxPayment(payment);
      } else if (payment.payment_method.type === 'bitcoin') {
        handleBitcoinPayment(payment);
      }
      break;

    case 'wallet.connected':
      const wallet = event.data.object;
      handleWalletConnection(wallet);
      break;
  }

  response.json({ received: true });
});

function handleStxPayment(payment) {
  const { payment_method } = payment;

  console.log(`STX Payment Details:`);
  console.log(`- Wallet: ${payment_method.wallet}`);
  console.log(`- STX Amount: ${payment_method.original_amount}`);
  console.log(`- sBTC Received: ${payment.amount}`);
  console.log(`- Conversion Rate: ${payment_method.conversion_rate}`);

  // Update order status
  updateOrderStatus(payment.metadata.order_id, 'paid');

  // Send confirmation email
  sendPaymentConfirmation(payment);
}
```

### Wallet-Specific Handling

```javascript
function handleWalletConnection(wallet) {
  switch (wallet.wallet_type) {
    case 'xverse':
      // Xverse wallet connected
      console.log('Xverse wallet connected:', wallet.stx_address);
      break;
    case 'hiro':
      // Hiro wallet connected
      console.log('Hiro wallet connected:', wallet.stx_address);
      break;
    case 'leather':
      // Leather wallet connected
      console.log('Leather wallet connected:', wallet.stx_address);
      break;
  }
}
```

## Testing with Stacks Testnet

### Setup Test Environment

```javascript
// Use testnet for development
const TESTNET_WEBHOOK_URL = 'https://api-testnet.sbtc-gateway.com/webhooks';

// Test STX payment webhook
const testStxPayment = {
  id: 'evt_test_stx_123',
  type: 'payment.completed',
  data: {
    object: {
      id: 'pay_test_123',
      amount: 1000000, // 0.01 sBTC
      payment_method: {
        type: 'stx',
        wallet: 'xverse',
        original_amount: '2500', // 2500 STX on testnet
        conversion_rate: '0.0004',
      },
    },
  },
};
```

## Best Practices for Hackathon

### Best Practices for Hackathon

### 1. Handle Both Bitcoin and STX Payments

```javascript
function processPayment(payment) {
  const { payment_method, amount } = payment;

  // Log payment details
  console.log(`🎉 Payment received!`);
  console.log(`- Method: ${payment_method.type}`);
  console.log(`- Amount: ${amount} satoshis sBTC`);

  if (payment_method.type === 'stx') {
    console.log(`- Original STX: ${payment_method.original_amount}`);
    console.log(`- Wallet: ${payment_method.wallet}`);
    console.log(`- Conversion: ${payment_method.conversion_time}s`);
    console.log(`- Why customer chose STX: Fast and cheap! ⚡💸`);
  } else if (payment_method.type === 'bitcoin') {
    console.log(`- Direct Bitcoin payment`);
    console.log(`- Why customer chose Bitcoin: Security and familiarity 🔒`);
  }

  // Common fulfillment logic regardless of payment method
  fulfillOrder(payment.metadata.order_id);
}
```

### 2. Demo-Friendly Logging

```javascript
const chalk = require('chalk');

function logPaymentEvent(event) {
  console.log(chalk.green('🎉 Payment Event Received!'));
  console.log(chalk.blue(`Type: ${event.type}`));
  console.log(chalk.yellow(`ID: ${event.id}`));

  if (event.type === 'payment.completed') {
    const payment = event.data.object;
    if (payment.payment_method.type === 'stx') {
      console.log(chalk.magenta(`⚡ STX → sBTC Payment:`));
      console.log(`  ${payment.payment_method.original_amount} STX → ${payment.amount} sBTC`);
      console.log(`  Conversion time: ${payment.payment_method.conversion_time}s`);
      console.log(`  Customer chose: SPEED & LOW FEES 🚀`);
    } else {
      console.log(chalk.cyan(`🔒 Direct Bitcoin Payment:`));
      console.log(`  ${payment.amount} sBTC received`);
      console.log(`  Customer chose: SECURITY & FAMILIARITY`);
    }
  }
}
```

### 3. Real-time Dashboard Updates

```javascript
// WebSocket integration for live demo
const io = require('socket.io')(server);

app.post('/webhooks/sbtc-gateway', (req, res) => {
  const event = req.body;

  // Process webhook
  handleWebhookEvent(event);

  // Send real-time update to dashboard
  io.emit('payment-update', {
    type: event.type,
    data: event.data.object,
    timestamp: Date.now(),
  });

  res.json({ received: true });
});
```

This enhanced webhook system is perfect for your hackathon project, providing seamless integration with **both Bitcoin and Stacks wallets** for maximum customer choice! Whether customers prefer traditional Bitcoin security or modern STX speed, they all end up with the same result - merchants receive sBTC payments! 🚀
