# API Endpoints Documentation

**Complete API reference for dual Bitcoin + STX payment gateway**

## Base URL

```
Production: https://api.sbtc-gateway.com
Testnet: https://api-testnet.sbtc-gateway.com
Local: http://localhost:3000/api
```

## Authentication

All API requests require authentication using API keys:

```bash
curl -H "Authorization: Bearer sk_test_..." \
     -H "Content-Type: application/json" \
     https://api.sbtc-gateway.com/v1/payments
```

## Payment Endpoints

### Create Payment

Create a new payment session with both Bitcoin and STX options.

**Endpoint**: `POST /v1/payments`

**Request Body**:

```json
{
  "amount": 5000000,
  "currency": "satoshis",
  "payment_methods": ["bitcoin", "stx"],
  "description": "Wireless Headphones",
  "customer_email": "customer@example.com",
  "metadata": {
    "order_id": "order_12345",
    "customer_id": "cust_abc123"
  },
  "expires_in": 1800
}
```

**Response**:

```json
{
  "id": "pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
  "object": "payment",
  "amount": 5000000,
  "currency": "sbtc",
  "status": "pending",
  "payment_methods": {
    "bitcoin": {
      "enabled": true,
      "address": "bc1qxy2kgdygjrsqtzq2n0c3kqjx5c5fcjsxwqj5q3",
      "amount_btc": "0.00050000",
      "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
      "payment_url": "https://pay.sbtc-gateway.com/btc/pay_1NvU8n2eZvKYlo2CNtbxF3Qr"
    },
    "stx": {
      "enabled": true,
      "amount_stx": "12500",
      "smart_contract": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.sbtc-payment",
      "supported_wallets": ["xverse", "hiro", "leather"],
      "payment_url": "https://pay.sbtc-gateway.com/stx/pay_1NvU8n2eZvKYlo2CNtbxF3Qr"
    }
  },
  "description": "Wireless Headphones",
  "metadata": {
    "order_id": "order_12345",
    "customer_id": "cust_abc123"
  },
  "created": 1692388000,
  "expires_at": 1692389800
}
```

### Retrieve Payment

Get payment details and current status.

**Endpoint**: `GET /v1/payments/{PAYMENT_ID}`

**Response**:

```json
{
  "id": "pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
  "object": "payment",
  "amount": 5000000,
  "currency": "sbtc",
  "status": "completed",
  "payment_method_used": {
    "type": "stx",
    "wallet": "xverse",
    "original_amount": "12500",
    "conversion_rate": "0.0004",
    "conversion_time": 180,
    "network_fee": "25"
  },
  "transactions": {
    "stx_transaction": {
      "txid": "0x8912469c8b065c6e2eff5e8f7c9a0d7f6e5a8b9c2d3e4f5a6b7c8d9e0f1a2b3c",
      "confirmations": 6,
      "confirmed_at": 1692388120
    },
    "sbtc_transaction": {
      "txid": "bc1qxy2kgdygjrsqtzq2n0c3kqjx5c5fcjsxwqj5q3j5k8z2x8v9w0e7r6t5y4u3i",
      "amount": 4999000,
      "confirmed_at": 1692388300
    }
  },
  "receipt_url": "https://pay.sbtc-gateway.com/receipts/pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
  "created": 1692388000,
  "completed_at": 1692388300
}
```

### List Payments

Get a list of payments for your account.

**Endpoint**: `GET /v1/payments`

**Query Parameters**:

- `limit`: Number of payments to return (1-100, default 10)
- `starting_after`: Payment ID for pagination
- `status`: Filter by status (`pending`, `completed`, `failed`)
- `payment_method`: Filter by method (`bitcoin`, `stx`)

**Response**:

```json
{
  "object": "list",
  "data": [
    {
      "id": "pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
      "amount": 5000000,
      "status": "completed",
      "payment_method_used": {
        "type": "stx",
        "wallet": "xverse"
      },
      "created": 1692388000
    }
  ],
  "has_more": false,
  "url": "/v1/payments"
}
```

## Bitcoin-Specific Endpoints

### Get Bitcoin Payment Details

**Endpoint**: `GET /v1/payments/{PAYMENT_ID}/bitcoin`

**Response**:

```json
{
  "payment_id": "pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
  "bitcoin_address": "bc1qxy2kgdygjrsqtzq2n0c3kqjx5c5fcjsxwqj5q3",
  "amount_btc": "0.00050000",
  "amount_satoshis": 50000,
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "status": "waiting_for_payment",
  "confirmations_required": 1,
  "expires_at": 1692389800
}
```

## STX-Specific Endpoints

### Get STX Payment Details

**Endpoint**: `GET /v1/payments/{PAYMENT_ID}/stx`

**Response**:

```json
{
  "payment_id": "pay_1NvU8n2eZvKYlo2CNtbxF3Qr",
  "amount_stx": "12500",
  "amount_microstx": 12500000000,
  "smart_contract": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.sbtc-payment",
  "function_name": "process-payment",
  "supported_wallets": [
    {
      "name": "xverse",
      "type": "mobile_desktop",
      "connect_url": "https://pay.sbtc-gateway.com/connect/xverse/pay_1NvU8n2eZvKYlo2CNtbxF3Qr"
    },
    {
      "name": "hiro",
      "type": "browser_extension",
      "connect_url": "https://pay.sbtc-gateway.com/connect/hiro/pay_1NvU8n2eZvKYlo2CNtbxF3Qr"
    },
    {
      "name": "leather",
      "type": "browser_extension",
      "connect_url": "https://pay.sbtc-gateway.com/connect/leather/pay_1NvU8n2eZvKYlo2CNtbxF3Qr"
    }
  ],
  "conversion_rate": "0.0004",
  "estimated_conversion_time": 180,
  "status": "waiting_for_payment",
  "expires_at": 1692389800
}
```

