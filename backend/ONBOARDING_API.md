# Onboarding API Documentation

This document describes the backend API endpoints for the STX payment gateway merchant onboarding process.

## Overview

The onboarding process consists of 8 steps:
1. Welcome
2. Business Info
3. Wallet Setup
4. Payment Preferences
5. API Keys Generation
6. Webhook Configuration
7. Integration & Testing
8. Go Live

All endpoints require session-based authentication (JWT token in Authorization header).

## Authentication

All endpoints use session middleware and require:
```
Authorization: Bearer <jwt_token>
```

The merchant ID is extracted from the authenticated session via `req.merchant.id`.

---

## Endpoints

### 1. Get Onboarding Status

**GET** `/api/onboarding/status`

Retrieves the current onboarding status and progress for the authenticated merchant.

**Response:**
```json
{
  "success": true,
  "data": {
    "isComplete": false,
    "currentStep": 4,
    "completedSteps": ["businessInfo", "walletSetup", "paymentPreferences", "apiKeys"],
    "startedAt": "2025-01-01T00:00:00.000Z",
    "completedAt": null,
    "stepsData": {
      "businessInfo": {
        "completed": true,
        "completedAt": "2025-01-01T00:10:00.000Z"
      },
      "apiKeys": {
        "completed": true,
        "completedAt": "2025-01-01T00:40:00.000Z",
        "testKeyGenerated": true,
        "liveKeyGenerated": true
      }
    }
  }
}
```

---

### 2. Update Onboarding Step

**PUT** `/api/onboarding/step`

Updates the completion status of an onboarding step.

**Request Body:**
```json
{
  "stepName": "businessInfo",
  "stepData": {
    "businessName": "My Company"
  },
  "currentStep": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isComplete": false,
    "currentStep": 2,
    "completedSteps": ["businessInfo"],
    "stepsData": {
      "businessInfo": {
        "completed": true,
        "completedAt": "2025-01-01T00:10:00.000Z",
        "businessName": "My Company"
      }
    }
  },
  "message": "Step 'businessInfo' completed successfully"
}
```

**Step Names:**
- `businessInfo`
- `walletSetup`
- `paymentPreferences`
- `apiKeys`
- `webhookSetup`
- `chainhookSetup`
- `testPayment`
- `goLive`

---

### 3. Generate API Keys (Onboarding)

**POST** `/api/api-keys/onboarding`

Generates test and live API keys during onboarding. This endpoint automatically tracks onboarding progress.

**Response:**
```json
{
  "success": true,
  "keys": {
    "test": {
      "apiKey": "sk_test_abc123...",
      "keyPreview": "sk_test_...abc123",
      "environment": "test",
      "name": "Test Key",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "live": {
      "apiKey": "sk_live_xyz789...",
      "keyPreview": "sk_live_...xyz789",
      "environment": "live",
      "name": "Live Key",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  },
  "webhookSecret": "whsec_abc123...",
  "message": "API keys generated successfully"
}
```

**Automatic Updates:**
- Sets `onboarding.stepsData.apiKeys.completed = true`
- Sets `onboarding.stepsData.apiKeys.testKeyGenerated = true`
- Sets `onboarding.stepsData.apiKeys.liveKeyGenerated = true`
- Advances `onboarding.currentStep` to 5 (webhook setup)
- Initializes `webhooks.secret` with generated webhook secret

**⚠️ Important:** API keys are only shown once. Store them securely.

---

### 4. Configure Webhook

**POST** `/api/onboarding/webhook-config`

Configures the webhook URL and events for payment notifications.

**Request Body:**
```json
{
  "webhookUrl": "https://your-domain.com/webhooks/sbtc",
  "events": [
    "payment.created",
    "payment.completed",
    "payment.failed",
    "payment.expired"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "webhookUrl": "https://your-domain.com/webhooks/sbtc",
    "webhookSecret": "whsec_abc123...",
    "events": [
      "payment.created",
      "payment.completed",
      "payment.failed",
      "payment.expired"
    ],
    "onboarding": {
      "currentStep": 6,
      "completedSteps": [..., "webhookSetup"]
    }
  },
  "message": "Webhook configured successfully"
}
```

