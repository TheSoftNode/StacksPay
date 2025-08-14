import { NextRequest, NextResponse } from 'next/server';
import { merchantService } from '@/lib/services/merchant-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

interface Props {
  params: {
    id: string;
  };
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

    // Check if updating own merchant settings or if admin
    if (merchantId !== authResult.merchantId && !authResult.permissions?.includes('admin')) {
      return NextResponse.json(
        { 
          error: 'Access Denied',
          message: 'You can only update your own merchant settings',
          code: 'ACCESS_DENIED'
        },
        { status: 403 }
      );
    }
    
    const {
      webhookUrls,
      notifications,
      paymentMethods,
      autoConvert,
      feeTier,
    } = body;

    // Update merchant settings using merchant service
    const result = await merchantService.updateSettings(merchantId, {
      webhookUrls,
      notifications,
      paymentMethods,
      autoConvert,
      feeTier,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Settings Update Failed',
          message: result.error,
          code: 'SETTINGS_UPDATE_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Merchant settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating merchant settings:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to update merchant settings',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}