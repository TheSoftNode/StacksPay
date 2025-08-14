import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

interface Props {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: Props) {
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

    const merchantId = authResult.merchantId!;
    const paymentId = params.id;
    const body = await request.json();
    
    const {
      amount, // Optional: partial refund amount
      reason,
      refundId,
      metadata,
    } = body;

    // Process refund using payment service
    const result = await paymentService.refundPayment(
      paymentId,
      merchantId,
      {
        amount,
        reason,
        refundId,
        metadata,
      }
    );
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Refund Failed',
          message: result.error,
          code: 'REFUND_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Refund initiated successfully',
      refund: result.refund,
    });
  } catch (error) {
    console.error('Error initiating refund:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to initiate refund',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}
