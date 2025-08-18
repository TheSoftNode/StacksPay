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
      walletType,
      address,
      publicKey,
      signature,
      message,
      paymentId,
    } = body;

    // Validate required fields
    if (!walletType || !address || !signature || !message) {
      return NextResponse.json(
        { 
          error: 'Missing Parameters',
          message: 'walletType, address, signature, and message are required',
          code: 'MISSING_PARAMETERS'
        },
        { status: 400 }
      );
    }

    // Authenticate wallet using payment service
    const result = await paymentService.authenticateWallet({
      address,
      signature,
      publicKey,
      walletType,
      message,
      paymentId,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Wallet Authentication Failed',
          message: result.error,
          code: 'WALLET_AUTH_FAILED'
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Wallet authenticated successfully',
      verified: result.verified,
      walletType: result.walletType,
      paymentMethod: result.paymentMethod,
    });
  } catch (error) {
    console.error('Error authenticating wallet:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Wallet authentication service temporarily unavailable',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}