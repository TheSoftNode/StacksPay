# Backend Implementation Guide

**Project**: sBTC Payment Gateway  
**Focus**: Backend Development with Next.js API Routes + MongoDB  
**Payment Support**: Bitcoin AND STX payments with sBTC conversion  
**Last Updated**: August 11, 2025

## Overview

This guide provides step-by-step instructions for implementing the backend of the sBTC Payment Gateway. We'll focus on creating a robust API layer that handles **both Bitcoin and STX payments**, merchant management, and webhook notifications.

**Key Innovation**: Customers can choose between Bitcoin (traditional/secure) or STX (fast/cheap) payments, while merchants always receive sBTC.

## Current Backend Structure

```
app/api/
├── auth/                 # Authentication endpoints
├── v1/                   # API version 1
│   ├── analytics/        # Analytics and reporting
│   ├── merchants/        # Merchant management
│   ├── payments/         # Payment processing (Bitcoin + STX)
│   ├── sbtc/            # sBTC-specific operations
│   ├── bitcoin/         # Bitcoin payment processing
│   ├── stx/             # STX payment processing
│   └── system/          # System health and status
└── webhooks/            # Webhook handlers (unified for both currencies)

lib/
├── services/            # Business logic layer
│   ├── bitcoin/         # Bitcoin payment service
│   ├── stx/             # STX payment service
│   └── sbtc/            # sBTC conversion service
├── database/           # Database connections
├── utils/              # Utility functions
└── validators/         # Schema validations
```

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1. Environment Configuration

**File**: `.env.local` (create this file)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/sbtc_gateway
MONGODB_DB_NAME=sbtc_gateway

# sBTC Configuration (supports both Bitcoin and STX conversion)
SBTC_NETWORK=testnet
EMILY_API_URL=https://api.testnet.sbtc.tech
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co

# Bitcoin Configuration
BITCOIN_NETWORK=testnet
BITCOIN_RPC_URL=https://mempool.space/testnet/api

# STX Configuration
STX_NETWORK=testnet
STX_API_URL=https://stacks-node-api.testnet.stacks.co
STX_CONVERSION_CONTRACT=ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.sbtc-payment

# Supported Payment Methods
ENABLE_BITCOIN_PAYMENTS=true
ENABLE_STX_PAYMENTS=true

# Security
JWT_SECRET=your-jwt-secret-here
API_KEY_SECRET=your-api-key-secret-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=your-webhook-secret-here
```

#### 2. Install Required Dependencies

Run this command to install sBTC, Bitcoin, and Stacks dependencies:

```bash
# Core sBTC and Stacks dependencies
npm install sbtc @stacks/transactions @stacks/network @stacks/connect @stacks/auth

# Bitcoin dependencies
npm install bitcoin-core axios bcryptjs jsonwebtoken

# Multi-currency payment processing
npm install @stacks/wallet-sdk @xverse/wallet-sdk

# Development dependencies
npm install @types/bcryptjs @types/jsonwebtoken --save-dev
```

#### 3. Complete Database Connection

**File**: `lib/database/mongodb.ts`

Current implementation needs enhancement for production use:

```typescript
import mongoose from 'mongoose';

interface MongoConnection {
  isConnected: boolean;
}

const connection: MongoConnection = {
  isConnected: false,
};

