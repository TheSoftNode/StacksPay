import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessType: z.string().min(1, 'Business type is required'),
  stacksAddress: z.string().regex(
    /^S[TM][0-9A-Z]{39}$|^SP[0-9A-Z]{39}$/,
    'Invalid Stacks address format'
  ).optional(), // Optional for newcomers
  website: z.string().url('Invalid website URL').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    const result = await authService.register(validatedData, ipAddress);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Registration Failed',
          message: result.error,
          code: 'REGISTRATION_ERROR'
        }, 
        { status: 400 }
      );
    }

    // Set HTTP-only cookie for session
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful',
      merchant: result.merchant,
      apiKey: {
        keyId: result.apiKey!.keyId,
        keyPreview: result.apiKey!.keyPreview,
        permissions: result.apiKey!.permissions,
        note: 'Store this API key securely. You will not be able to see it again.',
      },
      nextSteps: [
        'Verify your email address',
        'Complete your merchant profile',
        'Start integrating payments with your API key',
        'Test payments in sandbox mode',
      ],
    });

    // Set secure HTTP-only cookie
    response.cookies.set('auth-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register endpoint error:', error);

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
        message: 'Registration service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}