### Initiate STX Wallet Connection

**Endpoint**: `POST /v1/payments/{PAYMENT_ID}/stx/connect`

**Request Body**:

```json
{
  "wallet_type": "xverse",
  "wallet_address": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7"
}
```

**Response**:

```json
{
  "connection_id": "conn_abc123",
  "wallet_type": "xverse",
  "wallet_address": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "transaction_data": {
    "contract_address": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "contract_name": "sbtc-payment",
    "function_name": "process-payment",
    "function_args": ["u12500", "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE"],
    "network": "testnet"
  },
  "expires_at": 1692389800
}
```

## Conversion Endpoints

### Get Real-time Conversion Rates

**Endpoint**: `GET /v1/rates`

**Response**:

```json
{
  "timestamp": 1692388000,
  "rates": {
    "btc_to_usd": 45250.0,
    "stx_to_usd": 0.18,
    "stx_to_btc": 0.000004,
    "conversion_fees": {
      "bitcoin_to_sbtc": "0.1%",
      "stx_to_sbtc": "0.2%"
    }
  },
  "processing_times": {
    "bitcoin_average": 1800,
    "stx_average": 180
  }
}
```

### Calculate Payment Amounts

**Endpoint**: `POST /v1/calculate`

**Request Body**:

```json
{
  "amount": 100.0,
  "from_currency": "usd",
  "to_currencies": ["bitcoin", "stx"]
}
```

**Response**:

```json
{
  "usd_amount": 100.0,
  "calculations": {
    "bitcoin": {
      "amount": "0.00221000",
      "amount_satoshis": 221000,
      "network_fee": 1500,
      "total_satoshis": 222500
    },
    "stx": {
      "amount": "555.56",
      "amount_microstx": 555560000,
      "network_fee": 1000,
      "conversion_fee": 1112,
      "total_microstx": 555561112
    }
  },
  "final_sbtc_amount": 221000
}
```

## Merchant Endpoints

### Create Merchant Account

**Endpoint**: `POST /v1/merchants`

**Request Body**:

```json
{
  "business_name": "Tech Store Inc",
  "email": "merchant@techstore.com",
  "business_type": "e-commerce",
  "website": "https://techstore.com",
  "stacks_address": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  "bitcoin_address": "bc1qxy2kgdygjrsqtzq2n0c3kqjx5c5fcjsxwqj5q3",
  "payment_settings": {
    "accept_bitcoin": true,
    "accept_stx": true,
    "auto_convert_to_usd": false,
    "minimum_payment": 10000,
    "maximum_payment": 100000000
  }
}
```

**Response**:

```json
{
  "id": "merch_1NvU8n2eZvKYlo2CNtbxF3Qr",
  "object": "merchant",
  "business_name": "Tech Store Inc",
  "email": "merchant@techstore.com",
  "status": "active",
  "api_keys": {
    "test": "sk_test_...",
    "live": "sk_live_..."
  },
  "payment_settings": {
    "accept_bitcoin": true,
    "accept_stx": true,
    "auto_convert_to_usd": false
  },
  "created": 1692388000
}
```

## Webhook Endpoints

### List Webhook Endpoints

**Endpoint**: `GET /v1/webhook_endpoints`

### Create Webhook Endpoint

**Endpoint**: `POST /v1/webhook_endpoints`

**Request Body**:

```json
{
  "url": "https://yoursite.com/webhooks/sbtc-gateway",
  "enabled_events": [
    "payment.completed",
    "payment.failed",
    "stx.conversion.completed",
    "bitcoin.confirmation.received"
  ]
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "type": "invalid_request_error",
    "code": "payment_method_not_supported",
    "message": "The requested payment method is not enabled for this merchant.",
    "param": "payment_methods"
  }
}
```

## Common Error Codes

- `payment_expired`: Payment window has expired
- `insufficient_amount`: Payment amount is below minimum
- `conversion_failed`: STX to sBTC conversion failed
- `wallet_connection_failed`: STX wallet connection failed
- `bitcoin_confirmation_timeout`: Bitcoin transaction took too long
- `invalid_stx_address`: Invalid Stacks address provided
- `smart_contract_error`: STX smart contract execution failed

## Rate Limits

- Test mode: 100 requests per minute
- Live mode: 1000 requests per minute
- Webhook deliveries: No limit

## SDKs and Libraries

### JavaScript/Node.js

```bash
npm install sbtc-payment-gateway
```

```javascript
const { PaymentGateway } = require('sbtc-payment-gateway');

const gateway = new PaymentGateway('sk_test_...');

// Create payment with both options
const payment = await gateway.payments.create({
  amount: 5000000,
  payment_methods: ['bitcoin', 'stx'],
  customer_email: 'customer@example.com',
});

console.log('Bitcoin payment URL:', payment.payment_methods.bitcoin.payment_url);
console.log('STX payment URL:', payment.payment_methods.stx.payment_url);
```

This API provides complete support for both Bitcoin and STX payments while maintaining a unified sBTC experience for merchants!