**Validation:**
- Webhook URL must be valid HTTP/HTTPS URL
- Events default to all payment events if not specified

**Automatic Updates:**
- Sets `webhooks.url` and `webhooks.events`
- Sets `webhooks.isConfigured = true`
- Sets `onboarding.stepsData.webhookSetup.completed = true`
- Sets `onboarding.stepsData.webhookSetup.webhookUrlConfigured = true`
- Advances `onboarding.currentStep` to 6

---

### 5. Test Webhook

**POST** `/api/onboarding/webhook-test`

Sends a test webhook to the configured URL to verify it's working.

**Request Body:**
```json
{}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "tested": true,
    "webhookUrl": "https://your-domain.com/webhooks/sbtc",
    "responseStatus": 200,
    "responseOk": true,
    "testedAt": "2025-01-01T00:50:00.000Z"
  },
  "message": "Webhook test successful! Your endpoint is responding correctly."
}
```

**Response (Failed):**
```json
{
  "success": false,
  "error": "Webhook test failed",
  "details": "Could not reach webhook endpoint"
}
```

**Test Webhook Payload:**
The test sends a POST request with:
```json
{
  "event": "webhook.test",
  "timestamp": "2025-01-01T00:50:00.000Z",
  "data": {
    "merchantId": "merchant_id_here",
    "message": "This is a test webhook from your sBTC Payment Gateway onboarding"
  }
}
```

**Headers:**
- `Content-Type: application/json`
- `X-Webhook-Signature: <hmac_sha256_signature>`
- `X-Webhook-Event: webhook.test`

**Automatic Updates:**
- Sets `webhooks.lastTested` timestamp
- Sets `onboarding.stepsData.webhookSetup.webhookTested = true` (if successful)

---

### 6. Setup Chainhook Monitoring

**POST** `/api/onboarding/chainhook-setup`

Configures Chainhook predicates for monitoring STX transfers and contract events.

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chainhook": {
      "isConfigured": true,
      "predicateIds": [
        "stx-payment-transfers-testnet",
        "stx-payment-contract-testnet"
      ],
      "configuredAt": "2025-01-01T01:00:00.000Z"
    },
    "predicateConfigs": {
      "transfers": {
        "uuid": "stx-payment-transfers-testnet",
        "name": "STX Payment Gateway - STX Transfers (testnet)",
        "version": 1,
        "networks": {
          "testnet": {
            "if_this": {
              "scope": "stx_events",
              "actions": ["transfer"]
            },
            "then_that": {
              "http_post": {
                "url": "https://api.your-domain.com/api/chainhook/stx/transfers",
                "authorization_header": "Bearer <chainhook_secret>"
              }
            },
            "start_block": 1
          }
        }
      },
      "contract": {
        "uuid": "stx-payment-contract-testnet",
        "name": "STX Payment Gateway - Contract Events (testnet)",
        "version": 1,
        "networks": {
          "testnet": {
            "if_this": {
              "scope": "contract_event",
              "contract_identifier": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.stx-payment-gateway"
            },
            "then_that": {
              "http_post": {
                "url": "https://api.your-domain.com/api/chainhook/stx/contract",
                "authorization_header": "Bearer <chainhook_secret>"
              }
            },
            "start_block": 1
          }
        }
      }
    },
    "onboarding": {
      "currentStep": 6,
      "completedSteps": [..., "chainhookSetup"]
    },
    "instructions": {
      "message": "Chainhook predicates configured successfully",
      "note": "Predicates are ready for registration. In production, these would be automatically registered with Chainhook service.",
      "webhookEndpoints": [
        "https://api.your-domain.com/api/chainhook/stx/transfers",
        "https://api.your-domain.com/api/chainhook/stx/contract"
      ]
    }
  },
  "message": "Chainhook monitoring configured successfully"
}
```

**Automatic Updates:**
- Sets `chainhook.isConfigured = true`
- Sets `chainhook.predicateIds` with generated UUIDs
- Sets `chainhook.configuredAt` timestamp
- Stores `chainhook.predicateConfigs` for reference
- Sets `onboarding.stepsData.chainhookSetup.completed = true`
- Sets `onboarding.stepsData.chainhookSetup.predicatesRegistered = true`

**Note:** In production, this would automatically register predicates with Chainhook service. For now, predicate configurations are stored for manual registration.

---

### 7. Complete Onboarding

**POST** `/api/onboarding/complete`

Marks the entire onboarding process as complete. Validates that all required steps are completed.

**Request Body:**
```json
{}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "isComplete": true,
    "currentStep": 8,
    "completedSteps": [
      "businessInfo",
      "walletSetup",
      "paymentPreferences",
      "apiKeys"
    ],
    "completedAt": "2025-01-01T01:10:00.000Z"
  },
  "message": "Onboarding completed successfully"
}
```

**Response (Missing Steps):**
```json
{
  "success": false,
  "error": "Cannot complete onboarding. Missing required steps",
  "missingSteps": ["webhookSetup"]
}
```

**Required Steps:**
- `businessInfo`
- `walletSetup`
- `paymentPreferences`
- `apiKeys`

**Optional Steps:**
- `webhookSetup`
- `chainhookSetup`
- `testPayment`
- `goLive`

---

### 8. Reset Onboarding Progress

**POST** `/api/onboarding/reset`

Resets all onboarding progress. Useful for testing or allowing merchants to re-onboard.

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isComplete": false,
    "currentStep": 0,
    "completedSteps": [],
    "stepsData": {}
  },
  "message": "Onboarding progress reset successfully"
}
```

