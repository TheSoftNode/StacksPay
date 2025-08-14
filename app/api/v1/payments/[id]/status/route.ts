import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment-service';
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

    const merchantId = authResult.merchantId;
    const paymentId = params.id;

    // Check payment status using payment service
    const result = await paymentService.checkPaymentStatus(paymentId);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Status Check Failed',
          message: result.error,
          code: 'STATUS_CHECK_ERROR'
        },
        { status: result.error === 'Payment not found' ? 404 : 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      payment: result.payment,
      status: result.status,
      blockchain: result.blockchain,
      confirmations: result.confirmations,
      lastChecked: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to fetch payment status',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Props) {
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

    const merchantId = authResult.merchantId;
    const paymentId = params.id;
    const body = await request.json();
    
    const {
      status,
      confirmations,
      transactionHash,
      blockHeight,
      metadata,
    } = body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'failed', 'expired', 'cancelled', 'refunded'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid Status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Update payment status
    const result = await paymentService.updatePaymentStatus(
      paymentId,
      merchantId,
      {
        status,
        confirmations,
        transactionHash,
        blockHeight,
        metadata,
        updatedAt: new Date(),
      }
    );
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Status Update Failed',
          message: result.error,
          code: 'UPDATE_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment status updated successfully',
      payment: result.payment,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to update payment status',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}
