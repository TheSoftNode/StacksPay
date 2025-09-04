# StacksPay API Reference

## Base URL

- **Testnet**: `https://api-testnet.stackspay.com`
- **Mainnet**: `https://api.stackspay.com`

## Authentication

All API requests require authentication using an API key in the Authorization header:

```
Authorization: Bearer sk_test_your_api_key_here
```

### API Key Types

- **Test Keys**: `sk_test_...` - For development and testing
- **Live Keys**: `sk_live_...` - For production use

## Rate Limits

- **Per API Key**: 1,000 requests per hour
- **Per IP Address**: 100 requests per hour
- **Payment Creation**: 10 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "metadata": {
    "requestId": "req_1234567890",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "error": {
    "type": "validation_error",
    "code": "invalid_amount",
    "message": "Amount must be greater than 0",
    "details": {
      "field": "amount",
      "value": -100
    }
  },
  "metadata": {
    "requestId": "req_1234567890",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Payments API

### Create Payment

Create a new payment request.

**Endpoint**: `POST /api/payments`

**Request Body**:

```json
{
  "amount": 1000000,
  "currency": "BTC",
  "description": "Order #12345",
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel",
  "metadata": {
    "orderId": "12345",
    "customerId": "customer_123"
  }
}
```

**Parameters**:

- `amount` (required): Amount in smallest currency unit (satoshis for BTC, microSTX for STX)
- `currency` (required): Payment currency (`BTC`, `STX`, or `SBTC`)
- `description` (required): Payment description
- `successUrl` (optional): URL to redirect after successful payment
- `cancelUrl` (optional): URL to redirect after cancelled payment
- `metadata` (optional): Key-value pairs for additional data

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "pay_1234567890abcdef",
    "status": "pending",
    "amount": 1000000,
    "currency": "BTC",
    "description": "Order #12345",
    "checkoutUrl": "https://checkout.stackspay.com/pay_1234567890abcdef",
    "addresses": {
      "bitcoin": {
        "depositAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      }
    },
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expiresAt": "2024-01-01T01:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "metadata": {
      "orderId": "12345",
      "customerId": "customer_123"
    }
  }
}
```

### Retrieve Payment

Get details of a specific payment.

**Endpoint**: `GET /api/payments/{payment_id}`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "pay_1234567890abcdef",
    "status": "completed",
    "amount": 1000000,
    "currency": "BTC",
    "description": "Order #12345",
    "transactionId": "a1b2c3d4e5f6...",
    "confirmations": 6,
    "addresses": {
      "bitcoin": {
        "depositAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      }
    },
    "completedAt": "2024-01-01T00:15:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### List Payments

Retrieve a list of payments.

**Endpoint**: `GET /api/payments`

**Query Parameters**:

- `limit` (optional): Number of payments to return (1-100, default: 20)
- `offset` (optional): Number of payments to skip (default: 0)
- `status` (optional): Filter by status (`pending`, `completed`, `failed`, `cancelled`)
- `currency` (optional): Filter by currency (`BTC`, `STX`, `SBTC`)
- `created_after` (optional): Filter payments created after this timestamp
- `created_before` (optional): Filter payments created before this timestamp

**Response**:

```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "pay_1234567890abcdef",
        "status": "completed",
        "amount": 1000000,
        "currency": "BTC",
        "description": "Order #12345",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Cancel Payment

Cancel a pending payment.

**Endpoint**: `DELETE /api/payments/{payment_id}`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "pay_1234567890abcdef",
    "status": "cancelled",
    "cancelledAt": "2024-01-01T00:30:00Z"
  }
}
```

## Merchants API

### Get Merchant Profile

Get current merchant information.

**Endpoint**: `GET /api/merchants/me`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "merchant_1234567890",
    "email": "merchant@example.com",
    "name": "Example Store",
    "stacksAddress": "SP1234567890ABCDEF",
    "walletSetup": true,
    "connectedWallets": ["leather", "xverse"],
    "settings": {
      "notifications": {
        "email": true,
        "webhook": true
      },
      "defaultCurrency": "BTC"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Merchant Profile

Update merchant information.

**Endpoint**: `PUT /api/merchants/me`

**Request Body**:

```json
{
  "name": "Updated Store Name",
  "stacksAddress": "SP1234567890ABCDEF",
  "settings": {
    "notifications": {
      "email": true,
      "webhook": false
    },
    "defaultCurrency": "STX"
  }
}
```

## API Keys API

### List API Keys

Get all API keys for the merchant.

**Endpoint**: `GET /api/api-keys`

**Response**:

```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "keyId": "key_1234567890abcdef",
        "name": "Production Key",
        "keyPreview": "sk_live_1234567890ab****",
        "environment": "live",
        "permissions": ["payments:read", "payments:write"],
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastUsed": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### Create API Key

Generate a new API key.

**Endpoint**: `POST /api/api-keys`

**Request Body**:

