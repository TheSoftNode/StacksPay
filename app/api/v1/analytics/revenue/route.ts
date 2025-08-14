import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/services/analytics-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate with API key
    const authResult = await apiKeyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { 
          error: 'Authentication Failed',
          message: authResult.error,
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : new Date();
    const granularity = (searchParams.get('granularity') as 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year') || 'day';
    const metrics = searchParams.get('metrics')?.split(',') || ['revenue', 'growth', 'fees'];
    
    const query = {
      merchantId: authResult.merchantId,
      startDate,
      endDate,
      granularity,
      metrics,
    };

    const result = await analyticsService.getRevenueMetrics(query);
    
    return NextResponse.json({ 
      success: true,
      data: result,
      query: {
        startDate,
        endDate,
        granularity,
        metrics,
      },
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to fetch revenue analytics',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}
