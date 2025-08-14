import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';
import { verifyApiKey } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rate-limiting';
import { validateSchema } from '@/lib/middleware/validation';
import { z } from 'zod';

// Validation schemas
const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  planId: z.string().min(1, 'Plan ID is required'),
  paymentMethod: z.enum(['bitcoin', 'stx', 'sbtc']),
  customerEmail: z.string().email('Valid email is required'),
  customerName: z.string().optional(),
  trialDays: z.number().min(0).max(365).optional(),
  metadata: z.record(z.any()).optional(),
  webhookUrl: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  couponCode: z.string().optional(),
});

const updateSubscriptionSchema = z.object({
  status: z.enum(['trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused']).optional(),
  planId: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  webhookUrl: z.string().url().optional(),
});

const querySchema = z.object({
  page: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0).default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).refine(val => val > 0 && val <= 100).default('50'),
  status: z.enum(['trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused']).optional(),
  customerId: z.string().optional(),
  planId: z.string().optional(),
});

/**
 * GET /api/v1/subscriptions
 * List subscriptions for a merchant
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Verify API key and get merchant
    const authResult = await verifyApiKey(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '50',
      status: url.searchParams.get('status') || undefined,
      customerId: url.searchParams.get('customer_id') || undefined,
      planId: url.searchParams.get('plan_id') || undefined,
    };

    const validatedQuery = querySchema.parse(queryParams);

    // Get subscriptions (placeholder - would integrate with MongoDB)
    const subscriptions = [
      {
        id: 'sub_1234567890',
        customerId: 'cus_1234567890',
        planId: 'plan_basic_monthly',
        status: 'active',
        paymentMethod: 'sbtc',
        currentPeriodStart: '2025-08-01T00:00:00Z',
        currentPeriodEnd: '2025-09-01T00:00:00Z',
        nextPaymentDate: '2025-09-01T00:00:00Z',
        totalAmount: 2000,
        createdAt: '2025-08-01T00:00:00Z',
      },
    ];

    const response = {
      success: true,
      data: subscriptions,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: subscriptions.length,
        pages: Math.ceil(subscriptions.length / validatedQuery.limit),
        hasNext: false,
        hasPrev: false,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error listing subscriptions:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/subscriptions
 * Create a new subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      max: 20, // 20 subscription creations per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Verify API key and get merchant
    const authResult = await verifyApiKey(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Create subscription
    const subscription = await subscriptionService.createSubscription({
      merchantId: authResult.merchant.id,
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
    });

    const response = {
      success: true,
      data: {
        id: subscription.id,
        customerId: subscription.customerId,
        planId: subscription.planId,
        status: subscription.status,
        paymentMethod: subscription.paymentMethod,
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        trialStart: subscription.trialStart?.toISOString(),
        trialEnd: subscription.trialEnd?.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        nextPaymentDate: subscription.nextPaymentDate.toISOString(),
        totalAmount: subscription.totalAmount,
        metadata: subscription.metadata,
        webhookUrl: subscription.webhookUrl,
        createdAt: subscription.createdAt.toISOString(),
        urls: {
          self: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscriptions/${subscription.id}`,
          customer: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/customers/${subscription.customerId}`,
          plan: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscription-plans/${subscription.planId}`,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating subscription:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}