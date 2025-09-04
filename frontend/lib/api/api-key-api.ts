/**
 * API Key Management Client (Backend-Only Operations)
 * Frontend only displays and manages existing keys, creation happens in backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiKeyData {
  id?: string;
  keyId?: string;
  name: string;
  environment: 'test' | 'live';
  permissions: string[];
  keyPrefix?: string; // Only shows prefix, never full key
  ipRestrictions?: string[];
  rateLimit?: number;
  status: 'active' | 'revoked' | 'expired';
  lastUsed?: Date;
  createdAt?: Date;
  expiresAt?: Date;
  requestCount?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Standard API permissions for StacksPay
export const API_PERMISSIONS = {
  PAYMENTS: {
    CREATE: 'payments:create',
    READ: 'payments:read',
    WEBHOOK: 'payments:webhook',
    REFUND: 'payments:refund'
  },
  WALLET: {
    READ: 'wallet:read',
    BALANCE: 'wallet:balance'
  },
  MERCHANT: {
    READ: 'merchant:read',
    UPDATE: 'merchant:update'
  },
  WEBHOOKS: {
    CREATE: 'webhooks:create',
    READ: 'webhooks:read',
    UPDATE: 'webhooks:update',
    DELETE: 'webhooks:delete'
  }
} as const;

export const PERMISSION_GROUPS = {
  BASIC: [
    API_PERMISSIONS.PAYMENTS.CREATE,
    API_PERMISSIONS.PAYMENTS.READ,
    API_PERMISSIONS.WALLET.READ
  ],
  STANDARD: [
    API_PERMISSIONS.PAYMENTS.CREATE,
    API_PERMISSIONS.PAYMENTS.READ,
    API_PERMISSIONS.PAYMENTS.WEBHOOK,
    API_PERMISSIONS.WALLET.READ,
    API_PERMISSIONS.WALLET.BALANCE,
    API_PERMISSIONS.WEBHOOKS.CREATE,
    API_PERMISSIONS.WEBHOOKS.READ
  ],
  ADVANCED: [
    ...Object.values(API_PERMISSIONS.PAYMENTS),
    ...Object.values(API_PERMISSIONS.WALLET),
    ...Object.values(API_PERMISSIONS.MERCHANT),
    ...Object.values(API_PERMISSIONS.WEBHOOKS)
  ]
} as const;

class ApiKeyApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Get all API keys for the current merchant (display only)
   */
  async getApiKeys(): Promise<ApiResponse<ApiKeyData[]>> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/api-keys`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result.data || result.apiKeys || []
      };
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch API keys'
      };
    }
  }

  /**
   * Revoke an API key (backend handles this)
   */
  async revokeApiKey(keyId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        message: 'API key revoked successfully'
      };
    } catch (error) {
      console.error('Error revoking API key:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke API key'
      };
    }
  }

  /**
   * Get API key documentation and examples
   */
  getApiDocumentation(): {
    quickStart: string;
    examples: { [key: string]: string };
    sdks: { language: string; installation: string; example: string }[];
  } {
    return {
      quickStart: `
# Quick Start Guide

## 1. Install SDK (Optional)
npm install @stackspay/sdk

## 2. Initialize Client
const client = new StacksPay({
  apiKey: 'your_api_key_here',
  environment: 'test' // or 'live'
})

## 3. Create Payment
const payment = await client.payments.create({
  amount: 1000000, // 0.01 BTC in satoshis
  currency: 'BTC',
  description: 'Payment for order #123'
})
      `,
      examples: {
        curl: `curl -X POST https://api.stackspay.com/v1/payments \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000000,
    "currency": "BTC",
    "description": "Payment for order #123",
    "successUrl": "https://yoursite.com/success"
  }'`,
        javascript: `const response = await fetch('https://api.stackspay.com/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_test_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1000000,
    currency: 'BTC',
    description: 'Payment for order #123',
    successUrl: 'https://yoursite.com/success'
  })
})`,
        python: `import requests

response = requests.post(
    'https://api.stackspay.com/v1/payments',
    headers={
        'Authorization': 'Bearer sk_test_...',
        'Content-Type': 'application/json'
    },
    json={
        'amount': 1000000,
        'currency': 'BTC',
        'description': 'Payment for order #123',
        'successUrl': 'https://yoursite.com/success'
    }
)`
      },
      sdks: [
        {
          language: 'Node.js',
          installation: 'npm install @stackspay/node',
          example: `const StacksPay = require('@stackspay/node')
const client = new StacksPay('sk_test_...')

const payment = await client.payments.create({
  amount: 1000000,
  currency: 'BTC'
})`
        },
        {
          language: 'Python',
          installation: 'pip install stackspay',
          example: `import stackspay

client = stackspay.Client('sk_test_...')
payment = client.payments.create(
    amount=1000000,
    currency='BTC'
)`
        },
        {
          language: 'PHP',
          installation: 'composer require stackspay/php',
          example: `<?php
require_once 'vendor/autoload.php';

$client = new \\StacksPay\\Client('sk_test_...');
$payment = $client->payments->create([
    'amount' => 1000000,
    'currency' => 'BTC'
]);`
        }
      ]
    };
  }

  /**
   * Validate API key format
   */
  static validateApiKeyFormat(key: string, environment: 'test' | 'live'): boolean {
    const prefix = environment === 'test' ? 'sk_test_' : 'sk_live_';
    return key.startsWith(prefix) && key.length >= 40;
  }
}

// Export singleton instance
export const apiKeyApiClient = new ApiKeyApiClient();