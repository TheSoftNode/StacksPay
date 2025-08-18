import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    
    const {
      paymentId,
      walletAuth,
      transactionData,
      signedTransaction,
      broadcastTransaction,
    } = body;

    // Validate required fields
    if (!paymentId || !walletAuth) {
      return NextResponse.json(
        { 
          error: 'Missing Parameters',
          message: 'paymentId and walletAuth are required',
          code: 'MISSING_PARAMETERS'
        },
        { status: 400 }
      );
    }

    // Process payment with wallet using payment service
    const result = await paymentService.processPaymentWithWallet({
      paymentId,
      walletAuth,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Payment Processing Failed',
          message: result.error,
          code: 'PAYMENT_PROCESSING_FAILED'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment processed successfully',
      txId: result.txId,
      confirmed: result.confirmed,
    });
  } catch (error) {
    console.error('Error processing payment with wallet:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Payment processing service temporarily unavailable',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}