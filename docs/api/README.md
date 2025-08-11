# API Documentation & Reference

**Project**: sBTC Payment Gateway  
**API Version**: v1  
**Base URL**: `https://api.sbtc-gateway.com/v1` (Production) | `http://localhost:3000/api/v1` (Development)  
**Last Updated**: August 11, 2025

## Overview

The sBTC Payment Gateway API enables merchants to accept Bitcoin payments that are automatically converted to sBTC (Stacks Bitcoin) for use in smart contracts and DeFi applications. The API follows RESTful principles and returns JSON responses.

## Authentication

All API requests require authentication using API keys. Include your API key in the Authorization header:

```http
Authorization: Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc
```

### API Key Types

- **Test Keys**: `sk_test_...` - For development and testing
- **Live Keys**: `sk_live_...` - For production use

## Base Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "object": "payment_intent",
  "id": "pi_1234567890",
  "status": "succeeded",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "missing_parameter",
    "message": "Missing required parameter: amount",
    "param": "amount"
  }
}
```

## Core Resources

### 1. Payment Intents

Payment intents represent a single payment from creation to completion.

#### Create Payment Intent

**Endpoint:** `POST /payments`

Creates a new payment intent for accepting Bitcoin payments.

**Parameters:**

| Parameter        | Type    | Required | Description                                      |
| ---------------- | ------- | -------- | ------------------------------------------------ |
| `amount`         | integer | Yes      | Payment amount in satoshis (minimum: 10,000)     |
| `currency`       | string  | No       | Currency type, defaults to "BTC"                 |
| `customer_email` | string  | No       | Customer's email address                         |
| `customer_name`  | string  | No       | Customer's name                                  |
| `description`    | string  | No       | Payment description (max 500 chars)              |
| `metadata`       | object  | No       | Key-value pairs for additional data              |
| `expires_in`     | integer | No       | Expiration time in minutes (5-1440, default: 30) |

**Example Request:**

```bash
curl -X POST https://api.sbtc-gateway.com/v1/payments \
  -H "Authorization: Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "currency": "BTC",
    "customer_email": "customer@example.com",
    "description": "Product purchase",
    "metadata": {
      "order_id": "order_123",
      "product_id": "prod_456"
    },
    "expires_in": 60
  }'
```

**Example Response:**

```json
{
  "object": "payment_intent",
  "id": "pi_1234567890abcdef",
  "amount": 100000,
  "currency": "BTC",
  "status": "pending",
  "client_secret": "pi_1234567890abcdef_secret_xyz789",
  "payment_method_data": {
    "bitcoin": {
      "address": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      "amount_btc": 0.001,
      "amount_sats": 100000,
      "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "payment_uri": "bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq?amount=0.001"
    }
  },
  "stacks_address": "SP2H8PY27SEZ03Q4ZKJH69GG1K4L7Z3RZ5JFRX7V2",
  "expires_at": "2025-08-11T15:30:00Z",
  "metadata": {
    "order_id": "order_123",
    "product_id": "prod_456"
  },
  "created": 1691756400
}
```

#### Retrieve Payment Intent

**Endpoint:** `GET /payments/{id}`

Retrieves details of a specific payment intent.

**Example Request:**

```bash
curl https://api.sbtc-gateway.com/v1/payments/pi_1234567890abcdef \
  -H "Authorization: Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc"