**⚠️ Warning:** This does NOT delete API keys or webhook configurations. It only resets the onboarding progress tracking.

---

## Onboarding Flow Example

### Complete onboarding flow:

1. **Start Onboarding** - Frontend wizard begins, calls `GET /api/onboarding/status`
2. **Business Info** - User fills form, frontend calls `PUT /api/onboarding/step` with `businessInfo`
3. **Wallet Setup** - User connects wallet, frontend calls `PUT /api/onboarding/step` with `walletSetup`
4. **Payment Preferences** - User configures preferences, frontend calls `PUT /api/onboarding/step` with `paymentPreferences`
5. **Generate API Keys** - Frontend calls `POST /api/api-keys/onboarding` (auto-tracks progress)
6. **Configure Webhook** - User enters webhook URL, frontend calls `POST /api/onboarding/webhook-config`
7. **Test Webhook** - Frontend calls `POST /api/onboarding/webhook-test`
8. **Setup Chainhook** - Frontend calls `POST /api/onboarding/chainhook-setup` (optional)
9. **Test Payment** - User creates test payment, frontend marks step complete
10. **Go Live** - User activates live mode, frontend calls `POST /api/onboarding/complete`

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request (missing/invalid parameters) |
| 401 | Unauthorized (missing/invalid JWT token) |
| 404 | Merchant not found |
| 500 | Internal server error |

---

## Webhook Signature Validation

When receiving webhooks, validate the signature:

```javascript
const crypto = require('crypto');

function validateWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return signature === expectedSignature;
}
```

Example usage:
```javascript
app.post('/webhooks/sbtc', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!validateWebhookSignature(req.body, signature, webhookSecret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process webhook
  console.log('Webhook event:', req.body.event);
  res.status(200).json({ received: true });
});
```

---

## Environment Variables

Required environment variables:

```env
# Backend URL for Chainhook webhooks
BACKEND_URL=https://api.your-domain.com

# Chainhook secret for validating incoming Chainhook webhooks
CHAINHOOK_SECRET=your_chainhook_secret

# STX contract start block (optional, defaults to 1)
STX_START_BLOCK=1

# Frontend URL for payment links
FRONTEND_URL=https://app.your-domain.com
```

---

## Notes

- All timestamps are in ISO 8601 format
- API keys are shown only once during generation
- Webhook secrets are generated automatically during API key generation
- Chainhook predicates are stored but require manual registration in current implementation
- Onboarding progress persists across sessions
- Frontend should poll `/api/onboarding/status` after page refreshes to restore state
