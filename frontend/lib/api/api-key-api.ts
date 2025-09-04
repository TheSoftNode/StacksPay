/**
 * API Key Management Client
 * Handles creation, retrieval, and management of merchant API keys
 */

export interface ApiKeyPermission {
  resource: string
  actions: string[]
}

export interface ApiKeyData {
  id?: string
  keyId?: string
  name: string
  environment: 'test' | 'live'
  permissions: string[]
  key?: string
  keyPrefix?: string
  ipRestrictions?: string[]
  rateLimit?: {
    requests: number
    window: string // e.g., '1h', '1d'
  }
  status: 'active' | 'revoked' | 'expired'
  lastUsed?: Date
  createdAt?: Date
  expiresAt?: Date
}

export interface CreateApiKeyRequest {
  name: string
  environment: 'test' | 'live'
  permissions: string[]
  ipRestrictions?: string[]
  rateLimit?: {
    requests: number
    window: string
  }
  expiresAt?: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Standard API permissions for sBTC payments
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
} as const

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
} as const

class ApiKeyApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  }

  private getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  /**
   * Get all API keys for the current merchant
   */
  async getApiKeys(): Promise<ApiResponse<ApiKeyData[]>> {
    try {
      console.log('🔄 Fetching API keys...')
      
      const response = await fetch(`${this.baseURL}/api/auth/api-keys`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ API keys fetched:', result)
      
      return {
        success: true,
        data: result.data || result.apiKeys || []
      }
    } catch (error) {
      console.error('❌ Error fetching API keys:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch API keys'
      }
    }
  }

  /**
   * Create a new API key
   */
  async createApiKey(keyData: CreateApiKeyRequest): Promise<ApiResponse<ApiKeyData>> {
    try {
      console.log('🔄 Creating API key:', keyData)
      
      const response = await fetch(`${this.baseURL}/api/auth/api-keys`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(keyData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ API key created:', result)
      
      return {
        success: true,
        data: result.data || result,
        message: 'API key created successfully'
      }
    } catch (error) {
      console.error('❌ Error creating API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create API key'
      }
    }
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string): Promise<ApiResponse> {
    try {
      console.log('🔄 Revoking API key:', keyId)
      
      const response = await fetch(`${this.baseURL}/api/auth/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ API key revoked:', result)
      
      return {
        success: true,
        message: 'API key revoked successfully'
      }
    } catch (error) {
      console.error('❌ Error revoking API key:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to revoke API key'
      }
    }
  }

  /**
   * Generate API keys for onboarding (test + live)
   */
  async generateOnboardingKeys(): Promise<ApiResponse<{ testKey: ApiKeyData; liveKey: ApiKeyData; webhookSecret: string }>> {
    try {
      console.log('🔄 Generating onboarding API keys...')
      
      // Create test key
      const testKeyResult = await this.createApiKey({
        name: 'Test API Key',
        environment: 'test',
        permissions: [...PERMISSION_GROUPS.STANDARD]
      })

      if (!testKeyResult.success) {
        throw new Error(testKeyResult.error || 'Failed to create test API key')
      }

      // Create live key
      const liveKeyResult = await this.createApiKey({
        name: 'Live API Key',
        environment: 'live',
        permissions: [...PERMISSION_GROUPS.STANDARD]
      })

      if (!liveKeyResult.success) {
        throw new Error(liveKeyResult.error || 'Failed to create live API key')
      }

      // Generate webhook secret
      const webhookSecret = this.generateWebhookSecret()

      console.log('✅ Onboarding API keys generated successfully')
      
      return {
        success: true,
        data: {
          testKey: testKeyResult.data!,
          liveKey: liveKeyResult.data!,
          webhookSecret
        },
        message: 'API keys generated successfully'
      }
    } catch (error) {
      console.error('❌ Error generating onboarding API keys:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate API keys'
      }
    }
  }

  /**
   * Generate a secure webhook secret
   */
  private generateWebhookSecret(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'whsec_'
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Validate API key format
   */
  static validateApiKeyFormat(key: string, environment: 'test' | 'live'): boolean {
    const prefix = environment === 'test' ? 'sk_test_' : 'sk_live_'
    return key.startsWith(prefix) && key.length >= 40
  }

  /**
   * Get API key documentation and examples
   */
  getApiDocumentation(): {
    quickStart: string
    examples: { [key: string]: string }
    sdks: { language: string; installation: string; example: string }[]
  } {
    return {
      quickStart: `
# Quick Start Guide

## 1. Install SDK (Optional)
npm install @sbtc-gateway/sdk

## 2. Initialize Client
const client = new SBTCGateway({
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
        curl: `curl -X POST https://api.sbtc-gateway.com/v1/payments \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 1000000,
    "currency": "BTC",
    "description": "Payment for order #123",
    "return_url": "https://yoursite.com/success"
  }'`,
        javascript: `const response = await fetch('https://api.sbtc-gateway.com/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_test_...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 1000000,
    currency: 'BTC',
    description: 'Payment for order #123',
    return_url: 'https://yoursite.com/success'
  })
})`,
        python: `import requests

response = requests.post(
    'https://api.sbtc-gateway.com/v1/payments',
    headers={
        'Authorization': 'Bearer sk_test_...',
        'Content-Type': 'application/json'
    },
    json={
        'amount': 1000000,
        'currency': 'BTC',
        'description': 'Payment for order #123',
        'return_url': 'https://yoursite.com/success'
    }
)`
      },
      sdks: [
        {
          language: 'Node.js',
          installation: 'npm install @sbtc-gateway/node',
          example: `const SBTCGateway = require('@sbtc-gateway/node')
const client = new SBTCGateway('sk_test_...')

const payment = await client.payments.create({
  amount: 1000000,
  currency: 'BTC'
})`
        },
        {
          language: 'Python',
          installation: 'pip install sbtc-gateway',
          example: `import sbtc_gateway

client = sbtc_gateway.Client('sk_test_...')
payment = client.payments.create(
    amount=1000000,
    currency='BTC'
)`
        },
        {
          language: 'PHP',
          installation: 'composer require sbtc-gateway/php',
          example: `<?php
require_once 'vendor/autoload.php';

$client = new \\SBTCGateway\\Client('sk_test_...');
$payment = $client->payments->create([
    'amount' => 1000000,
    'currency' => 'BTC'
]);`
        }
      ]
    }
  }
}

// Export singleton instance
export const apiKeyApiClient = new ApiKeyApiClient()