export async function connectToDatabase() {
  if (connection.isConnected) {
    console.log('Already connected to MongoDB');
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI!);
    connection.isConnected = db.connections[0].readyState === 1;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase() {
  if (!connection.isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    connection.isConnected = false;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}
```

### Phase 2: Enhanced Data Models for Multi-Currency Support

#### 1. Update Payment Model for Bitcoin + STX Support

**File**: `models/payment.ts`

Add support for both Bitcoin and STX payments:

```typescript
import { Schema, model, models } from 'mongoose';

const paymentSchema = new Schema({
  // Basic payment info
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  },
  amount: {
    type: Number,
    required: true, // Amount in satoshis (sBTC)
  },
  currency: {
    type: String,
    default: 'sbtc', // Always sBTC for merchant
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired'],
    default: 'pending',
  },

  // Payment method info (Bitcoin OR STX)
  paymentMethod: {
    type: {
      type: String,
      enum: ['bitcoin', 'stx'],
      required: true,
    },
    originalAmount: String, // Original amount in chosen currency
    originalCurrency: String, // 'BTC' or 'STX'
    conversionRate: Number,
    wallet: String, // For STX: 'xverse', 'hiro', 'leather'
    networkFee: Number,
  },

  // Bitcoin-specific fields
  bitcoin: {
    depositAddress: String,
    txId: String,
    confirmations: Number,
  },

  // STX-specific fields
  stx: {
    fromAddress: String,
    txId: String,
    smartContract: String,
    conversionTime: Number, // Conversion duration in seconds
  },

  // sBTC conversion info
  sbtc: {
    address: String, // Merchant's sBTC address
    txId: String, // Final sBTC transaction
    receivedAmount: Number, // Net sBTC received
  },
  signerPublicKey: String,

  // Transaction details
  confirmations: {
    type: Number,
    default: 0,
  },
  requiredConfirmations: {
    type: Number,
    default: 6,
  },
  networkFee: Number,
  signerFee: Number,

  // Metadata and tracking
  metadata: Schema.Types.Mixed,
  customerInfo: {
    email: String,
    name: String,
  },
  expiresAt: {
    type: Date,
    required: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

paymentSchema.index({ depositAddress: 1 });
paymentSchema.index({ bitcoinTxId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ expiresAt: 1 });

export const Payment = models.Payment || model('Payment', paymentSchema);
```

#### 2. Enhanced Merchant Model

**File**: `models/merchant.ts`

Add sBTC-specific fields:

```typescript
import { Schema, model, models } from 'mongoose';

const merchantSchema = new Schema({
  // Basic information
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  website: String,

  // sBTC configuration
  stacksAddress: {
    type: String,
    required: true,
  },
  bitcoinAddress: String,
  sbtcSettings: {
    autoConvert: {
      type: Boolean,
      default: false,
    },
    minAmount: {
      type: Number,
      default: 10000, // 0.0001 BTC in satoshis
    },
    maxAmount: {
      type: Number,
      default: 100000000, // 1 BTC in satoshis
    },
    confirmationThreshold: {
      type: Number,
      default: 6,
    },
  },

  // API configuration
  apiKeys: [
    {
      keyId: String,
      keyHash: String,
      keyPreview: String, // Last 4 characters for display
      permissions: [String],
      isActive: {
        type: Boolean,
        default: true,
      },
      createdAt: Date,
      lastUsed: Date,
      expiresAt: Date,
    },
  ],

  // Webhook configuration
  webhookUrl: String,
  webhookSecret: String,
  webhookEvents: [String],

  // Status and metadata
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationLevel: {
    type: String,
    enum: ['none', 'basic', 'full'],
    default: 'none',
  },

  // Statistics
  stats: {
    totalPayments: {
      type: Number,
      default: 0,
    },
    totalVolume: {
      type: Number,
      default: 0,
    },
    lastPaymentAt: Date,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

merchantSchema.index({ email: 1 });
merchantSchema.index({ stacksAddress: 1 });
merchantSchema.index({ isActive: 1 });

export const Merchant = models.Merchant || model('Merchant', merchantSchema);
```

#### 3. Create Additional Models

**File**: `models/transaction.ts`

```typescript
import { Schema, model, models } from 'mongoose';

const transactionSchema = new Schema({
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer'],
    required: true,
  },
  blockchain: {
    type: String,
    enum: ['bitcoin', 'stacks'],
    required: true,
  },
  txId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  confirmations: {
    type: Number,
    default: 0,
  },
  blockHeight: Number,
  fee: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

transactionSchema.index({ txId: 1 });
transactionSchema.index({ paymentId: 1 });

export const Transaction = models.Transaction || model('Transaction', transactionSchema);
```

### Phase 3: Service Layer Implementation

#### 1. Multi-Currency Payment Service

**File**: `lib/services/payment-service.ts`

```typescript
import { Payment } from '@/models/payment';
import { Merchant } from '@/models/merchant';
import { Transaction } from '@/models/transaction';
import { connectToDatabase } from '@/lib/database/mongodb';
import { buildSbtcDepositAddress, SbtcApiClientTestnet } from 'sbtc';
import { generateId } from '@/lib/utils/id-generator';

export interface CreatePaymentRequest {
  merchantId: string;
  amount: number; // Amount in USD cents or sBTC satoshis
  currency?: string;
  paymentMethods?: ('bitcoin' | 'stx')[]; // Allow both by default
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, any>;
  expiresIn?: number; // minutes, default 30
}

export interface PaymentResponse {
  id: string;
  amount: number; // Final sBTC amount in satoshis
  currency: string; // Always 'sbtc' for merchant
  status: string;
  paymentOptions: {
    bitcoin?: {
      address: string;
      amount: string; // BTC amount
      qrCode: string;
    };
    stx?: {
      amount: string; // STX amount
      smartContract: string;
      supportedWallets: string[];
    };
  };
  expiresAt: Date;
  metadata?: Record<string, any>;
}

export class PaymentService {
  private sbtcClient: SbtcApiClientTestnet;

  constructor() {
    this.sbtcClient = new SbtcApiClientTestnet();
  }

  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    await connectToDatabase();

    try {
      // Validate merchant
      const merchant = await Merchant.findById(data.merchantId);
      if (!merchant || !merchant.isActive) {
        throw new Error('Invalid or inactive merchant');
      }

      // Generate sBTC deposit address
      const signerPublicKey = await this.sbtcClient.fetchSignersPublicKey();
      const deposit = buildSbtcDepositAddress({
        stacksAddress: merchant.stacksAddress,
        signersPublicKey: signerPublicKey,
        maxSignerFee: 80_000,
        reclaimLockTime: 6_000,
      });

      // Calculate expiration
      const expiresIn = data.expiresIn || 30; // 30 minutes default
      const expiresAt = new Date(Date.now() + expiresIn * 60 * 1000);

      // Create payment record
      const payment = new Payment({
        merchantId: data.merchantId,
        amount: data.amount,
        currency: data.currency || 'BTC',
        status: 'pending',
        depositAddress: deposit.address,
        stacksAddress: merchant.stacksAddress,
        depositScript: deposit.depositScript,
        reclaimScript: deposit.reclaimScript,
        signerPublicKey: signerPublicKey,
        customerInfo: {
          email: data.customerEmail,
          name: data.customerName,
        },
        metadata: data.metadata,
        expiresAt: expiresAt,
      });

      await payment.save();

      return {
        id: payment._id.toString(),
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        depositAddress: payment.depositAddress,
        stacksAddress: payment.stacksAddress,
        expiresAt: payment.expiresAt,
        metadata: payment.metadata,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPayment(id: string): Promise<PaymentResponse | null> {
    await connectToDatabase();

    try {
      const payment = await Payment.findById(id);
      if (!payment) {
        return null;
      }

      return {
        id: payment._id.toString(),
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        depositAddress: payment.depositAddress,
        stacksAddress: payment.stacksAddress,
        expiresAt: payment.expiresAt,
        metadata: payment.metadata,
      };
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  async updatePaymentStatus(id: string, status: string, txId?: string): Promise<void> {
    await connectToDatabase();

    try {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      if (txId) {
        updateData.bitcoinTxId = txId;
      }

      await Payment.findByIdAndUpdate(id, updateData);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async checkPaymentConfirmations(id: string): Promise<number> {
    await connectToDatabase();

    try {
      const payment = await Payment.findById(id);
      if (!payment || !payment.bitcoinTxId) {
        return 0;
      }

      // TODO: Implement Bitcoin transaction confirmation checking
      // This would use a Bitcoin API to check confirmations
      return payment.confirmations || 0;
    } catch (error) {
      console.error('Error checking confirmations:', error);
      return 0;
    }
  }

  async processRefund(id: string, amount?: number): Promise<any> {
    await connectToDatabase();

    try {
      const payment = await Payment.findById(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'completed') {
        throw new Error('Can only refund completed payments');
      }

      // TODO: Implement sBTC refund logic
      // This would involve burning sBTC and releasing Bitcoin

      return {
        id: payment._id.toString(),
        refundAmount: amount || payment.amount,
        status: 'refunded',
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
```

#### 2. Implement Merchant Service

**File**: `lib/services/merchant-service.ts`

```typescript
import { Merchant } from '@/models/merchant';
import { connectToDatabase } from '@/lib/database/mongodb';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface CreateMerchantRequest {
  name: string;
  email: string;
  businessType: string;
  website?: string;
  stacksAddress: string;
  bitcoinAddress?: string;
}

export interface ApiKeyResponse {
  keyId: string;
  apiKey: string;
  keyPreview: string;
  permissions: string[];
  createdAt: Date;
}

export class MerchantService {
  async createMerchant(data: CreateMerchantRequest) {
    await connectToDatabase();

    try {
      // Check if merchant already exists
      const existingMerchant = await Merchant.findOne({ email: data.email });
      if (existingMerchant) {
        throw new Error('Merchant with this email already exists');
      }

      // Create merchant
      const merchant = new Merchant({
        name: data.name,
        email: data.email,
        businessType: data.businessType,
        website: data.website,
        stacksAddress: data.stacksAddress,
        bitcoinAddress: data.bitcoinAddress,
      });

      await merchant.save();

      // Generate initial API key
      const apiKey = await this.generateApiKey(merchant._id.toString(), ['read', 'write']);

      return {
        id: merchant._id.toString(),
        name: merchant.name,
        email: merchant.email,
        stacksAddress: merchant.stacksAddress,
        apiKey: apiKey,
        createdAt: merchant.createdAt,
      };
    } catch (error) {
      console.error('Error creating merchant:', error);
      throw error;
    }
  }

  async getMerchant(id: string) {
    await connectToDatabase();

    try {
      const merchant = await Merchant.findById(id);
      if (!merchant) {
        return null;
      }

      return {
        id: merchant._id.toString(),
        name: merchant.name,
        email: merchant.email,
        businessType: merchant.businessType,
        website: merchant.website,
        stacksAddress: merchant.stacksAddress,
        bitcoinAddress: merchant.bitcoinAddress,
        isActive: merchant.isActive,
        isVerified: merchant.isVerified,
        stats: merchant.stats,
        createdAt: merchant.createdAt,
      };
    } catch (error) {
      console.error('Error fetching merchant:', error);
      throw error;
    }
  }

  async generateApiKey(merchantId: string, permissions: string[]): Promise<ApiKeyResponse> {
    await connectToDatabase();

    try {
      const keyId = crypto.randomUUID();
      const apiKey = `sk_${process.env.SBTC_NETWORK || 'test'}_${crypto
        .randomBytes(32)
        .toString('hex')}`;
      const keyHash = await bcrypt.hash(apiKey, 10);
      const keyPreview = `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)}`;

      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        throw new Error('Merchant not found');
      }

      merchant.apiKeys.push({
        keyId,
        keyHash,
        keyPreview,
        permissions,
        isActive: true,
        createdAt: new Date(),
      });

      await merchant.save();

      return {
        keyId,
        apiKey,
        keyPreview,
        permissions,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  }

  async validateApiKey(apiKey: string): Promise<any> {
    await connectToDatabase();

    try {
      const merchants = await Merchant.find({ 'apiKeys.isActive': true });

      for (const merchant of merchants) {
        for (const key of merchant.apiKeys) {
          if (key.isActive && (await bcrypt.compare(apiKey, key.keyHash))) {
            // Update last used timestamp
            key.lastUsed = new Date();
            await merchant.save();

            return {
              merchantId: merchant._id.toString(),
              keyId: key.keyId,
              permissions: key.permissions,
              merchant: {
                name: merchant.name,
                email: merchant.email,
                stacksAddress: merchant.stacksAddress,
              },
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error validating API key:', error);
      throw error;
    }
  }

  async updateMerchantStats(merchantId: string, amount: number) {
    await connectToDatabase();

    try {
      await Merchant.findByIdAndUpdate(merchantId, {
        $inc: {
          'stats.totalPayments': 1,
          'stats.totalVolume': amount,
        },
        $set: {
          'stats.lastPaymentAt': new Date(),
        },
      });
    } catch (error) {
      console.error('Error updating merchant stats:', error);
      throw error;
    }
  }
}

export const merchantService = new MerchantService();
```

### Phase 4: API Route Implementation

#### 1. Payment Creation Endpoint

**File**: `app/api/v1/payments/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment-service';
import { merchantService } from '@/lib/services/merchant-service';
import { z } from 'zod';

const createPaymentSchema = z.object({
  amount: z.number().min(10000), // Minimum 0.0001 BTC
  currency: z.string().optional().default('BTC'),
  customer_email: z.string().email().optional(),
  customer_name: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  expires_in: z.number().min(5).max(1440).optional(), // 5 minutes to 24 hours
});

export async function POST(request: NextRequest) {
  try {
    // Extract API key from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Validate API key and get merchant
    const auth = await merchantService.validateApiKey(apiKey);
    if (!auth) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createPaymentSchema.parse(body);

    // Create payment
    const payment = await paymentService.createPayment({
      merchantId: auth.merchantId,
      amount: validatedData.amount,
      currency: validatedData.currency,
      customerEmail: validatedData.customer_email,
      customerName: validatedData.customer_name,
      metadata: validatedData.metadata,
      expiresIn: validatedData.expires_in,
    });

    return NextResponse.json({
      object: 'payment_intent',
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      client_secret: `${payment.id}_secret_${Date.now()}`, // For frontend
      payment_method_data: {
        bitcoin: {
          address: payment.depositAddress,
          amount_btc: payment.amount / 100000000,
          amount_sats: payment.amount,
        },
      },
      expires_at: payment.expiresAt.toISOString(),
      metadata: payment.metadata,
      created: Math.floor(Date.now() / 1000),
    });
  } catch (error) {
    console.error('Error creating payment:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 2. Payment Retrieval Endpoint

**File**: `app/api/v1/payments/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { paymentService } from '@/lib/services/payment-service';
import { merchantService } from '@/lib/services/merchant-service';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Validate API key
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    const auth = await merchantService.validateApiKey(apiKey);
    if (!auth) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Get payment
    const payment = await paymentService.getPayment(params.id);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({
      object: 'payment_intent',
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      payment_method_data: {
        bitcoin: {
          address: payment.depositAddress,
          amount_btc: payment.amount / 100000000,
          amount_sats: payment.amount,
        },
      },
      expires_at: payment.expiresAt.toISOString(),
      metadata: payment.metadata,
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Phase 5: Testing and Validation

#### 1. Create API Testing Script

**File**: `scripts/test-api.js`

```javascript
// Test script for API endpoints
const API_BASE = 'http://localhost:3000/api/v1';
const API_KEY = 'your-test-api-key'; // Will be generated when you create a merchant

async function testAPI() {
  try {
    console.log('Testing Payment Creation...');

    const createResponse = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        amount: 100000, // 0.001 BTC
        customer_email: 'test@example.com',
        metadata: {
          order_id: 'test-order-123',
        },
      }),
    });

    const payment = await createResponse.json();
    console.log('Payment created:', payment);

    if (payment.id) {
      console.log('Testing Payment Retrieval...');

      const getResponse = await fetch(`${API_BASE}/payments/${payment.id}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      });

      const retrievedPayment = await getResponse.json();
      console.log('Payment retrieved:', retrievedPayment);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAPI();
```

#### 2. Database Seed Script

**File**: `scripts/seed-data.ts`

```typescript
import { connectToDatabase } from '@/lib/database/mongodb';
import { merchantService } from '@/lib/services/merchant-service';

async function seedDatabase() {
  await connectToDatabase();

  try {
    console.log('Seeding test merchant...');

    const merchant = await merchantService.createMerchant({
      name: 'Test Merchant',
      email: 'merchant@test.com',
      businessType: 'E-commerce',
      website: 'https://test-merchant.com',
      stacksAddress: 'ST000000000000000000002AMW42H', // Test address
      bitcoinAddress: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', // Test address
    });

    console.log('Test merchant created:');
    console.log('Merchant ID:', merchant.id);
    console.log('API Key:', merchant.apiKey.apiKey);
    console.log('Use this API key for testing the endpoints');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seedDatabase();
```

## Next Steps

1. **Set up environment variables** in `.env.local`
2. **Install required dependencies** using npm install commands
3. **Start local MongoDB** instance
4. **Run the seed script** to create test merchant
5. **Test API endpoints** using the test script
6. **Implement transaction monitoring** for Bitcoin payments
7. **Add webhook notifications** for payment status updates

## Development Workflow

1. Start development server: `npm run dev`
2. Test database connection: Check MongoDB logs
3. Create test merchant: Run seed script
4. Test API endpoints: Use Postman or test script
5. Monitor logs: Check console for errors
6. Implement frontend integration: Connect React components to API

This implementation provides a solid foundation for the sBTC payment gateway backend. The next phase will focus on Bitcoin transaction monitoring and webhook implementations.
