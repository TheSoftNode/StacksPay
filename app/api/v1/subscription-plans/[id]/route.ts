import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';
import { z } from 'zod';

// Validation schemas
const meteredComponentSchema = z.object({
  id: z.string().min(1, 'Component ID is required'),
  name: z.string().min(1, 'Component name is required'),
  unitName: z.string().min(1, 'Unit name is required'),
  pricePerUnit: z.number().positive('Price per unit must be positive'),
  includedUnits: z.number().min(0, 'Included units must be non-negative'),
  overage: z.enum(['block', 'charge']).default('charge'),
});

const updatePlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').optional(),
  description: z.string().min(1, 'Plan description is required').optional(),
  amount: z.number().min(0, 'Amount must be non-negative').optional(),
  trialDays: z.number().min(0).max(365).optional(),
  setupFee: z.number().min(0).optional(),
  meteredComponents: z.array(meteredComponentSchema).optional(),
  active: z.boolean().optional(),
});

/**
 * GET /api/v1/subscription-plans/[id]
 * Get a specific subscription plan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple auth check (placeholder)
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey || !apiKey.startsWith('pk_test_') && !apiKey.startsWith('pk_live_')) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const planId = params.id;

    // Get subscription plan (placeholder data)
    const plan = {
      id: planId,
      merchantId: 'merchant_123',
      name: 'Basic Plan - Monthly',
      description: 'Basic subscription plan with monthly billing',
      amount: 2000, // $20.00
      currency: 'USD',
      interval: 'month' as const,
      intervalCount: 1,
      trialDays: 14,
      setupFee: 0,
      usageType: 'licensed' as const,
      meteredComponents: [],
      active: true,
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: '2025-08-01T00:00:00Z',
    };

    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      data: {
        ...plan,
        urls: {
          self: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscription-plans/${plan.id}`,
          subscriptions: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscriptions?plan_id=${plan.id}`,
        },
        stats: {
          activeSubscriptions: 25,
          totalSubscriptions: 47,
          monthlyRevenue: 50000, // $500.00
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/subscription-plans/[id]
 * Update a subscription plan
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple auth check (placeholder)
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey || !apiKey.startsWith('pk_test_') && !apiKey.startsWith('pk_live_')) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePlanSchema.parse(body);

    const planId = params.id;

    // Update subscription plan (placeholder implementation)
    const updatedPlan = {
      id: planId,
      merchantId: 'merchant_123',
      name: validatedData.name || 'Basic Plan - Monthly',
      description: validatedData.description || 'Basic subscription plan with monthly billing',
      amount: validatedData.amount ?? 2000,
      currency: 'USD',
      interval: 'month' as const,
      intervalCount: 1,
      trialDays: validatedData.trialDays ?? 14,
      setupFee: validatedData.setupFee ?? 0,
      usageType: 'licensed' as const,
      meteredComponents: validatedData.meteredComponents || [],
      active: validatedData.active ?? true,
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    const response = {
      success: true,
      data: {
        ...updatedPlan,
        urls: {
          self: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscription-plans/${updatedPlan.id}`,
          subscriptions: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscriptions?plan_id=${updatedPlan.id}`,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        changes: Object.keys(validatedData),
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error updating subscription plan:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues,
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
 * DELETE /api/v1/subscription-plans/[id]
 * Deactivate a subscription plan
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simple auth check (placeholder)
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey || !apiKey.startsWith('pk_test_') && !apiKey.startsWith('pk_live_')) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const planId = params.id;

    // Note: We don't actually delete plans, just deactivate them
    // to preserve historical subscription data
    const deactivatedPlan = {
      id: planId,
      merchantId: 'merchant_123',
      name: 'Basic Plan - Monthly',
      description: 'Basic subscription plan with monthly billing',
      amount: 2000,
      currency: 'USD',
      interval: 'month' as const,
      intervalCount: 1,
      trialDays: 14,
      setupFee: 0,
      usageType: 'licensed' as const,
      meteredComponents: [],
      active: false,
      createdAt: '2025-08-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    const response = {
      success: true,
      data: deactivatedPlan,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        action: 'deactivated',
        note: 'Plan has been deactivated. Existing subscriptions will continue until canceled.',
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error deactivating subscription plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}