import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import { sessionMiddleware, getSessionFromRequest } from '@/lib/middleware/auth-middleware';

export async function POST(request: NextRequest) {
  try {
    // First verify the session
    const sessionCheck = await sessionMiddleware(request);
    if (sessionCheck.status !== 200) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'No valid session found',
          code: 'NO_SESSION'
        }, 
        { status: 401 }
      );
    }

    // Extract session info
    const session = getSessionFromRequest(request);
    
    if (session.merchantId && session.sessionId) {
      // Invalidate the session in the database
      await authService.logout(session.merchantId, session.sessionId);
    }

    // Clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      redirectUrl: '/login',
    });

    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Logout endpoint error:', error);
    
    // Even if there's an error, clear the cookie and return success
    const response = NextResponse.json({
      success: true,
      message: 'Logged out',
      redirectUrl: '/login',
    });

    response.cookies.delete('auth-token');
    return response;
  }
}
