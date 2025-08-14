import { NextRequest, NextResponse } from 'next/server';
import { merchantService } from '@/lib/services/merchant-service';
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

    const merchantId = params.id;
    const body = await request.json();

    // Check if verifying own merchant or if admin
    if (merchantId !== authResult.merchantId && !authResult.permissions?.includes('admin')) {
      return NextResponse.json(
        { 
          error: 'Access Denied',
          message: 'You can only verify your own merchant account',
          code: 'ACCESS_DENIED'
        },
        { status: 403 }
      );
    }
    
    const {
      businessDocuments,
      taxId,
      businessAddress,
      ownerInfo,
      bankAccountInfo,
      verificationMethod,
    } = body;

    // Verify business using merchant service
    const result = await merchantService.verifyBusiness(merchantId, {
      businessDocuments,
      taxId,
      businessAddress,
      ownerInfo,
      bankAccountInfo,
      verificationMethod: verificationMethod || 'document_upload',
    });
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Business Verification Failed',
          message: result.error,
          code: 'VERIFICATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Business verification completed successfully',
      status: 'verified',
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error verifying business:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to verify business',
        code: 'SERVICE_ERROR'
      },
      { status: 500 }
    );
  }
}