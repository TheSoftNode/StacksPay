# API Authentication

## Overview
The sBTC Payment Gateway uses API key authentication for securing API endpoints.

## Getting Started

### 1. Generate API Keys
Navigate to your dashboard to generate API keys.

### 2. Making Requests
Include your API key in the request headers:

```
Authorization: Bearer your_api_key_here
Content-Type: application/json
```

## Rate Limiting
- 1000 requests per hour for standard accounts
- 10000 requests per hour for premium accounts

## Error Codes
- `401` - Unauthorized (invalid API key)
- `429` - Rate limit exceeded
- `500` - Internal server error
