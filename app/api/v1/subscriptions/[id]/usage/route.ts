import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';
import { z } from 'zod';

// Validation schema
const querySchema = z.object({
  componentId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(50),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

/**
 * GET /api/v1/subscriptions/[id]/usage
 * Get usage analytics for a specific subscription
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

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      componentId: url.searchParams.get('component_id') || undefined,
      startDate: url.searchParams.get('start_date') || undefined,
      endDate: url.searchParams.get('end_date') || undefined,
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '50',
      granularity: url.searchParams.get('granularity') || 'day',
    };

    const validatedQuery = querySchema.parse(queryParams);
    const subscriptionId = params.id;

    // Get subscription details
    const subscription = {
      id: subscriptionId,
      planId: 'plan_pro_monthly',
      status: 'active',
      currentPeriodStart: '2025-08-01T00:00:00Z',
      currentPeriodEnd: '2025-09-01T00:00:00Z',
    };

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get plan details with metered components
    const plan = {
      id: 'plan_pro_monthly',
      meteredComponents: [
        {
          id: 'api_calls',
          name: 'API Calls',
          unitName: 'calls',
          pricePerUnit: 0.01,
          includedUnits: 10000,
          overage: 'charge',
        },
        {
          id: 'storage',
          name: 'Storage',
          unitName: 'GB',
          pricePerUnit: 0.5,
          includedUnits: 100,
          overage: 'charge',
        },
        {
          id: 'bandwidth',
          name: 'Bandwidth',
          unitName: 'GB',
          pricePerUnit: 0.1,
          includedUnits: 500,
          overage: 'block',
        },
      ],
    };

    // Generate usage analytics (placeholder data)
    const usageAnalytics = {
      currentPeriod: {
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
        daysRemaining: 17,
        components: plan.meteredComponents.map(component => {
          const totalUsage = component.id === 'api_calls' ? 12500 : 
                           component.id === 'storage' ? 85.5 : 
                           475.2;
          
          const isOverage = totalUsage > component.includedUnits;
          const overageAmount = isOverage ? totalUsage - component.includedUnits : 0;
          const overageCharges = component.overage === 'charge' ? overageAmount * component.pricePerUnit : 0;

          return {
            componentId: component.id,
            name: component.name,
            unitName: component.unitName,
            includedUnits: component.includedUnits,
            totalUsage,
            utilizationPercent: Math.round((totalUsage / component.includedUnits) * 100),
            overageUnits: overageAmount,
            overageCharges,
            overage: component.overage,
            status: isOverage ? (component.overage === 'block' ? 'blocked' : 'overage') : 'normal',
            dailyAverage: totalUsage / 14, // 14 days into period
            projectedMonthlyUsage: totalUsage * (31 / 14),
          };
        }),
        totalOverageCharges: 25.50, // Sum of all overage charges
        projectedTotalCharges: 87.25, // Base plan + projected overage
      },
      
      historicalData: [
        {
          date: '2025-08-14',
          components: {
            api_calls: { usage: 1850, charges: 0 },
            storage: { usage: 2.1, charges: 0 },
            bandwidth: { usage: 45.2, charges: 0 },
          },
          totalCharges: 0,
        },
        {
          date: '2025-08-13',
          components: {
            api_calls: { usage: 2150, charges: 0 },
            storage: { usage: 1.8, charges: 0 },
            bandwidth: { usage: 52.1, charges: 0 },
          },
          totalCharges: 0,
        },
        {
          date: '2025-08-12',
          components: {
            api_calls: { usage: 1950, charges: 0 },
            storage: { usage: 3.2, charges: 0 },
            bandwidth: { usage: 48.7, charges: 0 },
          },
          totalCharges: 0,
        },
      ],

      alerts: [
        {
          type: 'warning',
          componentId: 'api_calls',
          message: 'API calls usage has exceeded included units. Overage charges apply.',
          threshold: 100,
          currentUsage: 125,
          triggeredAt: '2025-08-13T15:30:00Z',
        },
        {
          type: 'info',
          componentId: 'bandwidth',
          message: 'Bandwidth usage is approaching the included limit.',
          threshold: 90,
          currentUsage: 95,
          triggeredAt: '2025-08-14T09:15:00Z',
        },
      ],
    };

    const response = {
      success: true,
      data: {
        subscriptionId,
        planId: subscription.planId,
        status: subscription.status,
        ...usageAnalytics,
      },
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: usageAnalytics.historicalData.length,
        pages: Math.ceil(usageAnalytics.historicalData.length / validatedQuery.limit),
        hasNext: false,
        hasPrev: false,
      },
      meta: {
        granularity: validatedQuery.granularity,
        dateRange: {
          start: validatedQuery.startDate || subscription.currentPeriodStart,
          end: validatedQuery.endDate || subscription.currentPeriodEnd,
        },
        timestamp: new Date().toISOString(),
        version: 'v1',
        currency: 'USD',
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching subscription usage analytics:', error);
    
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