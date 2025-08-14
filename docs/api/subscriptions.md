# Subscription Management API Documentation

**Version**: v1  
**Base URL**: `https://api.sbtc-gateway.com/v1`  
**Authentication**: Bearer token (API Key)

---

## Overview

The sBTC Payment Gateway Subscription API enables merchants to create and manage recurring payment subscriptions using Bitcoin, Stacks (STX), and sBTC. Our subscription system provides enterprise-grade features including metered billing, usage analytics, proration, and intelligent retry logic.

### Key Features

- **Multi-Currency Support**: Accept payments in BTC, STX, and sBTC
- **Flexible Billing Cycles**: Daily, weekly, monthly, and yearly intervals
- **Metered Billing**: Usage-based pricing with overage handling
- **Proration**: Automatic billing adjustments for plan changes
- **Usage Analytics**: Real-time monitoring and historical reporting
- **Intelligent Retries**: Exponential backoff for failed payments
- **Webhook Integration**: Real-time event notifications

---

## Authentication

All API requests require authentication using your API key in the Authorization header:

```http
Authorization: Bearer pk_test_your_api_key_here
```

**API Key Types**:
- **Test Keys**: `pk_test_...` - For development and testing
- **Live Keys**: `pk_live_...` - For production transactions

---

## Rate Limiting

| Endpoint | Rate Limit |
|----------|------------|
| GET requests | 200 requests/minute |
| POST requests | 50 requests/minute |
| Plan creation | 20 requests/minute |
| Usage recording | 100 requests/minute |

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Window reset time (Unix timestamp)

---

# Subscription Plans

## Create Subscription Plan

Create a new subscription plan for your customers.

**Endpoint**: `POST /api/v1/subscription-plans`

### Request Body

