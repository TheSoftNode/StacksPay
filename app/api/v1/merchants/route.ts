import { NextRequest, NextResponse } from 'next/server';
import { merchantService } from '@/lib/services/merchant-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

export async function GET(request: NextRequest) {
  try {
    // This is admin-only endpoint for listing all merchants
    // In production, add admin authentication
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const verified = searchParams.get('verified') === 'true' ? true : 
                    searchParams.get('verified') === 'false' ? false : undefined;
    const status = searchParams.get('status') || undefined;

    const result = await merchantService.listMerchants({
      page,
      limit,
      verified,
      status,
    });
    
    return NextResponse.json({ 
      success: true,
      merchants: result.merchants,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching merchants:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to fetch merchants',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate with API key (admin level)
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

    const body = await request.json();
    const {
      name,
      email,
      businessName,
      businessType,
      website,
      phone,
      address,
      stacksAddress,
      bitcoinAddress,
    } = body;

    // Validate required fields
    if (!name || !email || !businessType) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          message: 'Name, email, and business type are required',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // Use merchant service to create merchant
    const result = await merchantService.updateMerchant('new', {
      name,
      email,
      businessName: businessName || name,
      businessType,
      website,
      phone,
      address,
      stacksAddress,
      bitcoinAddress,
    } as any);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Merchant Creation Failed',
          message: result.error,
          code: 'CREATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Merchant created successfully',
      merchant: result.merchant,
    });
  } catch (error) {
    console.error('Error creating merchant:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to create merchant',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}
