import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { authService } from '@/lib/services/auth-service';

/**
 * API Key authentication middleware for merchant API endpoints
 * Used for: /api/v1/payments, /api/v1/merchants, etc.
 */
export async function apiKeyMiddleware(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header. Please include: Authorization: Bearer YOUR_API_KEY'
        },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    
    // Basic API key format validation
    if (!apiKey.startsWith('sk_')) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid API key format. API keys should start with sk_test_ or sk_live_'
        },
        { status: 401 }
      );
    }

    const auth = await authService.validateApiKey(apiKey);
    
    if (!auth) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid API key. Please check your API key or generate a new one.'
        },
        { status: 401 }
      );
    }

    // Check permissions for specific endpoints
    const url = new URL(request.url);
    const method = request.method;
    
    if (!hasRequiredPermission(auth.permissions, url.pathname, method)) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'API key does not have required permissions for this endpoint'
        },
        { status: 403 }
      );
    }

    // Add auth info to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-merchant-id', auth.merchantId);
    requestHeaders.set('x-key-id', auth.keyId);
    requestHeaders.set('x-permissions', JSON.stringify(auth.permissions));
    requestHeaders.set('x-environment', auth.environment);
    requestHeaders.set('x-merchant-name', auth.merchant.name);
    requestHeaders.set('x-merchant-email', auth.merchant.email);
    requestHeaders.set('x-merchant-stacks-address', auth.merchant.stacksAddress);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('API key middleware error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Authentication service temporarily unavailable'
      },
      { status: 500 }
    );
  }
}

/**
 * JWT session middleware for dashboard pages
 * Used for: /dashboard/*, protected merchant pages
 */
export async function sessionMiddleware(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify JWT token
    const auth = await authService.verifyToken(token);
    
    if (!auth) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    // Add merchant info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-merchant-id', auth.merchantId);
    requestHeaders.set('x-session-id', auth.sessionId);
    requestHeaders.set('x-merchant-name', auth.merchant.name);
    requestHeaders.set('x-merchant-email', auth.merchant.email);
    requestHeaders.set('x-merchant-stacks-address', auth.merchant.stacksAddress);
    requestHeaders.set('x-email-verified', auth.merchant.emailVerified.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Session middleware error:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

/**
 * Rate limiting middleware for API endpoints
 * Implements different rate limits based on API key tier
 */
export async function rateLimitMiddleware(request: NextRequest) {
  try {
    const merchantId = request.headers.get('x-merchant-id');
    const environment = request.headers.get('x-environment');
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!merchantId) {
      // Apply IP-based rate limiting for unauthenticated requests
      return applyIpRateLimit(ipAddress);
    }

    // Apply merchant-specific rate limiting
    return applyMerchantRateLimit(merchantId, environment);
  } catch (error) {
    console.error('Rate limit middleware error:', error);
    // On error, allow request to continue (graceful degradation)
    return NextResponse.next();
  }
}

/**
 * Combined middleware that applies authentication and rate limiting
 */
export async function authAndRateLimitMiddleware(request: NextRequest) {
  // First apply authentication
  const authResult = await apiKeyMiddleware(request);
  
  if (authResult.status !== 200) {
    return authResult;
  }

  // Create a new request with the updated headers for rate limiting
  const updatedRequest = new NextRequest(request.url, {
    method: request.method,
    headers: authResult.headers,
    body: request.body,
  });

  // Then apply rate limiting with auth context
  return rateLimitMiddleware(updatedRequest);
}

/**
 * Check if API key has required permissions for endpoint
 */
function hasRequiredPermission(permissions: string[], pathname: string, method: string): boolean {
  // Define permission requirements for different endpoints
  const permissionMap: Record<string, { methods: string[]; permission: string }> = {
    '/api/v1/payments': { methods: ['POST'], permission: 'write' },
    '/api/v1/payments/': { methods: ['GET'], permission: 'read' },
    '/api/v1/merchants': { methods: ['GET', 'PUT'], permission: 'read' },
    '/api/v1/merchants/settings': { methods: ['PUT'], permission: 'write' },
    '/api/v1/merchants/api-keys': { methods: ['POST', 'DELETE'], permission: 'write' },
    '/api/webhooks': { methods: ['POST'], permission: 'webhooks' },
  };

  // Find matching endpoint
  for (const [path, config] of Object.entries(permissionMap)) {
    if (pathname.startsWith(path) && config.methods.includes(method)) {
      return permissions.includes(config.permission);
    }
  }

  // Default: require 'read' permission for GET requests, 'write' for others
  const requiredPermission = method === 'GET' ? 'read' : 'write';
  return permissions.includes(requiredPermission);
}

/**
 * Apply IP-based rate limiting for unauthenticated requests
 */
function applyIpRateLimit(ipAddress: string): NextResponse {
  // Simple in-memory rate limiting (in production, use Redis)
  // This is a basic implementation for demo purposes
  const limit = 100; // requests per hour
  const window = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // For now, just add headers and continue
  // In production, implement proper rate limiting with Redis/database
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', (limit - 1).toString());
  response.headers.set('X-RateLimit-Reset', (Date.now() + window).toString());
  
  return response;
}

/**
 * Apply merchant-specific rate limiting
 */
function applyMerchantRateLimit(merchantId: string, environment: string | null): NextResponse {
  // Different limits based on environment
  const limits = {
    test: 100,  // requests per hour for test keys
    live: 1000, // requests per hour for live keys
  };
  
  const limit = limits[environment as keyof typeof limits] || limits.test;
  const window = 60 * 60 * 1000; // 1 hour
  
  // For now, just add headers and continue
  // In production, implement proper rate limiting
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', (limit - 1).toString());
  response.headers.set('X-RateLimit-Reset', (Date.now() + window).toString());
  
  return response;
}

/**
 * Helper to extract merchant info from request headers (after middleware)
 */
export function getMerchantFromRequest(request: NextRequest) {
  return {
    id: request.headers.get('x-merchant-id'),
    name: request.headers.get('x-merchant-name'),
    email: request.headers.get('x-merchant-email'),
    stacksAddress: request.headers.get('x-merchant-stacks-address'),
    keyId: request.headers.get('x-key-id'),
    permissions: JSON.parse(request.headers.get('x-permissions') || '[]'),
    environment: request.headers.get('x-environment'),
  };
}

/**
 * Helper to extract session info from request headers (after middleware)
 */
export function getSessionFromRequest(request: NextRequest) {
  return {
    merchantId: request.headers.get('x-merchant-id'),
    sessionId: request.headers.get('x-session-id'),
    merchantName: request.headers.get('x-merchant-name'),
    merchantEmail: request.headers.get('x-merchant-email'),
    stacksAddress: request.headers.get('x-merchant-stacks-address'),
    emailVerified: request.headers.get('x-email-verified') === 'true',
  };
}
