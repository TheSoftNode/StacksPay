import { NextRequest, NextResponse } from 'next/server';
import { conversionService } from '@/lib/services/conversion-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

/**
 * GET - Get conversion rates and supported pairs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const amount = searchParams.get('amount');

    if (from && to && amount) {
      // Get specific conversion quote
      const conversionResult = await conversionService.convertCurrency(
        parseFloat(amount),
        from.toUpperCase(),
        to.toUpperCase()
      );

      return NextResponse.json({
        success: true,
        conversion: conversionResult,
      });
    } else {
      // Get all rates and supported pairs
      const rates = await conversionService.getConversionRates();
      const supportedPairs = conversionService.getSupportedPairs();

      return NextResponse.json({
        success: true,
        rates,
        supportedPairs,
        timestamp: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Conversion rates error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Conversion service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST - Execute a conversion
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

    const merchantId = authResult.merchantId;
    const body = await request.json();
    const {
      fromAmount,
      fromCurrency,
      toCurrency,
      recipientAddress,
      paymentId,
      slippageTolerance = 0.01, // 1% default
    } = body;

    // Validate required fields
    if (!fromAmount || !fromCurrency || !toCurrency || !recipientAddress) {
      return NextResponse.json(
        { 
          error: 'Missing Parameters',
          message: 'fromAmount, fromCurrency, toCurrency, and recipientAddress are required',
          code: 'MISSING_PARAMETERS'
        },
        { status: 400 }
      );
    }

    if (fromAmount <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid Amount',
          message: 'Amount must be greater than 0',
          code: 'INVALID_AMOUNT'
        },
        { status: 400 }
      );
    }

    // Get conversion quote first
    const quote = await conversionService.convertCurrency(
      fromAmount,
      fromCurrency.toUpperCase(),
      toCurrency.toUpperCase(),
      { slippageTolerance }
    );

    if (!quote.success) {
      return NextResponse.json(
        { 
          error: 'Conversion Error',
          message: 'Unable to calculate conversion',
          code: 'CONVERSION_ERROR'
        },
        { status: 400 }
      );
    }

    // Execute the conversion
    const conversionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const execution = await conversionService.executeConversion(
      conversionId,
      fromAmount,
      fromCurrency.toUpperCase(),
      toCurrency.toUpperCase(),
      recipientAddress,
      {
        merchantId,
        paymentId,
        slippageTolerance,
      }
    );

    if (!execution.success) {
      return NextResponse.json(
        { 
          error: 'Execution Failed',
          message: 'Conversion execution failed',
          code: 'EXECUTION_ERROR'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversion: {
        id: conversionId,
        quote,
        execution,
        merchantId,
        ...(paymentId && { paymentId }),
      },
      tracking: {
        conversionId,
        transactionId: execution.transactionId,
        status: execution.status,
        estimatedCompletion: execution.estimatedCompletion,
        statusUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/conversions/${conversionId}/status`,
      },
    });

  } catch (error) {
    console.error('Conversion execution error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Conversion service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}
