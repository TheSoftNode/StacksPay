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

const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().min(1, 'Plan description is required'),
  amount: z.number().min(0, 'Amount must be non-negative'),
  currency: z.enum(['USD', 'BTC', 'STX', 'sBTC']).default('USD'),
  interval: z.enum(['day', 'week', 'month', 'year']),
  intervalCount: z.number().positive('Interval count must be positive').default(1),
  trialDays: z.number().min(0).max(365).optional(),
  setupFee: z.number().min(0).optional(),
  usageType: z.enum(['licensed', 'metered']).default('licensed'),
  meteredComponents: z.array(meteredComponentSchema).optional(),
  active: z.boolean().default(true),
});

const querySchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(50),
  active: z.coerce.boolean().optional(),
  usageType: z.enum(['licensed', 'metered']).optional(),
  currency: z.enum(['USD', 'BTC', 'STX', 'sBTC']).optional(),
});

/**
 * GET /api/v1/subscription-plans
 * List subscription plans for a merchant
 */
export async function GET(request: NextRequest) {
  try {
    // Simple auth check (placeholder - would use proper middleware)
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!apiKey || !apiKey.startsWith('pk_test_') && !apiKey.startsWith('pk_live_')) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '50',
      active: url.searchParams.get('active'),
      usageType: url.searchParams.get('usage_type'),
      currency: url.searchParams.get('currency'),
    };

    const validatedQuery = querySchema.parse(queryParams);

    // Get subscription plans (placeholder data)
    const plans = [
      {
        id: 'plan_basic_monthly',
        merchantId: 'merchant_123',
        name: 'Basic Plan - Monthly',
        description: 'Basic subscription plan with monthly billing',
        amount: 2000, // $20.00
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        trialDays: 14,
        setupFee: 0,
        usageType: 'licensed',
        meteredComponents: [],
        active: true,
        createdAt: '2025-08-01T00:00:00Z',
        updatedAt: '2025-08-01T00:00:00Z',
      },
      {
        id: 'plan_pro_monthly',
        merchantId: 'merchant_123',
        name: 'Pro Plan - Monthly',
        description: 'Professional subscription plan with metered usage',
        amount: 5000, // $50.00
        currency: 'USD',
        interval: 'month',
        intervalCount: 1,
        trialDays: 7,
        setupFee: 1000, // $10.00
        usageType: 'metered',
        meteredComponents: [
          {
            id: 'api_calls',
            name: 'API Calls',
            unitName: 'calls',
            pricePerUnit: 0.01, // $0.01 per call
            includedUnits: 10000,
            overage: 'charge',
          },
          {
            id: 'storage',
            name: 'Storage',
            unitName: 'GB',
            pricePerUnit: 0.5, // $0.50 per GB
            includedUnits: 100,
            overage: 'charge',
          },
        ],
        active: true,
        createdAt: '2025-08-01T00:00:00Z',
        updatedAt: '2025-08-01T00:00:00Z',
      },
    ];

    const response = {
      success: true,
      data: plans,
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: plans.length,
        pages: Math.ceil(plans.length / validatedQuery.limit),
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
    console.error('Error listing subscription plans:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
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
 * POST /api/v1/subscription-plans
 * Create a new subscription plan
 */
export async function POST(request: NextRequest) {
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
    const validatedData = createPlanSchema.parse(body);

    // Create subscription plan
    const plan = await subscriptionService.createPlan({
      merchantId: 'merchant_123', // Would get from API key
      ...validatedData,
    });

    const response = {
      success: true,
      data: {
        id: plan.id,
        merchantId: plan.merchantId,
        name: plan.name,
        description: plan.description,
        amount: plan.amount,
        currency: plan.currency,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
        trialDays: plan.trialDays,
        setupFee: plan.setupFee,
        usageType: plan.usageType,
        meteredComponents: plan.meteredComponents,
        active: plan.active,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
        urls: {
          self: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscription-plans/${plan.id}`,
          subscriptions: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/subscriptions?plan_id=${plan.id}`,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating subscription plan:', error);
    
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