```json
{
  "name": "Pro Plan - Monthly",
  "description": "Professional subscription with metered usage",
  "amount": 5000,
  "currency": "USD",
  "interval": "month",
  "intervalCount": 1,
  "trialDays": 14,
  "setupFee": 1000,
  "usageType": "metered",
  "meteredComponents": [
    {
      "id": "api_calls",
      "name": "API Calls",
      "unitName": "calls",
      "pricePerUnit": 0.01,
      "includedUnits": 10000,
      "overage": "charge"
    },
    {
      "id": "storage",
      "name": "Storage",
      "unitName": "GB", 
      "pricePerUnit": 0.50,
      "includedUnits": 100,
      "overage": "charge"
    }
  ],
  "active": true
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Plan name (1-100 characters) |
| `description` | string | Yes | Plan description |
| `amount` | integer | Yes | Plan price in cents (e.g., 5000 = $50.00) |
| `currency` | string | No | Currency code (USD, BTC, STX, sBTC). Default: USD |
| `interval` | string | Yes | Billing interval (day, week, month, year) |
| `intervalCount` | integer | No | Number of intervals between billings. Default: 1 |
| `trialDays` | integer | No | Trial period in days (0-365) |
| `setupFee` | integer | No | One-time setup fee in cents |
| `usageType` | string | No | Billing type (licensed, metered). Default: licensed |
| `meteredComponents` | array | No | Usage components (required if usageType = metered) |
| `active` | boolean | No | Plan availability. Default: true |

### Metered Component Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique component identifier |
| `name` | string | Yes | Human-readable component name |
| `unitName` | string | Yes | Unit of measurement (calls, GB, users, etc.) |
| `pricePerUnit` | number | Yes | Price per unit (e.g., 0.01 = $0.01) |
| `includedUnits` | integer | Yes | Free tier units included in base plan |
| `overage` | string | No | Overage behavior (charge, block). Default: charge |

### Response

```json
{
  "success": true,
  "data": {
    "id": "plan_1234567890",
    "merchantId": "merchant_abc123",
    "name": "Pro Plan - Monthly",
    "description": "Professional subscription with metered usage",
    "amount": 5000,
    "currency": "USD",
    "interval": "month",
    "intervalCount": 1,
    "trialDays": 14,
    "setupFee": 1000,
    "usageType": "metered",
    "meteredComponents": [...],
    "active": true,
    "createdAt": "2025-08-14T12:00:00Z",
    "updatedAt": "2025-08-14T12:00:00Z",
    "urls": {
      "self": "https://api.sbtc-gateway.com/v1/subscription-plans/plan_1234567890",
      "subscriptions": "https://api.sbtc-gateway.com/v1/subscriptions?plan_id=plan_1234567890"
    }
  },
  "meta": {
    "timestamp": "2025-08-14T12:00:00Z",
    "version": "v1"
  }
}
```

## List Subscription Plans

Retrieve all subscription plans for your merchant account.

**Endpoint**: `GET /api/v1/subscription-plans`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (1-100, default: 50) |
| `active` | boolean | Filter by plan status |
| `usage_type` | string | Filter by usage type (licensed, metered) |
| `currency` | string | Filter by currency |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "plan_basic_monthly",
      "name": "Basic Plan - Monthly",
      "amount": 2000,
      "currency": "USD",
      "interval": "month",
      "usageType": "licensed",
      "active": true,
      "createdAt": "2025-08-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Get Subscription Plan

Retrieve details for a specific subscription plan.

**Endpoint**: `GET /api/v1/subscription-plans/{planId}`

### Response

```json
{
  "success": true,
  "data": {
    "id": "plan_1234567890",
    "merchantId": "merchant_abc123",
    "name": "Pro Plan - Monthly",
    "description": "Professional subscription with metered usage",
    "amount": 5000,
    "currency": "USD",
    "interval": "month",
    "intervalCount": 1,
    "trialDays": 14,
    "setupFee": 1000,
    "usageType": "metered",
    "meteredComponents": [
      {
        "id": "api_calls",
        "name": "API Calls",
        "unitName": "calls",
        "pricePerUnit": 0.01,
        "includedUnits": 10000,
        "overage": "charge"
      }
    ],
    "active": true,
    "createdAt": "2025-08-14T12:00:00Z",
    "updatedAt": "2025-08-14T12:00:00Z",
    "urls": {
      "self": "https://api.sbtc-gateway.com/v1/subscription-plans/plan_1234567890",
      "subscriptions": "https://api.sbtc-gateway.com/v1/subscriptions?plan_id=plan_1234567890"
    },
    "stats": {
      "activeSubscriptions": 25,
      "totalSubscriptions": 47,
      "monthlyRevenue": 50000
    }
  },
  "meta": {
    "timestamp": "2025-08-14T12:00:00Z",
    "version": "v1"
  }
}
```

## Update Subscription Plan

Update an existing subscription plan. Note that changes only affect new subscriptions.

**Endpoint**: `PATCH /api/v1/subscription-plans/{planId}`

### Request Body

```json
{
  "name": "Updated Pro Plan",
  "description": "Updated description",
  "trialDays": 30,
  "setupFee": 1500,
  "active": true
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "plan_1234567890",
    "name": "Updated Pro Plan",
    "description": "Updated description",
    "trialDays": 30,
    "setupFee": 1500,
    "updatedAt": "2025-08-14T12:30:00Z"
  },
  "meta": {
    "timestamp": "2025-08-14T12:30:00Z",
    "version": "v1",
    "changes": ["name", "description", "trialDays", "setupFee"]
  }
}
```

## Deactivate Subscription Plan

Deactivate a subscription plan. Existing subscriptions continue, but new subscriptions cannot be created.

**Endpoint**: `DELETE /api/v1/subscription-plans/{planId}`

### Response

```json
{
  "success": true,
  "data": {
    "id": "plan_1234567890",
    "active": false,
    "updatedAt": "2025-08-14T12:45:00Z"
  },
  "meta": {
    "timestamp": "2025-08-14T12:45:00Z",
    "version": "v1",
    "action": "deactivated",
    "note": "Plan has been deactivated. Existing subscriptions will continue until canceled."
  }
}
```

---

# Subscriptions

## Create Subscription

Create a new subscription for a customer.

**Endpoint**: `POST /api/v1/subscriptions`

### Request Body

```json
{
  "customerId": "cus_1234567890",
  "planId": "plan_pro_monthly",
  "paymentMethod": "sbtc",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "trialDays": 14,
  "metadata": {
    "orderId": "order_xyz789",
    "source": "website"
  },
  "webhookUrl": "https://merchant.example.com/webhooks/subscription",
  "startDate": "2025-08-15T00:00:00Z"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customerId` | string | Yes | Unique customer identifier |
| `planId` | string | Yes | Subscription plan ID |
| `paymentMethod` | string | Yes | Payment method (bitcoin, stx, sbtc) |
| `customerEmail` | string | Yes | Customer email address |
| `customerName` | string | No | Customer name |
| `trialDays` | integer | No | Override plan trial period |
| `metadata` | object | No | Custom key-value data |
| `webhookUrl` | string | No | Subscription-specific webhook URL |
| `startDate` | string | No | Subscription start date (ISO 8601) |
| `endDate` | string | No | Subscription end date (for fixed-term) |
| `couponCode` | string | No | Discount coupon code |

### Response

```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "customerId": "cus_1234567890",
    "planId": "plan_pro_monthly",
    "status": "trialing",
    "paymentMethod": "sbtc",
    "currentPeriodStart": "2025-08-15T00:00:00Z",
    "currentPeriodEnd": "2025-09-15T00:00:00Z",
    "trialStart": "2025-08-15T00:00:00Z",
    "trialEnd": "2025-08-29T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "nextPaymentDate": "2025-08-29T00:00:00Z",
    "totalAmount": 0,
    "metadata": {
      "orderId": "order_xyz789",
      "source": "website"
    },
    "webhookUrl": "https://merchant.example.com/webhooks/subscription",
    "createdAt": "2025-08-14T12:00:00Z",
    "urls": {
      "self": "https://api.sbtc-gateway.com/v1/subscriptions/sub_1234567890",
      "customer": "https://api.sbtc-gateway.com/v1/customers/cus_1234567890",
      "plan": "https://api.sbtc-gateway.com/v1/subscription-plans/plan_pro_monthly"
    }
  },
  "meta": {
    "timestamp": "2025-08-14T12:00:00Z",
    "version": "v1"
  }
}
```

## List Subscriptions

Retrieve subscriptions for your merchant account.

**Endpoint**: `GET /api/v1/subscriptions`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (1-100, default: 50) |
| `status` | string | Filter by status (trialing, active, past_due, canceled, unpaid, paused) |
| `customer_id` | string | Filter by customer ID |
| `plan_id` | string | Filter by plan ID |

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "sub_1234567890",
      "customerId": "cus_1234567890",
      "planId": "plan_pro_monthly",
      "status": "active",
      "paymentMethod": "sbtc",
      "currentPeriodStart": "2025-08-01T00:00:00Z",
      "currentPeriodEnd": "2025-09-01T00:00:00Z",
      "nextPaymentDate": "2025-09-01T00:00:00Z",
      "totalAmount": 5000,
      "createdAt": "2025-08-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Get Subscription

Retrieve details for a specific subscription.

**Endpoint**: `GET /api/v1/subscriptions/{subscriptionId}`

### Response

```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "merchantId": "merchant_abc123",
    "customerId": "cus_1234567890",
    "planId": "plan_pro_monthly",
    "status": "active",
    "paymentMethod": "sbtc",
    "currentPeriodStart": "2025-08-01T00:00:00Z",
    "currentPeriodEnd": "2025-09-01T00:00:00Z",
    "nextPaymentDate": "2025-09-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "failedPaymentCount": 0,
    "totalAmount": 5000,
    "metadata": {},
    "webhookUrl": "https://merchant.example.com/webhooks/subscription",
    "createdAt": "2025-08-01T00:00:00Z",
    "updatedAt": "2025-08-01T00:00:00Z",
    "urls": {
      "self": "https://api.sbtc-gateway.com/v1/subscriptions/sub_1234567890",
      "customer": "https://api.sbtc-gateway.com/v1/customers/cus_1234567890",
      "plan": "https://api.sbtc-gateway.com/v1/subscription-plans/plan_pro_monthly",
      "cancel": "https://api.sbtc-gateway.com/v1/subscriptions/sub_1234567890/cancel",
      "usage": "https://api.sbtc-gateway.com/v1/subscriptions/sub_1234567890/usage",
      "invoices": "https://api.sbtc-gateway.com/v1/subscriptions/sub_1234567890/invoices"
    }
  },
  "meta": {
    "timestamp": "2025-08-14T12:00:00Z",
    "version": "v1"
  }
}
```

## Update Subscription

Update subscription settings or change plans.

**Endpoint**: `PATCH /api/v1/subscriptions/{subscriptionId}`

### Request Body

```json
{
  "planId": "plan_enterprise_monthly",
  "cancelAtPeriodEnd": false,
  "metadata": {
    "upgradeReason": "increased_usage"
  },
  "webhookUrl": "https://merchant.example.com/webhooks/subscription-v2"
}
```

### Plan Change Response (with Proration)

```json
{
  "success": true,
  "data": {
    "subscription": {
      "id": "sub_1234567890",
      "planId": "plan_enterprise_monthly",
      "updatedAt": "2025-08-14T12:30:00Z"
    },
    "prorationInvoice": {
      "id": "in_proration_1234567890",
      "amount": 2500,
      "description": "Proration for plan change",
      "dueDate": "2025-08-14T12:30:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-08-14T12:30:00Z",
    "version": "v1"
  }
}
```

## Cancel Subscription

Cancel a subscription immediately or at the end of the current period.

**Endpoint**: `DELETE /api/v1/subscriptions/{subscriptionId}`

### Request Body (Optional)

```json
{
  "cancelAtPeriodEnd": true,
  "reason": "Customer requested cancellation"
}
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "sub_1234567890",
    "status": "canceled",
    "cancelAtPeriodEnd": true,
    "canceledAt": "2025-08-14T12:45:00Z",
    "currentPeriodEnd": "2025-09-01T00:00:00Z",
    "metadata": {
      "cancelReason": "Customer requested cancellation"
    }
  },
  "meta": {
    "timestamp": "2025-08-14T12:45:00Z",
    "version": "v1",
    "action": "cancel_at_period_end"
  }
}
```

---

# Usage Tracking

## Record Usage

Record usage for a metered subscription component.

**Endpoint**: `POST /api/v1/usage`

### Request Body

```json
{
  "subscriptionId": "sub_1234567890",
  "componentId": "api_calls",
  "quantity": 1500,
  "timestamp": "2025-08-14T10:30:00Z",
  "idempotencyKey": "idem_api_calls_20250814_103000",
  "metadata": {
    "endpoint": "/api/v1/payments",
    "userAgent": "MyApp/1.0",
    "ip": "192.168.1.1"
  }
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `subscriptionId` | string | Yes | Subscription ID |
| `componentId` | string | Yes | Metered component ID |
| `quantity` | number | Yes | Usage quantity (positive number) |
| `timestamp` | string | No | Usage timestamp (ISO 8601, defaults to now) |
| `idempotencyKey` | string | No | Unique key to prevent duplicate records |
| `metadata` | object | No | Additional usage context |

### Response

```json
{
  "success": true,
  "data": {
    "id": "usage_1234567890",
    "subscriptionId": "sub_1234567890",
    "componentId": "api_calls",
    "quantity": 1500,
    "timestamp": "2025-08-14T10:30:00Z",
    "idempotencyKey": "idem_api_calls_20250814_103000",
    "metadata": {
      "endpoint": "/api/v1/payments",
      "userAgent": "MyApp/1.0",
      "ip": "192.168.1.1"
    },
    "currentPeriodUsage": {
      "componentId": "api_calls",
      "totalQuantity": 12500,
      "includedUnits": 10000,
      "overageUnits": 2500,
      "overageCharges": 25.00,
      "nextBillingDate": "2025-09-01T00:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2025-08-14T10:30:00Z",
    "version": "v1",
    "warnings": [
      "Usage has exceeded included units. Overage charges will apply on next billing cycle."
    ]
  }
}
```

## Get Usage Records

Retrieve usage records for a subscription.

**Endpoint**: `GET /api/v1/usage`

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `subscription_id` | string | Yes | Subscription ID |
| `component_id` | string | No | Filter by component ID |
| `start_date` | string | No | Start date (ISO 8601) |
| `end_date` | string | No | End date (ISO 8601) |
| `page` | integer | No | Page number (default: 1) |
| `limit` | integer | No | Results per page (1-100, default: 50) |

### Response

```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "usage_1234567890",
        "subscriptionId": "sub_1234567890",
        "componentId": "api_calls",
        "quantity": 1500,
        "timestamp": "2025-08-14T10:30:00Z",
        "metadata": {
          "endpoint": "/api/v1/payments"
        }
      }
    ],
    "summary": [
      {
        "componentId": "api_calls",
        "totalQuantity": 12500,
        "recordCount": 8
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 8,
    "pages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "meta": {
    "subscriptionId": "sub_1234567890",
    "dateRange": {
      "start": "2025-08-01T00:00:00Z",
      "end": "2025-09-01T00:00:00Z"
    },
    "timestamp": "2025-08-14T10:30:00Z",
    "version": "v1"
  }
}
```

## Get Subscription Usage Analytics

Retrieve detailed usage analytics for a subscription.

**Endpoint**: `GET /api/v1/subscriptions/{subscriptionId}/usage`

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `component_id` | string | Filter by specific component |
| `start_date` | string | Start date (ISO 8601) |
| `end_date` | string | End date (ISO 8601) |
| `granularity` | string | Data granularity (hour, day, week, month) |
| `page` | integer | Page number |
| `limit` | integer | Results per page |

### Response

```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_1234567890",
    "planId": "plan_pro_monthly",
    "status": "active",
    "currentPeriod": {
      "periodStart": "2025-08-01T00:00:00Z",
      "periodEnd": "2025-09-01T00:00:00Z",
      "daysRemaining": 17,
      "components": [
        {
          "componentId": "api_calls",
          "name": "API Calls",
          "unitName": "calls",
          "includedUnits": 10000,
          "totalUsage": 12500,
          "utilizationPercent": 125,
          "overageUnits": 2500,
          "overageCharges": 25.00,
          "overage": "charge",
          "status": "overage",
          "dailyAverage": 892,
          "projectedMonthlyUsage": 27644
        },
        {
          "componentId": "storage",
          "name": "Storage",
          "unitName": "GB",
          "includedUnits": 100,
          "totalUsage": 85.5,
          "utilizationPercent": 86,
          "overageUnits": 0,
          "overageCharges": 0,
          "overage": "charge",
          "status": "normal",
          "dailyAverage": 6.1,
          "projectedMonthlyUsage": 189.1
        }
      ],
      "totalOverageCharges": 25.00,
      "projectedTotalCharges": 87.25
    },
    "historicalData": [
      {
        "date": "2025-08-14",
        "components": {
          "api_calls": { "usage": 1850, "charges": 18.50 },
          "storage": { "usage": 2.1, "charges": 0 }
        },
        "totalCharges": 18.50
      }
    ],
    "alerts": [
      {
        "type": "warning",
        "componentId": "api_calls",
        "message": "API calls usage has exceeded included units. Overage charges apply.",
        "threshold": 100,
        "currentUsage": 125,
        "triggeredAt": "2025-08-13T15:30:00Z"
      }
    ]
  },
  "meta": {
    "granularity": "day",
    "dateRange": {
      "start": "2025-08-01T00:00:00Z",
      "end": "2025-09-01T00:00:00Z"
    },
    "timestamp": "2025-08-14T10:30:00Z",
    "version": "v1",
    "currency": "USD"
  }
}
```

---

# Subscription Statuses

| Status | Description |
|--------|-------------|
| `trialing` | Customer is in trial period, no charges yet |
| `active` | Subscription is active and being billed |
| `past_due` | Payment failed, but subscription still active |
| `canceled` | Subscription has been canceled |
| `unpaid` | Multiple payment failures, subscription inactive |
| `paused` | Temporarily paused by merchant or customer |

---

# Webhook Events

The subscription system sends webhooks for key events:

| Event | Description |
|-------|-------------|
| `subscription.created` | New subscription created |
| `subscription.updated` | Subscription modified |
| `subscription.canceled` | Subscription canceled |
| `subscription.payment_succeeded` | Recurring payment successful |
| `subscription.payment_failed` | Recurring payment failed |
| `subscription.trial_ending` | Trial period ending soon (7 days) |
| `usage.threshold_reached` | Usage component threshold reached |
| `plan.created` | New subscription plan created |
| `plan.updated` | Subscription plan modified |
| `plan.deactivated` | Subscription plan deactivated |

### Webhook Payload Example

```json
{
  "id": "evt_1234567890",
  "type": "subscription.payment_succeeded",
  "created": "2025-08-14T10:30:00Z",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "status": "active",
      "customerId": "cus_1234567890",
      "planId": "plan_pro_monthly",
      "currentPeriodStart": "2025-08-01T00:00:00Z",
      "currentPeriodEnd": "2025-09-01T00:00:00Z",
      "lastPaymentDate": "2025-08-14T10:30:00Z",
      "nextPaymentDate": "2025-09-01T00:00:00Z"
    }
  }
}
```

---

# Error Handling

## Error Response Format

```json
{
  "success": false,
  "error": "Invalid request data",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be non-negative",
      "code": "invalid_value"
    }
  ],
  "meta": {
    "timestamp": "2025-08-14T10:30:00Z",
    "version": "v1"
  }
}
```

## Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `invalid_request` | Malformed request or missing required fields |
| 401 | `unauthorized` | Invalid or missing API key |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Duplicate idempotency key or resource conflict |
| 422 | `unprocessable_entity` | Valid request but business logic error |
| 429 | `rate_limit_exceeded` | Too many requests |
| 500 | `internal_error` | Server error |

---

# SDKs and Examples

## Node.js SDK Example

```javascript
const SbtcGateway = require('@sbtc-gateway/node');
const gateway = new SbtcGateway('pk_test_your_api_key');

// Create subscription plan
const plan = await gateway.subscriptionPlans.create({
  name: 'Pro Plan',
  amount: 5000,
  interval: 'month',
  usageType: 'metered',
  meteredComponents: [{
    id: 'api_calls',
    name: 'API Calls',
    unitName: 'calls',
    pricePerUnit: 0.01,
    includedUnits: 10000
  }]
});

// Create subscription
const subscription = await gateway.subscriptions.create({
  customerId: 'cus_1234567890',
  planId: plan.id,
  paymentMethod: 'sbtc',
  customerEmail: 'customer@example.com'
});

// Record usage
const usage = await gateway.usage.record({
  subscriptionId: subscription.id,
  componentId: 'api_calls',
  quantity: 100,
  idempotencyKey: 'unique_key_' + Date.now()
});
```

## cURL Examples

### Create Subscription Plan

```bash
curl -X POST https://api.sbtc-gateway.com/v1/subscription-plans \
  -H "Authorization: Bearer pk_test_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pro Plan - Monthly",
    "description": "Professional plan with metered billing",
    "amount": 5000,
    "interval": "month",
    "usageType": "metered",
    "meteredComponents": [{
      "id": "api_calls",
      "name": "API Calls", 
      "unitName": "calls",
      "pricePerUnit": 0.01,
      "includedUnits": 10000,
      "overage": "charge"
    }]
  }'
```

### Create Subscription

```bash
curl -X POST https://api.sbtc-gateway.com/v1/subscriptions \
  -H "Authorization: Bearer pk_test_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cus_1234567890",
    "planId": "plan_pro_monthly",
    "paymentMethod": "sbtc",
    "customerEmail": "customer@example.com",
    "trialDays": 14
  }'
```

### Record Usage

```bash
curl -X POST https://api.sbtc-gateway.com/v1/usage \
  -H "Authorization: Bearer pk_test_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "sub_1234567890",
    "componentId": "api_calls", 
    "quantity": 1500,
    "idempotencyKey": "idem_' + $(date +%s) + '"
  }'
```

---

# Testing

## Test Data

Use test API keys (`pk_test_...`) to create subscriptions without actual billing:

- All webhooks are sent to your configured URLs
- Usage tracking works identically to production
- No actual sBTC/Bitcoin transactions are processed
- Trial periods are shortened (1 day = 1 minute in test mode)

## Test Cards and Scenarios

| Test Customer ID | Scenario |
|------------------|----------|
| `cus_test_success` | Always successful payments |
| `cus_test_decline` | First payment fails, subsequent succeed |
| `cus_test_insufficient_funds` | Intermittent payment failures |

---

*For more information, visit our [Developer Portal](https://docs.sbtc-gateway.com) or contact [support@sbtc-gateway.com](mailto:support@sbtc-gateway.com).*