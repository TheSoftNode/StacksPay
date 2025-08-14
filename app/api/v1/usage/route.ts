import { NextRequest, NextResponse } from 'next/server';
import { subscriptionService } from '@/lib/services/subscription-service';
import { z } from 'zod';

// Validation schemas
const recordUsageSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  componentId: z.string().min(1, 'Component ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
  timestamp: z.string().datetime().optional(),
  idempotencyKey: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

const querySchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  componentId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().positive().max(100).default(50),
});

/**
 * GET /api/v1/usage
 * Get usage records for a subscription
 */
export async function GET(request: NextRequest) {
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
      subscriptionId: url.searchParams.get('subscription_id') || '',
      componentId: url.searchParams.get('component_id') || undefined,
      startDate: url.searchParams.get('start_date') || undefined,
      endDate: url.searchParams.get('end_date') || undefined,
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '50',
    };

    const validatedQuery = querySchema.parse(queryParams);

    // Get usage records (placeholder data)
    const usageRecords = [
      {
        id: 'usage_1234567890',
        subscriptionId: validatedQuery.subscriptionId,
        componentId: 'api_calls',
        quantity: 1500,
        timestamp: '2025-08-14T10:30:00Z',
        idempotencyKey: 'idem_api_calls_20250814_103000',
        metadata: {
          endpoint: '/api/v1/payments',
          userAgent: 'MyApp/1.0',
          ip: '192.168.1.1',
        },
      },
      {
        id: 'usage_1234567891',
        subscriptionId: validatedQuery.subscriptionId,
        componentId: 'storage',
        quantity: 2.5,
        timestamp: '2025-08-14T11:15:00Z',
        idempotencyKey: 'idem_storage_20250814_111500',
        metadata: {
          fileType: 'document',
          size: 2621440, // bytes
          operation: 'upload',
        },
      },
      {
        id: 'usage_1234567892',
        subscriptionId: validatedQuery.subscriptionId,
        componentId: 'api_calls',
        quantity: 750,
        timestamp: '2025-08-14T14:22:00Z',
        metadata: {
          endpoint: '/api/v1/subscriptions',
          userAgent: 'MyApp/1.0',
        },
      },
    ];

    // Filter by component if specified
    const filteredRecords = validatedQuery.componentId
      ? usageRecords.filter(record => record.componentId === validatedQuery.componentId)
      : usageRecords;

    // Calculate usage summary
    const usageSummary = filteredRecords.reduce((acc, record) => {
      const existing = acc.find(item => item.componentId === record.componentId);
      if (existing) {
        existing.totalQuantity += record.quantity;
        existing.recordCount += 1;
      } else {
        acc.push({
          componentId: record.componentId,
          totalQuantity: record.quantity,
          recordCount: 1,
        });
      }
      return acc;
    }, [] as Array<{ componentId: string; totalQuantity: number; recordCount: number }>);

    const response = {
      success: true,
      data: {
        records: filteredRecords,
        summary: usageSummary,
      },
      pagination: {
        page: validatedQuery.page,
        limit: validatedQuery.limit,
        total: filteredRecords.length,
        pages: Math.ceil(filteredRecords.length / validatedQuery.limit),
        hasNext: false,
        hasPrev: false,
      },
      meta: {
        subscriptionId: validatedQuery.subscriptionId,
        componentId: validatedQuery.componentId,
        dateRange: {
          start: validatedQuery.startDate,
          end: validatedQuery.endDate,
        },
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error fetching usage records:', error);
    
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
 * POST /api/v1/usage
 * Record usage for a subscription component
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
    const validatedData = recordUsageSchema.parse(body);

    // Record usage
    const usageRecord = await subscriptionService.recordUsage(
      validatedData.subscriptionId,
      validatedData.componentId,
      validatedData.quantity,
      validatedData.timestamp ? new Date(validatedData.timestamp) : undefined,
      validatedData.idempotencyKey,
      validatedData.metadata
    );

    // Get current billing period usage for this component
    const currentPeriodUsage = {
      componentId: validatedData.componentId,
      totalQuantity: 5250, // Example: total usage this billing period
      includedUnits: 10000, // From the subscription plan
      overageUnits: 0, // 5250 - 10000 = -4750 (still within included)
      overageCharges: 0,
      nextBillingDate: '2025-09-01T00:00:00Z',
    };

    if (currentPeriodUsage.totalQuantity > currentPeriodUsage.includedUnits) {
      currentPeriodUsage.overageUnits = currentPeriodUsage.totalQuantity - currentPeriodUsage.includedUnits;
      currentPeriodUsage.overageCharges = currentPeriodUsage.overageUnits * 0.01; // $0.01 per unit
    }

    const response = {
      success: true,
      data: {
        id: usageRecord.id,
        subscriptionId: usageRecord.subscriptionId,
        componentId: usageRecord.componentId,
        quantity: usageRecord.quantity,
        timestamp: usageRecord.timestamp.toISOString(),
        idempotencyKey: usageRecord.idempotencyKey,
        metadata: usageRecord.metadata,
        currentPeriodUsage,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        warnings: currentPeriodUsage.overageUnits > 0 ? [
          `Usage has exceeded included units. Overage charges will apply on next billing cycle.`
        ] : undefined,
      },
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error recording usage:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Handle duplicate idempotency key
    if (error instanceof Error && error.message.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Usage record with this idempotency key already exists' },
        { status: 409 }
      );
    }

    // Handle usage limits exceeded
    if (error instanceof Error && error.message.includes('limit exceeded')) {
      return NextResponse.json(
        { 
          error: 'Usage limit exceeded',
          details: error.message,
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