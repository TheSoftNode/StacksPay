import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';
import { verifyApiKey } from '@/lib/middleware/auth';
import { rateLimit } from '@/lib/middleware/rate-limiting';
import { z } from 'zod';

// Validation schemas
const updateSubscriptionSchema = z.object({
  status: z.enum(['trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused']).optional(),
  planId: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
  webhookUrl: z.string().url().optional(),
});

const cancelSubscriptionSchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true),
  reason: z.string().optional(),
});

/**
 * GET /api/v1/subscriptions/[id]
 * Get a specific subscription
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      max: 200, // 200 requests per minute
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

    const subscriptionId = params.id;

    // Get subscription (placeholder - would use actual service)
    const subscription = {
      id: subscriptionId,
      merchantId: authResult.merchant.id,
      customerId: 'cus_1234567890',
      planId: 'plan_basic_monthly',
      status: 'active' as const,
      paymentMethod: 'sbtc' as const,
      currentPeriodStart: '2025-08-01T00:00:00Z',
      currentPeriodEnd: '2025-09-01T00:00:00Z',
      nextPaymentDate: '2025-09-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      failedPaymentCount: 0,
      totalAmount: 2000,
      metadata: {},
      webhookUrl: 'https://merchant.example.com/webhooks/subscription',
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-01T00:00:00Z',
    };

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Verify subscription belongs to merchant
    if (subscription.merchantId !== authResult.merchant.id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      data: {
        ...subscription,
        urls: {
          self: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscriptions/${subscription.id}`,
          customer: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/customers/${subscription.customerId}`,
          plan: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscription-plans/${subscription.planId}`,
          cancel: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscriptions/${subscription.id}/cancel`,
          usage: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscriptions/${subscription.id}/usage`,
          invoices: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscriptions/${subscription.id}/invoices`,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/subscriptions/[id]
 * Update a subscription
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      max: 50, // 50 updates per minute
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
    const validatedData = updateSubscriptionSchema.parse(body);

    const subscriptionId = params.id;

    // Handle plan updates with proration
    if (validatedData.planId) {
      const result = await subscriptionService.updateSubscriptionPlan(
        subscriptionId,
        validatedData.planId,
        'create_prorations'
      );

      return NextResponse.json({
        success: true,
        data: {
          subscription: result.subscription,
          prorationInvoice: result.prorationInvoice,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      });
    }

    // Regular subscription update (placeholder implementation)
    const updatedSubscription = {
      id: subscriptionId,
      merchantId: authResult.merchant.id,
      customerId: 'cus_1234567890',
      planId: 'plan_basic_monthly',
      status: validatedData.status || 'active',
      paymentMethod: 'sbtc' as const,
      currentPeriodStart: '2025-08-01T00:00:00Z',
      currentPeriodEnd: '2025-09-01T00:00:00Z',
      nextPaymentDate: '2025-09-01T00:00:00Z',
      cancelAtPeriodEnd: validatedData.cancelAtPeriodEnd ?? false,
      failedPaymentCount: 0,
      totalAmount: 2000,
      metadata: validatedData.metadata || {},
      webhookUrl: validatedData.webhookUrl,
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    const response = {
      success: true,
      data: updatedSubscription,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error updating subscription:', error);
    
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

/**
 * DELETE /api/v1/subscriptions/[id]
 * Cancel a subscription
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, {
      windowMs: 60 * 1000, // 1 minute
      max: 20, // 20 cancellations per minute
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

    // Parse optional request body
    let cancelData = { cancelAtPeriodEnd: true, reason: undefined };
    
    try {
      const body = await request.json();
      cancelData = cancelSubscriptionSchema.parse(body);
    } catch {
      // No body or invalid JSON - use defaults
    }

    const subscriptionId = params.id;

    // Cancel subscription
    const canceledSubscription = await subscriptionService.cancelSubscription(
      subscriptionId,
      cancelData.cancelAtPeriodEnd,
      cancelData.reason
    );

    const response = {
      success: true,
      data: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancelAtPeriodEnd: canceledSubscription.cancelAtPeriodEnd,
        canceledAt: canceledSubscription.canceledAt?.toISOString(),
        currentPeriodEnd: canceledSubscription.currentPeriodEnd.toISOString(),
        metadata: {
          ...canceledSubscription.metadata,
          cancelReason: cancelData.reason,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        action: cancelData.cancelAtPeriodEnd ? 'cancel_at_period_end' : 'cancel_immediately',
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error canceling subscription:', error);
    
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