```

**Example Response:**

```json
{
  "object": "payment_intent",
  "id": "pi_1234567890abcdef",
  "amount": 100000,
  "currency": "BTC",
  "status": "completed",
  "payment_method_data": {
    "bitcoin": {
      "address": "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      "amount_btc": 0.001,
      "amount_sats": 100000,
      "transaction_id": "a1b2c3d4e5f6...",
      "confirmations": 6
    }
  },
  "stacks_address": "SP2H8PY27SEZ03Q4ZKJH69GG1K4L7Z3RZ5JFRX7V2",
  "stacks_transaction_id": "0x9876543210fedcba...",
  "completed_at": "2025-08-11T15:45:00Z",
  "metadata": {
    "order_id": "order_123",
    "product_id": "prod_456"
  }
}
```

#### List Payment Intents

**Endpoint:** `GET /payments`

Returns a list of payment intents for the authenticated merchant.

**Query Parameters:**

| Parameter        | Type    | Description                                      |
| ---------------- | ------- | ------------------------------------------------ |
| `limit`          | integer | Number of records to return (1-100, default: 10) |
| `starting_after` | string  | Pagination cursor                                |
| `status`         | string  | Filter by status                                 |
| `created`        | object  | Filter by creation date                          |

**Example Request:**

```bash
curl "https://api.sbtc-gateway.com/v1/payments?limit=25&status=completed" \
  -H "Authorization: Bearer sk_test_4eC39HqLyjWDarjtT1zdp7dc"
```

### 2. Merchants

Merchant endpoints for account management.

#### Get Merchant Details

**Endpoint:** `GET /merchants/me`

Retrieves the current merchant's information.

**Example Response:**

```json
{
  "object": "merchant",
  "id": "merch_1234567890",
  "name": "My Store",
  "email": "merchant@example.com",
  "business_type": "e-commerce",
  "website": "https://mystore.com",
  "stacks_address": "SP2H8PY27SEZ03Q4ZKJH69GG1K4L7Z3RZ5JFRX7V2",
  "is_active": true,
  "is_verified": true,
  "verification_level": "full",
  "settings": {
    "min_amount": 10000,
    "max_amount": 100000000,
    "confirmation_threshold": 6,
    "auto_convert": true
  },
  "stats": {
    "total_payments": 150,
    "total_volume": 15000000,
    "successful_payments": 145,
    "last_payment_at": "2025-08-11T14:30:00Z"
  },
  "created_at": "2025-07-01T10:00:00Z"
}
```

#### Update Merchant Settings

**Endpoint:** `PATCH /merchants/me`

Updates merchant settings and configuration.

**Parameters:**

| Parameter                         | Type    | Description                   |
| --------------------------------- | ------- | ----------------------------- |
| `webhook_url`                     | string  | URL for webhook notifications |
| `webhook_events`                  | array   | Events to subscribe to        |
| `settings.min_amount`             | integer | Minimum payment amount        |
| `settings.max_amount`             | integer | Maximum payment amount        |
| `settings.confirmation_threshold` | integer | Required confirmations        |

### 3. sBTC Operations

sBTC-specific endpoints for advanced operations.

#### Create Deposit Address

**Endpoint:** `POST /sbtc/deposit`

Creates a Bitcoin address for sBTC deposits.

**Parameters:**

| Parameter        | Type    | Required | Description                         |
| ---------------- | ------- | -------- | ----------------------------------- |
| `stacks_address` | string  | Yes      | Destination Stacks address          |
| `amount`         | integer | Yes      | Expected deposit amount in satoshis |

**Example Response:**

```json
{
  "deposit_address": "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8gwqeqtwhya45g5jmn2ep",
  "stacks_address": "SP2H8PY27SEZ03Q4ZKJH69GG1K4L7Z3RZ5JFRX7V2",
  "amount_btc": 0.001,
  "amount_sats": 100000,
  "expires_at": "2025-08-11T16:00:00Z",
  "signer_fee": 80000,
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

#### Check sBTC Balance

**Endpoint:** `GET /sbtc/balance/{stacks_address}`

Retrieves sBTC balance for a Stacks address.

**Example Response:**

```json
{
  "address": "SP2H8PY27SEZ03Q4ZKJH69GG1K4L7Z3RZ5JFRX7V2",
  "balance_micro_sbtc": "1000000",
  "balance_sbtc": "1.0",
  "balance_btc": "1.0"
}
```

### 4. Analytics

Analytics endpoints for reporting and insights.

#### Payment Analytics

**Endpoint:** `GET /analytics/payments`

Returns payment analytics for the merchant.

**Query Parameters:**

| Parameter  | Type   | Description                              |
| ---------- | ------ | ---------------------------------------- |
| `period`   | string | Time period: "24h", "7d", "30d", "90d"   |
| `group_by` | string | Group results by: "day", "week", "month" |

**Example Response:**

```json
{
  "period": "7d",
  "total_payments": 25,
  "total_volume": 2500000,
  "successful_payments": 24,
  "success_rate": 0.96,
  "average_amount": 100000,
  "data": [
    {
      "date": "2025-08-05",
      "payments": 5,
      "volume": 500000,
      "success_rate": 1.0
    }
    // ... more data points
  ]
}
```

## Webhooks

Webhooks allow your application to receive real-time notifications about payment events.

### Webhook Events

| Event                | Description                               |
| -------------------- | ----------------------------------------- |
| `payment.created`    | Payment intent created                    |
| `payment.processing` | Bitcoin payment received, processing sBTC |
| `payment.completed`  | sBTC successfully minted                  |
| `payment.failed`     | Payment processing failed                 |
| `payment.expired`    | Payment expired without completion        |

### Webhook Payload

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "payment.completed",
  "data": {
    "object": {
      "id": "pi_1234567890abcdef",
      "amount": 100000,
      "status": "completed",
      "bitcoin_transaction_id": "a1b2c3d4e5f6...",
      "stacks_transaction_id": "0x9876543210fedcba...",
      "completed_at": "2025-08-11T15:45:00Z"
    }
  },
  "created": 1691757900
}
```

### Webhook Verification

Verify webhook signatures using the webhook secret:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}
```

