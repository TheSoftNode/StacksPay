import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { sessionMiddleware, getSessionFromRequest } from '@/lib/middleware/auth-middleware';
import { z } from 'zod';

const generateKeySchema = z.object({
  environment: z.enum(['test', 'live']).default('test'),
  permissions: z.array(z.enum(['read', 'write', 'webhooks'])).min(1, 'At least one permission required'),
  name: z.string().optional(),
});

/**
 * GET - List all API keys for the merchant
 */
export async function GET(request: NextRequest) {
  try {
    // Verify session
    const sessionCheck = await sessionMiddleware(request);
    if (sessionCheck.status !== 200) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_SESSION' }, 
        { status: 401 }
      );
    }

    const session = getSessionFromRequest(request);
    if (!session.merchantId) {
      return NextResponse.json(
        { error: 'Invalid session', code: 'INVALID_SESSION' }, 
        { status: 401 }
      );
    }

    // Get merchant's API keys
    const apiKeys = await authService.getMerchantApiKeys(session.merchantId);

    return NextResponse.json({
      success: true,
      apiKeys: apiKeys.map(key => ({
        keyId: key.keyId,
        keyPreview: key.keyPreview,
        permissions: key.permissions,
        environment: key.environment,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        rateLimit: key.rateLimit,
      })),
      total: apiKeys.length,
      environments: {
        test: apiKeys.filter(k => k.environment === 'test').length,
        live: apiKeys.filter(k => k.environment === 'live').length,
      },
    });
  } catch (error) {
    console.error('Get API keys error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch API keys', code: 'FETCH_ERROR' }, 
      { status: 500 }
    );
  }
}

/**
 * POST - Generate a new API key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify session
    const sessionCheck = await sessionMiddleware(request);
    if (sessionCheck.status !== 200) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_SESSION' }, 
        { status: 401 }
      );
    }

    const session = getSessionFromRequest(request);
    if (!session.merchantId) {
      return NextResponse.json(
        { error: 'Invalid session', code: 'INVALID_SESSION' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = generateKeySchema.parse(body);

    // Generate new API key
    const newApiKey = await authService.generateApiKey(
      session.merchantId,
      validatedData.permissions,
      validatedData.environment
    );

    return NextResponse.json({
      success: true,
      message: 'API key generated successfully',
      apiKey: {
        keyId: newApiKey.keyId,
        apiKey: newApiKey.apiKey, // This is the only time the full key is shown
        keyPreview: newApiKey.keyPreview,
        permissions: newApiKey.permissions,
        environment: newApiKey.environment,
        createdAt: newApiKey.createdAt,
      },
      warning: 'Store this API key securely. You will not be able to see the full key again.',
      integration: {
        header: `Authorization: Bearer ${newApiKey.apiKey}`,
        curl: `curl -H "Authorization: Bearer ${newApiKey.apiKey}" https://api.sbtc-gateway.com/v1/payments`,
      },
    });
  } catch (error) {
    console.error('Generate API key error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate API key', code: 'GENERATION_ERROR' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE - Revoke an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify session
    const sessionCheck = await sessionMiddleware(request);
    if (sessionCheck.status !== 200) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'NO_SESSION' }, 
        { status: 401 }
      );
    }

    const session = getSessionFromRequest(request);
    if (!session.merchantId) {
      return NextResponse.json(
        { error: 'Invalid session', code: 'INVALID_SESSION' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required', code: 'MISSING_KEY_ID' }, 
        { status: 400 }
      );
    }

    // Revoke the API key
    const result = await authService.revokeApiKey(session.merchantId, keyId);

    if (!result.success) {
      return NextResponse.json(
        { error: 'API key not found or already revoked', code: 'KEY_NOT_FOUND' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully',
      keyId,
      note: 'This API key can no longer be used for authentication',
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke API key', code: 'REVOKE_ERROR' }, 
      { status: 500 }
    );
  }
}
