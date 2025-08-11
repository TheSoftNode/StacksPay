import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth-service';

interface AuthResult {
  success: boolean;
  merchantId?: string;
  keyId?: string;
  permissions?: string[];
  environment?: string;
  error?: string;
}

/**
 * Simple API Key authentication for API routes
 * Returns authentication result instead of NextResponse
 */
export async function apiKeyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header. Please include: Authorization: Bearer YOUR_API_KEY'
      };
    }

    const apiKey = authHeader.substring(7);
    
    // Basic API key format validation
    if (!apiKey.startsWith('sk_')) {
      return {
        success: false,
        error: 'Invalid API key format. API keys should start with sk_test_ or sk_live_'
      };
    }

    const auth = await authService.validateApiKey(apiKey);
    
    if (!auth) {
      return {
        success: false,
        error: 'Invalid API key. Please check your API key or generate a new one.'
      };
    }

    return {
      success: true,
      merchantId: auth.merchantId,
      keyId: auth.keyId,
      permissions: auth.permissions,
      environment: auth.environment,
    };

  } catch (error) {
    console.error('API key authentication error:', error);
    return {
      success: false,
      error: 'Authentication service temporarily unavailable'
    };
  }
}
