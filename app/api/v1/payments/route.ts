import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Payment } from '@/models/payment';
import { Merchant } from '@/models/merchant';
import { sbtcService } from '@/lib/services/sbtc-service';
import { walletService } from '@/lib/services/wallet-service';
import { paymentService } from '@/lib/services/payment-service';
import { conversionService } from '@/lib/services/conversion-service';
import { multiWalletAuthService } from '@/lib/services/multi-wallet-auth-service';
import { connectToDatabase } from '@/lib/database/mongodb';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

/**
 * POST - Create a new payment request
 * Supports BTC, STX, and sBTC payments with USD/USDT conversion
 */
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

    const merchantId = authResult.merchantId!; // We know this exists because auth succeeded
    await connectToDatabase();

    const body = await request.json();
    const {
      amount,
      currency = 'USD', // USD, BTC, STX, sBTC
      paymentMethod = 'sbtc', // sbtc, btc, stx
      payoutMethod = 'sbtc', // sbtc, usd, usdt
      description,
      metadata = {},
      customerInfo = {},
      successUrl,
      cancelUrl,
      webhookUrl,
      expiresAt,
    } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid Amount',
          message: 'Amount must be a positive number',
          code: 'INVALID_AMOUNT'
        },
        { status: 400 }
      );
    }

    if (!['USD', 'BTC', 'STX', 'sBTC'].includes(currency)) {
      return NextResponse.json(
        { 
          error: 'Invalid Currency',
          message: 'Currency must be USD, BTC, STX, or sBTC',
          code: 'INVALID_CURRENCY'
        },
        { status: 400 }
      );
    }

    if (!['sbtc', 'btc', 'stx'].includes(paymentMethod)) {
      return NextResponse.json(
        { 
          error: 'Invalid Payment Method',
          message: 'Payment method must be sbtc, btc, or stx',
          code: 'INVALID_PAYMENT_METHOD'
        },
        { status: 400 }
      );
    }

    if (!['sbtc', 'usd', 'usdt'].includes(payoutMethod)) {
      return NextResponse.json(
        { 
          error: 'Invalid Payout Method',
          message: 'Payout method must be sbtc, usd, or usdt',
          code: 'INVALID_PAYOUT_METHOD'
        },
        { status: 400 }
      );
    }

    // Get merchant details
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return NextResponse.json(
        { 
          error: 'Merchant Not Found',
          message: 'Invalid merchant account',
          code: 'MERCHANT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Use the payment service to create the payment
    const paymentResult = await paymentService.createPayment({
      merchantId,
      amount,
      currency,
      paymentMethod,
      payoutMethod,
      description,
      metadata,
      customerInfo,
      successUrl,
      cancelUrl,
      webhookUrl,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { 
          error: 'Payment Creation Failed',
          message: paymentResult.error,
          code: 'PAYMENT_CREATION_FAILED'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: paymentResult.payment,
      qrCode: paymentResult.qrCode,
      instructions: paymentResult.instructions,
      conversion: paymentResult.conversion,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Payment service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET - List payments for authenticated merchant
 */
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

    const merchantId = authResult.merchantId!; // We know this exists because auth succeeded
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || undefined;
    const paymentMethod = searchParams.get('paymentMethod') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Use payment service to list payments
    const result = await paymentService.listPayments(merchantId, {
      page,
      limit,
      status,
      paymentMethod,
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      payments: result.payments,
      pagination: result.pagination,
    });

  } catch (error) {
    console.error('Payment listing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Payment service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}
