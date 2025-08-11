import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth-service';

interface SessionAuthResult {
  success: boolean;
  merchantId?: string;
  sessionId?: string;
  merchant?: {
    name: string;
    email: string;
    stacksAddress?: string;
    emailVerified: boolean;
  };
  error?: string;
}

/**
 * Simple session authentication for API routes
 * Returns authentication result instead of NextResponse
 */
export async function sessionAuth(request: NextRequest): Promise<SessionAuthResult> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return {
        success: false,
        error: 'Authentication token required'
      };
    }

    // Verify JWT token
    const auth = await authService.verifyToken(token);
    
    if (!auth) {
      return {
        success: false,
        error: 'Invalid or expired authentication token'
      };
    }

    return {
      success: true,
      merchantId: auth.merchantId,
      sessionId: auth.sessionId,
      merchant: {
        name: auth.merchant.name,
        email: auth.merchant.email,
        stacksAddress: auth.merchant.stacksAddress,
        emailVerified: auth.merchant.emailVerified,
      },
    };

  } catch (error) {
    console.error('Session authentication error:', error);
    return {
      success: false,
      error: 'Authentication service temporarily unavailable'
    };
  }
}
