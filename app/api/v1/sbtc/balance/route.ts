import { NextRequest, NextResponse } from 'next/server';
import { sbtcService } from '@/lib/services/sbtc-service';
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
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          message: 'Address parameter is required',
          code: 'MISSING_ADDRESS'
        },
        { status: 400 }
      );
    }

    const result = await sbtcService.getSbtcBalance(address);
    
    return NextResponse.json({ 
      success: true,
      address: result.address,
      balanceMicroSbtc: result.balanceMicroSbtc,
      balanceSbtc: result.balanceSbtc,
      balanceBtc: result.balanceBtc,
      lastUpdated: result.lastUpdated,
    });
  } catch (error) {
    console.error('Error fetching sBTC balance:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to fetch balance',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}
