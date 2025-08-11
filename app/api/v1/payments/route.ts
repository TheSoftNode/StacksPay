import { NextRequest, NextResponse } from 'next/server';
import { Payment } from '@/models/payment';
import { Merchant } from '@/models/merchant';
import { sbtcService } from '@/lib/services/sbtc-service';
import { walletService } from '@/lib/services/wallet-service';
import { contractService } from '@/lib/services/contract-service';
import { multiWalletAuthService } from '@/lib/services/multi-wallet-auth-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';
import { connectDatabase } from '@/lib/database/connection';

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

    const merchantId = authResult.merchantId;
    await connectDatabase();

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

    // Calculate conversion rates and amounts
    const conversionRates = await getConversionRates();
    const paymentCalculation = calculatePaymentAmounts(
      amount,
      currency,
      paymentMethod,
      payoutMethod,
      conversionRates
    );

    // Generate payment addresses based on method
    let paymentAddress: string;
    let paymentDetails: any = {};

    switch (paymentMethod) {
      case 'sbtc':
        const sbtcDepositInfo = await sbtcService.createDepositAddress();
        paymentAddress = sbtcDepositInfo.address;
        paymentDetails = {
          depositAddress: sbtcDepositInfo.address,
          scriptPubKey: sbtcDepositInfo.scriptPubKey,
          bitcoinTxId: null, // Will be filled when customer sends BTC
          sbtcTxId: null, // Will be filled when sBTC is minted
        };
        break;

      case 'btc':
        const btcWallet = await sbtcService.generateBitcoinAddress();
        paymentAddress = btcWallet.address;
        paymentDetails = {
          address: btcWallet.address,
          privateKey: btcWallet.privateKey, // Store securely
          publicKey: btcWallet.publicKey,
        };
        break;

      case 'stx':
        // Use merchant's Stacks address or generate temporary one
        paymentAddress = merchant.walletSetup?.stacksAddress || 
                        await walletService.generateStacksAddress();
        paymentDetails = {
          address: paymentAddress,
          contractCall: paymentCalculation.paymentAmountSats > 0 ? {
            contractAddress: process.env.STACKS_CONTRACT_ADDRESS,
            contractName: 'payment-processor',
            functionName: 'process-stx-payment',
            functionArgs: [
              paymentCalculation.paymentAmountSats,
              merchant._id.toString(),
            ],
          } : null,
        };
        break;

      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }

    // Create payment record
    const payment = new Payment({
      merchantId,
      amount: paymentCalculation.originalAmount,
      currency,
      paymentMethod,
      payoutMethod,
      paymentAmount: paymentCalculation.paymentAmount,
      paymentCurrency: paymentCalculation.paymentCurrency,
      payoutAmount: paymentCalculation.payoutAmount,
      payoutCurrency: paymentCalculation.payoutCurrency,
      conversionRate: paymentCalculation.conversionRate,
      payoutConversionRate: paymentCalculation.payoutConversionRate,
      fees: paymentCalculation.fees,
      netAmount: paymentCalculation.netAmount,
      status: 'pending',
      paymentAddress,
      paymentDetails,
      description,
      metadata,
      customerInfo,
      urls: {
        success: successUrl,
        cancel: cancelUrl,
        webhook: webhookUrl,
      },
      expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours default
    });

    await payment.save();

    // Generate QR code for payment
    const qrCode = await generatePaymentQR(paymentMethod, paymentAddress, paymentCalculation.paymentAmount);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        amount: paymentCalculation.originalAmount,
        currency,
        paymentMethod,
        payoutMethod,
        paymentAmount: paymentCalculation.paymentAmount,
        paymentCurrency: paymentCalculation.paymentCurrency,
        paymentAddress,
        qrCode,
        status: 'pending',
        expiresAt: payment.expiresAt,
        checkoutUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/${payment._id}`,
        statusUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/${payment._id}/status`,
      },
      instructions: getPaymentInstructions(paymentMethod, paymentAddress, paymentCalculation.paymentAmount),
      conversion: {
        originalAmount: paymentCalculation.originalAmount,
        originalCurrency: currency,
        paymentAmount: paymentCalculation.paymentAmount,
        paymentCurrency: paymentCalculation.paymentCurrency,
        rate: paymentCalculation.conversionRate,
        payoutAmount: paymentCalculation.payoutAmount,
        payoutCurrency: paymentCalculation.payoutCurrency,
        payoutRate: paymentCalculation.payoutConversionRate,
        fees: paymentCalculation.fees,
        netAmount: paymentCalculation.netAmount,
      },
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

    const merchantId = authResult.merchantId;
    await connectDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;
    const query: any = { merchantId };

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-paymentDetails.privateKey'); // Don't expose private keys

    const total = await Payment.countDocuments(query);

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
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