## Error Codes

| Code                    | Description                 |
| ----------------------- | --------------------------- |
| `invalid_request_error` | Invalid request parameters  |
| `authentication_error`  | Invalid API key             |
| `rate_limit_error`      | Too many requests           |
| `payment_error`         | Payment processing error    |
| `blockchain_error`      | Blockchain operation failed |
| `insufficient_funds`    | Insufficient balance        |
| `expired_payment`       | Payment has expired         |

## Rate Limits

API requests are rate limited by API key:

- **Standard**: 100 requests per minute
- **Premium**: 1000 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1691757000
```

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install @sbtc-gateway/node
```

```javascript
const SbtcGateway = require('@sbtc-gateway/node');

const client = new SbtcGateway('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

// Create payment
const payment = await client.payments.create({
  amount: 100000,
  customer_email: 'customer@example.com',
  metadata: { order_id: 'order_123' },
});
```

### Python

```bash
pip install sbtc-gateway
```

```python
import sbtc_gateway

client = sbtc_gateway.Client('sk_test_4eC39HqLyjWDarjtT1zdp7dc')

# Create payment
payment = client.payments.create(
    amount=100000,
    customer_email='customer@example.com',
    metadata={'order_id': 'order_123'}
)
```

## Testing

### Test Data

Use these test values for development:

**Test Stacks Address:**

```
ST000000000000000000002AMW42H
```

**Test Bitcoin Addresses:**

```
tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx (Testnet)
bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4 (Mainnet - for reference)
```

### Test Cards

For simulating different payment scenarios:

| Amount | Outcome            |
| ------ | ------------------ |
| 100000 | Success            |
| 200000 | Insufficient funds |
| 300000 | Expired payment    |
| 400000 | Processing error   |

## Support

- **Documentation**: https://docs.sbtc-gateway.com
- **Support Email**: support@sbtc-gateway.com
- **Discord**: https://discord.gg/sbtc-gateway
- **Status Page**: https://status.sbtc-gateway.com

## Changelog

### v1.0.0 - 2025-08-11

- Initial API release
- Payment intents
- sBTC deposit support
- Webhook notifications
- Merchant management
