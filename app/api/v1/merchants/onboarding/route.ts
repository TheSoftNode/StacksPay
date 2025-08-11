import { NextRequest, NextResponse } from 'next/server';
import { Merchant } from '@/models/merchant';
import { authService } from '@/lib/services/auth-service';
import { multiWalletAuthService } from '@/lib/services/multi-wallet-auth-service';
import { connectToDatabase } from '@/lib/database/mongodb';
import { sessionAuth } from '@/lib/middleware/session-auth';

/**
 * POST - Complete merchant onboarding
 * Sets up wallet, payout preferences, and conversion settings
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate session
    const authResult = await sessionAuth(request);
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
    if (!merchantId) {
      return NextResponse.json(
        { 
          error: 'Invalid Session',
          message: 'Merchant ID not found in session',
          code: 'INVALID_SESSION'
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const body = await request.json();
    const {
      // Business information
      businessInfo,
      
      // Wallet setup
      walletSetup,
      
      // Payout preferences
      payoutPreferences,
      
      // Payment settings
      paymentSettings,
      
      // KYC/Compliance
      kycInfo,
      
      // Webhook and notification settings
      integrationSettings,
    } = body;

    // Validate required fields
    if (!walletSetup || (!walletSetup.stacksAddress && !walletSetup.bitcoinAddress)) {
      return NextResponse.json(
        { 
          error: 'Wallet Setup Required',
          message: 'At least one wallet address (Stacks or Bitcoin) must be provided',
          code: 'MISSING_WALLET'
        },
        { status: 400 }
      );
    }

    if (!payoutPreferences || !payoutPreferences.defaultMethod) {
      return NextResponse.json(
        { 
          error: 'Payout Preferences Required',
          message: 'Default payout method must be specified',
          code: 'MISSING_PAYOUT_PREFERENCES'
        },
        { status: 400 }
      );
    }

    // Validate wallet addresses
    const walletValidation = await validateWalletSetup(walletSetup);
    if (!walletValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid Wallet Configuration',
          message: walletValidation.error,
          code: 'INVALID_WALLET'
        },
        { status: 400 }
      );
    }

    // Get existing merchant
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

    // Update merchant with onboarding data
    const updatedData = {
      // Business information
      ...(businessInfo && {
        businessName: businessInfo.businessName || merchant.businessName,
        businessType: businessInfo.businessType,
        industry: businessInfo.industry,
        website: businessInfo.website,
        description: businessInfo.description,
        address: businessInfo.address,
        taxId: businessInfo.taxId,
      }),

      // Wallet setup - validated addresses
      walletSetup: {
        ...(walletSetup.stacksAddress && {
          stacksAddress: walletSetup.stacksAddress,
          stacksNetwork: walletSetup.stacksNetwork || 'testnet',
        }),
        ...(walletSetup.bitcoinAddress && {
          bitcoinAddress: walletSetup.bitcoinAddress,
          bitcoinNetwork: walletSetup.bitcoinNetwork || 'testnet',
        }),
        preferredWallet: walletSetup.preferredWallet || 'stacks',
        setupCompletedAt: new Date(),
      },

      // Payout preferences
      payoutPreferences: {
        defaultMethod: payoutPreferences.defaultMethod, // 'sbtc', 'usd', 'usdt'
        minimumPayout: payoutPreferences.minimumPayout || 0.001,
        autoPayoutEnabled: payoutPreferences.autoPayoutEnabled || false,
        payoutSchedule: payoutPreferences.payoutSchedule || 'manual', // 'daily', 'weekly', 'monthly', 'manual'
        
        // USD/USDT payout details
        ...((['usd', 'usdt'].includes(payoutPreferences.defaultMethod)) && {
          bankAccount: payoutPreferences.bankAccount,
          usdtAddress: payoutPreferences.usdtAddress,
        }),

        // Fee preferences
        feeStructure: payoutPreferences.feeStructure || 'standard', // 'standard', 'premium'
        acceptedCurrencies: payoutPreferences.acceptedCurrencies || ['BTC', 'STX', 'sBTC'],
      },

      // Payment settings
      paymentSettings: {
        acceptedMethods: paymentSettings?.acceptedMethods || ['sbtc', 'btc', 'stx'],
        defaultCurrency: paymentSettings?.defaultCurrency || 'USD',
        confirmationRequirements: {
          btc: paymentSettings?.confirmationRequirements?.btc || 1,
          stx: paymentSettings?.confirmationRequirements?.stx || 1,
          sbtc: paymentSettings?.confirmationRequirements?.sbtc || 1,
        },
        expirationTime: paymentSettings?.expirationTime || 24, // hours
        allowPartialPayments: paymentSettings?.allowPartialPayments || false,
      },

      // KYC/Compliance information
      ...(kycInfo && {
        kycInfo: {
          level: kycInfo.level || 'basic', // 'basic', 'enhanced', 'institutional'
          documents: kycInfo.documents || [],
          verificationStatus: 'pending',
          submittedAt: new Date(),
        },
      }),

      // Integration settings
      integrationSettings: {
        webhookUrl: integrationSettings?.webhookUrl,
        webhookEvents: integrationSettings?.webhookEvents || ['payment.confirmed', 'payment.failed'],
        apiAccessLevel: integrationSettings?.apiAccessLevel || 'standard',
        rateLimits: integrationSettings?.rateLimits || {
          requestsPerMinute: 100,
          dailyLimit: 10000,
        },
        
        // Notification preferences
        notifications: {
          email: integrationSettings?.notifications?.email !== false,
          webhook: integrationSettings?.notifications?.webhook !== false,
          sms: integrationSettings?.notifications?.sms || false,
        },
      },

      // Update status
      status: 'active',
      onboardingCompletedAt: new Date(),
    };

    // Update merchant
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      merchantId,
      { $set: updatedData },
      { new: true, runValidators: true }
    ).select('-password');

    // Generate initial API key if not exists
    let apiKey = null;
    if (!updatedMerchant.apiKeys || updatedMerchant.apiKeys.length === 0) {
      const apiKeyResult = await authService.generateApiKey(
        merchantId, 
        ['read', 'write'], 
        'test'
      );
      apiKey = {
        keyId: apiKeyResult.keyId,
        apiKey: apiKeyResult.apiKey,
        keyPreview: apiKeyResult.keyPreview,
        createdAt: apiKeyResult.createdAt,
      };
    }

    return NextResponse.json({
      success: true,
      merchant: {
        id: updatedMerchant._id,
        businessName: updatedMerchant.businessName,
        email: updatedMerchant.email,
        status: updatedMerchant.status,
        walletSetup: updatedMerchant.walletSetup,
        payoutPreferences: updatedMerchant.payoutPreferences,
        paymentSettings: updatedMerchant.paymentSettings,
        integrationSettings: updatedMerchant.integrationSettings,
        onboardingCompletedAt: updatedMerchant.onboardingCompletedAt,
      },
      ...(apiKey && { 
        apiKey: {
          keyId: apiKey.keyId,
          key: apiKey.apiKey,
          hint: `${apiKey.apiKey.substring(0, 8)}...`,
          createdAt: apiKey.createdAt,
        },
      }),
      nextSteps: getNextSteps(updatedMerchant),
      integration: {
        apiEndpoint: `${process.env.NEXT_PUBLIC_APP_URL}/api/v1`,
        documentationUrl: `${process.env.NEXT_PUBLIC_APP_URL}/docs`,
        testPaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/docs/test-payment`,
        sdkDownloads: {
          javascript: `${process.env.NEXT_PUBLIC_APP_URL}/sdk/javascript`,
          python: `${process.env.NEXT_PUBLIC_APP_URL}/sdk/python`,
          curl: `${process.env.NEXT_PUBLIC_APP_URL}/docs/api-reference`,
        },
      },
    });

  } catch (error) {
    console.error('Merchant onboarding error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Onboarding service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}

/**
 * GET - Get current onboarding status
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate session
    const authResult = await sessionAuth(request);
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
    if (!merchantId) {
      return NextResponse.json(
        { 
          error: 'Invalid Session',
          message: 'Merchant ID not found in session',
          code: 'INVALID_SESSION'
        },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const merchant = await Merchant.findById(merchantId).select('-password');
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

    const onboardingStatus = getOnboardingStatus(merchant);

    return NextResponse.json({
      success: true,
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        status: merchant.status,
        createdAt: merchant.createdAt,
      },
      onboarding: onboardingStatus,
      nextSteps: getNextSteps(merchant),
    });

  } catch (error) {
    console.error('Onboarding status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Onboarding service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}

// Helper functions

async function validateWalletSetup(walletSetup: any) {
  try {
    const validations = [];

    // Validate Stacks address if provided
    if (walletSetup.stacksAddress) {
      const stacksValid = validateStacksAddress(walletSetup.stacksAddress);
      if (!stacksValid) {
        return { valid: false, error: 'Invalid Stacks address format' };
      }
      validations.push({ type: 'stacks', address: walletSetup.stacksAddress, valid: true });
    }

    // Validate Bitcoin address if provided
    if (walletSetup.bitcoinAddress) {
      const bitcoinValid = validateBitcoinAddress(walletSetup.bitcoinAddress);
      if (!bitcoinValid) {
        return { valid: false, error: 'Invalid Bitcoin address format' };
      }
      validations.push({ type: 'bitcoin', address: walletSetup.bitcoinAddress, valid: true });
    }

    // Validate preferred wallet type
    if (walletSetup.preferredWallet) {
      if (!['stacks', 'bitcoin'].includes(walletSetup.preferredWallet)) {
        return { valid: false, error: 'Preferred wallet must be either "stacks" or "bitcoin"' };
      }

      // Ensure preferred wallet has a corresponding address
      if (walletSetup.preferredWallet === 'stacks' && !walletSetup.stacksAddress) {
        return { valid: false, error: 'Stacks address required when Stacks is preferred wallet' };
      }
      if (walletSetup.preferredWallet === 'bitcoin' && !walletSetup.bitcoinAddress) {
        return { valid: false, error: 'Bitcoin address required when Bitcoin is preferred wallet' };
      }
    }

    return { valid: true, validations };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
    return { valid: false, error: `Wallet validation error: ${errorMessage}` };
  }
}

// Simple address validation functions
function validateStacksAddress(address: string): boolean {
  // Stacks addresses start with SP (mainnet) or ST (testnet) followed by 39 chars
  const stacksRegex = /^S[TMP][0-9A-Z]{39}$/;
  return stacksRegex.test(address);
}

function validateBitcoinAddress(address: string): boolean {
  // Basic Bitcoin address validation (covers most common formats)
  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
  return btcRegex.test(address);
}

function getOnboardingStatus(merchant: any) {
  const steps = {
    businessInfo: {
      name: 'Business Information',
      completed: !!(merchant.businessName && merchant.businessType),
      required: true,
    },
    walletSetup: {
      name: 'Wallet Setup',
      completed: !!(merchant.walletSetup && 
        (merchant.walletSetup.stacksAddress || merchant.walletSetup.bitcoinAddress)),
      required: true,
    },
    payoutPreferences: {
      name: 'Payout Preferences',
      completed: !!(merchant.payoutPreferences && merchant.payoutPreferences.defaultMethod),
      required: true,
    },
    apiKey: {
      name: 'API Key Generation',
      completed: !!(merchant.apiKeys && merchant.apiKeys.length > 0),
      required: true,
    },
    kycVerification: {
      name: 'KYC Verification',
      completed: !!(merchant.kycInfo && merchant.kycInfo.verificationStatus === 'verified'),
      required: false,
    },
    webhookSetup: {
      name: 'Webhook Configuration',
      completed: !!(merchant.integrationSettings && merchant.integrationSettings.webhookUrl),
      required: false,
    },
  };

  const completedSteps = Object.values(steps).filter(step => step.completed).length;
  const requiredSteps = Object.values(steps).filter(step => step.required).length;
  const completedRequiredSteps = Object.values(steps)
    .filter(step => step.required && step.completed).length;

  const isComplete = completedRequiredSteps === requiredSteps;
  const progressPercentage = Math.round((completedSteps / Object.keys(steps).length) * 100);

  return {
    isComplete,
    progressPercentage,
    completedSteps,
    totalSteps: Object.keys(steps).length,
    completedRequiredSteps,
    requiredSteps,
    steps,
  };
}

function getNextSteps(merchant: any): Array<{
  title: string;
  description: string;
  action: string;
  url: string;
  priority: string;
}> {
  const onboardingStatus = getOnboardingStatus(merchant);
  
  if (onboardingStatus.isComplete) {
    return [
      {
        title: 'Start Accepting Payments',
        description: 'Create your first payment request using the API',
        action: 'Create Payment',
        url: '/docs/create-payment',
        priority: 'high',
      },
      {
        title: 'Test Integration',
        description: 'Test the payment flow with testnet transactions',
        action: 'Test Payment',
        url: '/docs/test-payment',
        priority: 'medium',
      },
      {
        title: 'Setup Webhooks',
        description: 'Configure webhooks to receive payment notifications',
        action: 'Configure Webhooks',
        url: '/dashboard/settings/webhooks',
        priority: 'medium',
      },
    ];
  }

  const nextSteps: Array<{
    title: string;
    description: string;
    action: string;
    url: string;
    priority: string;
  }> = [];

  // Add steps based on what's missing
  Object.entries(onboardingStatus.steps).forEach(([key, step]) => {
    if (!step.completed && step.required) {
      const stepMapping = {
        businessInfo: {
          title: 'Complete Business Information',
          description: 'Add your business details and contact information',
          action: 'Update Profile',
          url: '/dashboard/settings/profile',
        },
        walletSetup: {
          title: 'Setup Your Wallets',
          description: 'Connect your Stacks and/or Bitcoin wallets for payouts',
          action: 'Setup Wallets',
          url: '/dashboard/settings/wallets',
        },
        payoutPreferences: {
          title: 'Configure Payout Preferences',
          description: 'Choose how and when you want to receive payouts',
          action: 'Set Preferences',
          url: '/dashboard/settings/payouts',
        },
        apiKey: {
          title: 'Generate API Key',
          description: 'Create API keys to start accepting payments',
          action: 'Generate Key',
          url: '/dashboard/settings/api-keys',
        },
      };

      if (stepMapping[key as keyof typeof stepMapping]) {
        nextSteps.push({
          ...stepMapping[key as keyof typeof stepMapping],
          priority: 'high',
        });
      }
    }
  });

  return nextSteps;
}
