import { NextRequest, NextResponse } from 'next/server';
import { multiWalletAuthService } from '@/lib/services/multi-wallet-auth-service';
import { z } from 'zod';

const walletAuthSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  signature: z.string().min(1, 'Signature is required'),
  message: z.string().min(1, 'Message is required'),
  publicKey: z.string().min(1, 'Public key is required'),
  walletType: z.enum(['stacks', 'bitcoin']).refine((val) => ['stacks', 'bitcoin'].includes(val), {
    message: 'Wallet type must be either "stacks" or "bitcoin"'
  }),
  paymentId: z.string().optional(),
  amount: z.number().positive().optional(),
  paymentMethod: z.enum(['bitcoin', 'stx', 'sbtc']).optional(),
  type: z.enum(['payment', 'connection']).default('connection'),
});

/**
 * POST - Verify wallet signature for authentication
 * Supports both Bitcoin and Stacks wallets
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = walletAuthSchema.parse(body);

    // Validate address format based on wallet type
    if (validatedData.walletType === 'stacks') {
      const stacksAddressRegex = /^S[TM][0-9A-Z]{39}$|^SP[0-9A-Z]{39}$/;
      if (!stacksAddressRegex.test(validatedData.address)) {
        return NextResponse.json(
          { 
            error: 'Invalid Address',
            message: 'Invalid Stacks address format',
            code: 'INVALID_STACKS_ADDRESS'
          },
          { status: 400 }
        );
      }
    } else if (validatedData.walletType === 'bitcoin') {
      // Basic Bitcoin address validation (supports various formats)
      const bitcoinAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$|^tb1[a-z0-9]{39,59}$/;
      if (!bitcoinAddressRegex.test(validatedData.address)) {
        return NextResponse.json(
          { 
            error: 'Invalid Address',
            message: 'Invalid Bitcoin address format',
            code: 'INVALID_BITCOIN_ADDRESS'
          },
          { status: 400 }
        );
      }
    }

    if (validatedData.type === 'payment') {
      // Payment authorization requires payment context
      if (!validatedData.paymentId || !validatedData.amount) {
        return NextResponse.json(
          { 
            error: 'Validation Error',
            message: 'Payment ID and amount are required for payment authorization',
            code: 'MISSING_PAYMENT_DATA'
          },
          { status: 400 }
        );
      }
    }

    const result = await multiWalletAuthService.verifyWalletSignature({
      address: validatedData.address,
      signature: validatedData.signature,
      message: validatedData.message,
      publicKey: validatedData.publicKey,
      walletType: validatedData.walletType,
      paymentId: validatedData.paymentId,
      amount: validatedData.amount,
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Authentication Failed',
          message: result.error || 'Wallet authentication failed',
          code: 'AUTH_FAILED'
        },
        { status: 500 }
      );
    }

    if (!result.verified) {
      return NextResponse.json(
        { 
          error: 'Verification Failed',
          message: result.error || 'Wallet signature verification failed',
          code: 'VERIFICATION_FAILED'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: validatedData.type === 'payment' 
        ? `${result.walletType} wallet payment authorization verified` 
        : `${result.walletType} wallet connection verified`,
      wallet: {
        address: result.address,
        type: result.walletType,
        network: process.env.STACKS_NETWORK || 'testnet',
        paymentMethod: result.paymentMethod,
      },
      ...(validatedData.type === 'payment' && {
        payment: {
          id: validatedData.paymentId,
          amount: validatedData.amount,
          method: result.paymentMethod,
          authorized: true,
          authorizedAt: new Date().toISOString(),
        },
      }),
      supportedWallets: multiWalletAuthService.getSupportedWallets(),
    });

  } catch (error) {
    console.error('Multi-wallet auth endpoint error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation Error',
          message: 'Please check your input and try again',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Wallet authentication service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET - Generate challenge message for wallet authentication
 * Supports both Bitcoin and Stacks wallets
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'connection';
    const address = searchParams.get('address');
    const walletType = searchParams.get('walletType') as 'stacks' | 'bitcoin' || 'stacks';
    const paymentId = searchParams.get('paymentId');
    const amount = searchParams.get('amount');

    if (!address) {
      return NextResponse.json(
        { 
          error: 'Missing Parameter',
          message: 'Wallet address is required',
          code: 'MISSING_ADDRESS'
        },
        { status: 400 }
      );
    }

    // Validate wallet type
    if (!['stacks', 'bitcoin'].includes(walletType)) {
      return NextResponse.json(
        { 
          error: 'Invalid Parameter',
          message: 'Wallet type must be either "stacks" or "bitcoin"',
          code: 'INVALID_WALLET_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate address format based on wallet type
    if (walletType === 'stacks') {
      const stacksAddressRegex = /^S[TM][0-9A-Z]{39}$|^SP[0-9A-Z]{39}$/;
      if (!stacksAddressRegex.test(address)) {
        return NextResponse.json(
          { 
            error: 'Invalid Address',
            message: 'Invalid Stacks address format',
            code: 'INVALID_STACKS_ADDRESS'
          },
          { status: 400 }
        );
      }
    } else if (walletType === 'bitcoin') {
      const bitcoinAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$|^tb1[a-z0-9]{39,59}$/;
      if (!bitcoinAddressRegex.test(address)) {
        return NextResponse.json(
          { 
            error: 'Invalid Address',
            message: 'Invalid Bitcoin address format',
            code: 'INVALID_BITCOIN_ADDRESS'
          },
          { status: 400 }
        );
      }
    }

    let challenge;
    
    if (type === 'payment') {
      if (!paymentId || !amount) {
        return NextResponse.json(
          { 
            error: 'Missing Parameters',
            message: 'Payment ID and amount are required for payment challenges',
            code: 'MISSING_PAYMENT_DATA'
          },
          { status: 400 }
        );
      }

      challenge = multiWalletAuthService.generateWalletChallenge(
        address, 
        walletType, 
        paymentId, 
        parseInt(amount)
      );
    } else {
      challenge = multiWalletAuthService.generateWalletChallenge(address, walletType);
    }

    return NextResponse.json({
      success: true,
      challenge: {
        message: challenge,
        address,
        walletType,
        type,
        ...(type === 'payment' && {
          payment: {
            id: paymentId,
            amount: parseInt(amount!),
          },
        }),
      },
      instructions: {
        step1: `Copy the challenge message`,
        step2: `Sign the message with your ${walletType} wallet`,
        step3: 'Submit the signature for verification',
      },
      walletSpecificInstructions: walletType === 'bitcoin' 
        ? {
            electrum: 'Tools → Sign/Verify Message',
            bitcoinCore: 'signmessage command in console',
            sparrow: 'Tools → Sign/Verify Message',
          }
        : {
            xverse: 'Sign message in wallet',
            hiro: 'Use wallet.signMessage()',
            leather: 'Sign message feature',
          },
      note: 'This challenge expires in 10 minutes for security',
      supportedWallets: multiWalletAuthService.getSupportedWallets(),
    });

  } catch (error) {
    console.error('Challenge generation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Challenge generation service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}
