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

    // Check if requesting own merchant data or if admin
    if (merchantId !== authResult.merchantId && !authResult.permissions?.includes('admin')) {
      return NextResponse.json(
        { 
          error: 'Access Denied',
          message: 'You can only access your own merchant data',
          code: 'ACCESS_DENIED'
        },
        { status: 403 }
      );
    }

    // Get merchant using merchant service
    const merchant = await merchantService.getMerchant(merchantId);
    
    if (!merchant) {
      return NextResponse.json(
        { 
          error: 'Merchant Not Found',
          message: 'The requested merchant does not exist',
          code: 'MERCHANT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      merchant,
    });
  } catch (error) {
    console.error('Error fetching merchant:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to fetch merchant',
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

    const merchantId = params.id;
    const body = await request.json();

    // Check if updating own merchant data or if admin
    if (merchantId !== authResult.merchantId && !authResult.permissions?.includes('admin')) {
      return NextResponse.json(
        { 
          error: 'Access Denied',
          message: 'You can only update your own merchant data',
          code: 'ACCESS_DENIED'
        },
        { status: 403 }
      );
    }
    
    const {
      name,
      businessName,
      businessType,
      website,
      phone,
      address,
      stacksAddress,
      bitcoinAddress,
    } = body;

    // Update merchant using merchant service
    const result = await merchantService.updateMerchant(merchantId, {
      name,
      businessName,
      businessType,
      website,
      phone,
      address,
      stacksAddress,
      bitcoinAddress,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Update Failed',
          message: result.error,
          code: 'UPDATE_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Merchant updated successfully',
      merchant: result.merchant,
    });
  } catch (error) {
    console.error('Error updating merchant:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to update merchant',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    // Authenticate with API key (admin only)
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

    // Only admins can delete merchants
    if (!authResult.permissions?.includes('admin')) {
      return NextResponse.json(
        { 
          error: 'Access Denied',
          message: 'Only administrators can delete merchants',
          code: 'ADMIN_REQUIRED'
        },
        { status: 403 }
      );
    }

    const merchantId = params.id;
    const { searchParams } = new URL(request.url);
    const reason = searchParams.get('reason') || 'Deleted by administrator';

    // Suspend merchant (soft delete)
    const result = await merchantService.suspendMerchant(merchantId, reason);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Deletion Failed',
          message: result.error,
          code: 'DELETE_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Merchant suspended successfully',
      merchantId,
      reason,
    });
  } catch (error) {
    console.error('Error deleting merchant:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to delete merchant',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}