// Helper functions

async function getConversionRates() {
  try {
    // In production, fetch from multiple price APIs
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,stacks,tether&vs_currencies=usd');
    const data = await response.json();
    
    return {
      'BTC/USD': data.bitcoin?.usd || 45000,
      'STX/USD': data.stacks?.usd || 0.5,
      'sBTC/USD': data.bitcoin?.usd || 45000, // sBTC pegged to BTC
      'USDT/USD': data.tether?.usd || 1,
    };
  } catch (error) {
    console.error('Failed to fetch conversion rates:', error);
    // Fallback rates
    return {
      'BTC/USD': 45000,
      'STX/USD': 0.5,
      'sBTC/USD': 45000,
      'USDT/USD': 1,
    };
  }
}

function calculatePaymentAmounts(
  amount: number,
  currency: string,
  paymentMethod: string,
  payoutMethod: string,
  rates: Record<string, number>
) {
  const fee = 0.029; // 2.9% fee
  
  let paymentAmount = amount;
  let paymentCurrency = currency;
  let conversionRate = 1;

  // Convert to payment method currency
  if (currency !== paymentMethod.toUpperCase()) {
    const fromRate = rates[`${currency}/USD`] || 1;
    const toRate = rates[`${paymentMethod.toUpperCase()}/USD`] || 1;
    conversionRate = fromRate / toRate;
    paymentAmount = amount * conversionRate;
    paymentCurrency = paymentMethod.toUpperCase();
  }

  // Calculate payout amount
  let payoutAmount = amount;
  let payoutCurrency = payoutMethod.toUpperCase();
  let payoutConversionRate = 1;

  if (currency !== payoutMethod.toUpperCase()) {
    const fromRate = rates[`${currency}/USD`] || 1;
    const toRate = rates[`${payoutMethod.toUpperCase()}/USD`] || 1;
    payoutConversionRate = fromRate / toRate;
    payoutAmount = amount * payoutConversionRate;
  }

  // Calculate fees and net amount
  const fees = {
    processing: payoutAmount * fee,
    network: paymentMethod === 'btc' ? 0.0001 : 0.000001, // Estimated network fees
  };
  const totalFees = fees.processing + fees.network;
  const netAmount = payoutAmount - totalFees;

  return {
    originalAmount: amount,
    paymentAmount,
    paymentCurrency,
    paymentAmountSats: Math.round(paymentAmount * (paymentMethod === 'stx' ? 1000000 : 100000000)),
    conversionRate,
    payoutAmount,
    payoutCurrency,
    payoutConversionRate,
    fees,
    netAmount,
  };
}

async function generatePaymentQR(method: string, address: string, amount: number) {
  const QRCode = require('qrcode');
  
  let qrData: string;
  
  switch (method) {
    case 'btc':
    case 'sbtc':
      qrData = `bitcoin:${address}?amount=${amount}`;
      break;
    case 'stx':
      qrData = `stacks:${address}?amount=${amount}`;
      break;
    default:
      qrData = address;
  }
  
  return await QRCode.toDataURL(qrData);
}

function getPaymentInstructions(method: string, address: string, amount: number) {
  const instructions = {
    sbtc: {
      title: 'sBTC Payment Instructions',
      steps: [
        'Send Bitcoin to the deposit address below',
        'The Bitcoin will be automatically converted to sBTC',
        'Payment will be confirmed once sBTC is minted',
        'Network confirmation time: 10-20 minutes',
      ],
      address,
      amount: `${amount} BTC`,
      note: 'Send the exact amount to ensure proper processing',
    },
    btc: {
      title: 'Bitcoin Payment Instructions',
      steps: [
        'Send Bitcoin to the address below',
        'Include appropriate network fees',
        'Payment will be confirmed after 1 block confirmation',
        'Network confirmation time: 10-20 minutes',
      ],
      address,
      amount: `${amount} BTC`,
      note: 'Minimum confirmations required: 1',
    },
    stx: {
      title: 'Stacks (STX) Payment Instructions',
      steps: [
        'Send STX to the address below',
        'Use your Stacks wallet (Hiro, Xverse, etc.)',
        'Payment will be confirmed after block confirmation',
        'Network confirmation time: 10 minutes',
      ],
      address,
      amount: `${amount} STX`,
      note: 'Ensure you have enough STX for network fees',
    },
  };

  return instructions[method as keyof typeof instructions];
}