```json
{
  "name": "My API Key",
  "environment": "test",
  "permissions": ["payments:read", "payments:write"],
  "description": "Key for development testing"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "keyId": "key_1234567890abcdef",
    "name": "My API Key",
    "apiKey": "sk_test_1234567890abcdef1234567890abcdef",
    "environment": "test",
    "permissions": ["payments:read", "payments:write"],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete API Key

Revoke an API key.

**Endpoint**: `DELETE /api/api-keys/{key_id}`

**Response**:

```json
{
  "success": true,
  "data": {
    "keyId": "key_1234567890abcdef",
    "revoked": true,
    "revokedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Webhooks API

### Create Webhook

Create a new webhook endpoint.

**Endpoint**: `POST /api/webhooks`

**Request Body**:

```json
{
  "url": "https://yoursite.com/webhooks/stackspay",
  "events": ["payment.completed", "payment.failed"],
  "description": "Payment notifications webhook"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "webhook_1234567890abcdef",
    "url": "https://yoursite.com/webhooks/stackspay",
    "events": ["payment.completed", "payment.failed"],
    "secret": "whsec_1234567890abcdef",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### List Webhooks

Get all webhook endpoints.

**Endpoint**: `GET /api/webhooks`

**Response**:

```json
{
  "success": true,
  "data": {
    "webhooks": [
      {
        "id": "webhook_1234567890abcdef",
        "url": "https://yoursite.com/webhooks/stackspay",
        "events": ["payment.completed", "payment.failed"],
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "lastDelivery": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

### Delete Webhook

Delete a webhook endpoint.

**Endpoint**: `DELETE /api/webhooks/{webhook_id}`

## Analytics API

### Payment Analytics

Get payment statistics and analytics.

**Endpoint**: `GET /api/analytics/payments`

**Query Parameters**:

- `period` (optional): Time period (`day`, `week`, `month`, `year`)
- `currency` (optional): Filter by currency
- `start_date` (optional): Start date for custom range
- `end_date` (optional): End date for custom range

**Response**:

```json
{
  "success": true,
  "data": {
    "totalPayments": 1250,
    "totalVolume": 5000000000,
    "successRate": 98.5,
    "averageAmount": 4000000,
    "currency": "BTC",
    "period": "month",
    "breakdown": {
      "completed": 1231,
      "pending": 12,
      "failed": 7,
      "cancelled": 0
    },
    "dailyStats": [
      {
        "date": "2024-01-01",
        "payments": 42,
        "volume": 168000000,
        "averageAmount": 4000000
      }
    ]
  }
}
```

## Webhook Events

### Event Types

- `payment.created`: Payment request created
- `payment.pending`: Payment transaction detected
- `payment.completed`: Payment confirmed and completed
- `payment.failed`: Payment failed or expired
- `payment.cancelled`: Payment cancelled by merchant

### Event Payload

```json
{
  "type": "payment.completed",
  "data": {
    "payment": {
      "id": "pay_1234567890abcdef",
      "status": "completed",
      "amount": 1000000,
      "currency": "BTC",
      "transactionId": "a1b2c3d4e5f6...",
      "completedAt": "2024-01-01T00:15:00Z"
    }
  },
  "created": "2024-01-01T00:15:05Z"
}
```

### Webhook Signature Verification

Webhooks are signed with your webhook secret. Verify the signature:

**Header**: `StacksPay-Signature`

**Verification**:

```javascript
const crypto = require("crypto");

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Error Codes

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

### Error Types

- `authentication_error` - Invalid API key
- `validation_error` - Invalid request parameters
- `rate_limit_error` - Rate limit exceeded
- `not_found_error` - Resource not found
- `permission_error` - Insufficient permissions
- `internal_error` - Server error

### Common Error Codes

- `invalid_api_key` - API key is invalid or revoked
- `invalid_amount` - Amount is invalid or too small
- `invalid_currency` - Unsupported currency
- `payment_not_found` - Payment ID doesn't exist
- `payment_already_completed` - Cannot modify completed payment
- `payment_expired` - Payment has expired
- `webhook_url_invalid` - Webhook URL is not reachable

## SDKs and Libraries

### Official SDKs

- **Node.js**: `npm install @stackspay/node`
- **Python**: `pip install stackspay`

### Community SDKs

- **PHP**: Coming soon
- **Ruby**: Coming soon
- **Go**: Coming soon

## Testing

### Test API Keys

Use test API keys for development:

- All payments use testnet cryptocurrencies
- No real money is transferred
- Full API functionality available

### Test Data

**Test Credit Card Numbers** (for future card support):

- `4242424242424242` - Visa
- `5555555555554444` - Mastercard

**Test Bitcoin Addresses**:

- `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`

## Support

### Getting Help

- **Documentation**: https://docs.stackspay.com
- **API Status**: https://status.stackspay.com
- **Support Email**: support@stackspay.com
- **Discord**: https://discord.gg/stackspay

### Rate Limits and Usage

Monitor your API usage in the merchant dashboard:

- Real-time usage graphs
- Monthly usage summaries
- Rate limit notifications
