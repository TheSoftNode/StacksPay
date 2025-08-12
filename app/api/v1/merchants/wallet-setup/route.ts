import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { sessionAuth } from '@/lib/middleware/session-auth';

/**
 * GET - Get wallet setup status for onboarding
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate with session
    const authResult = await sessionAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const status = await authService.getWalletSetupStatus(authResult.merchantId!);

    return NextResponse.json({
      success: true,
      status,
    });

  } catch (error) {
    console.error('Wallet setup status error:', error);
    return NextResponse.json(
      { error: 'Failed to get wallet setup status' },
      { status: 500 }
    );
  }
}

/**
 * POST - Update Stacks address for newcomers
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate with session
    const authResult = await sessionAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { stacksAddress } = await request.json();

    if (!stacksAddress) {
      return NextResponse.json(
        { error: 'Stacks address is required' },
        { status: 400 }
      );
    }

    const result = await authService.updateStacksAddress(authResult.merchantId!, stacksAddress);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Stacks address updated successfully',
    });

  } catch (error) {
    console.error('Stacks address update error:', error);
    return NextResponse.json(
      { error: 'Failed to update Stacks address' },
      { status: 500 }
    );
  }
}
