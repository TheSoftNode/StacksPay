# Payment API

## Create Payment

**POST** `/api/v1/payments`

Create a new payment request.

### Request Body
```json
{
  "amount": 0.001,
  "currency": "BTC",
  "metadata": {
    "order_id": "12345"
  },
  "redirectUrl": "https://yoursite.com/success"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": "payment_123",
    "amount": 0.001,
    "currency": "BTC",
    "status": "pending",
    "bitcoinAddress": "bc1q...",
    "expiresAt": "2025-08-09T12:00:00Z"
  }
}
```
