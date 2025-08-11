import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await authService.login(validatedData, ipAddress, userAgent);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Login Failed',
          message: result.error,
          code: 'LOGIN_ERROR'
        }, 
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      merchant: result.merchant,
      dashboard: {
        url: '/dashboard',
        features: [
          'View payment analytics',
          'Manage API keys',
          'Configure webhooks',
          'Download reports',
        ],
      },
    });

    // Set secure HTTP-only cookie
    const maxAge = validatedData.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login endpoint error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          message: 'Please check your input and try again',
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
      { 
        error: 'Internal Server Error',
        message: 'Login service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}
