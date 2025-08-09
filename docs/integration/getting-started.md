# Getting Started

## Quick Start Guide

### 1. Create Account
Sign up for a merchant account at [dashboard.sbtc-gateway.com](https://dashboard.sbtc-gateway.com)

### 2. Generate API Keys
1. Log into your dashboard
2. Navigate to Settings > API Keys
3. Click "Generate New Key"
4. Copy and securely store your key

### 3. Make Your First Payment
```javascript
const response = await fetch('/api/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 0.001,
    currency: 'BTC'
  })
});

const payment = await response.json();
```

### 4. Handle Webhooks
Set up webhook endpoints to receive payment notifications.

## Next Steps
- Read the [API Documentation](./api/)
- Set up [Webhooks](./webhooks.md)
- View [SDK Examples](./sdk-examples.md)
