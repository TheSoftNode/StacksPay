import { NextRequest, NextResponse } from 'next/server';
import { merchantService } from '@/lib/services/merchant-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

interface Props {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Props) {
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

    const merchantId = params.id;

    // Check if accessing own merchant metrics or if admin
    if (merchantId !== authResult.merchantId && !authResult.permissions?.includes('admin')) {
      return NextResponse.json(
        { 
          error: 'Access Denied',
          message: 'You can only access your own merchant metrics',
          code: 'ACCESS_DENIED'
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;

    // Get merchant metrics using merchant service
    const metrics = await merchantService.getMerchantMetrics(merchantId, startDate, endDate);
    
    return NextResponse.json({ 
      success: true,
      metrics,
      period: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching merchant metrics:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to fetch merchant metrics',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}