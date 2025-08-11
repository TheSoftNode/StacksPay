# Database Schema & MongoDB Setup

**Project**: sBTC Payment Gateway  
**Database**: MongoDB with Mongoose ODM  
**Last Updated**: August 11, 2025

## Overview

This document outlines the complete database schema design for the sBTC Payment Gateway, including MongoDB setup, data models, relationships, and indexing strategies.

## Database Architecture

### Connection Strategy

The application uses MongoDB with Mongoose ODM for the following reasons:

- **Flexible Schema**: Perfect for evolving payment data structures
- **JSON-like Documents**: Natural fit for API responses
- **Horizontal Scaling**: Supports sharding for high transaction volumes
- **Rich Queries**: Complex queries for analytics and reporting

### Environment Configuration

**Required Environment Variables:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sbtc_gateway
MONGODB_DB_NAME=sbtc_gateway

# For Production (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sbtc_gateway?retryWrites=true&w=majority

# Connection Options
MONGODB_MAX_POOL_SIZE=10
MONGODB_SERVER_SELECTION_TIMEOUT=5000
MONGODB_SOCKET_TIMEOUT=45000
```

## Core Data Models

### 1. Merchant Model

**File**: `models/merchant.ts`

```typescript
import { Schema, model, models } from 'mongoose';

const merchantSchema = new Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  businessType: {
    type: String,
    required: true,
    enum: ['e-commerce', 'saas', 'marketplace', 'gaming', 'digital-content', 'non-profit', 'other'],
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function (v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL',
    },
  },

  // sBTC Configuration
  stacksAddress: {
    type: String,
    required: true,
    validate: {
      validator: function (v: string) {
        return /^S[MP][0-9A-HJKMNP-Z]{39}$/.test(v);
      },
      message: 'Invalid Stacks address format',
    },
  },
  bitcoinAddress: {
    type: String,
    validate: {
      validator: function (v: string) {
        return !v || /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,87}$/.test(v);
      },
      message: 'Invalid Bitcoin address format',
    },
  },

  // sBTC Settings
  sbtcSettings: {
    autoConvert: {
      type: Boolean,
      default: false,
    },
    minAmount: {
      type: Number,
      default: 10000, // 0.0001 BTC in satoshis
      min: 1000,
    },
    maxAmount: {
      type: Number,
      default: 100000000, // 1 BTC in satoshis
      max: 2100000000000000, // 21M BTC limit
    },
    confirmationThreshold: {
      type: Number,
      default: 6,
      min: 1,
      max: 100,
    },
    networkPreference: {
      type: String,
      enum: ['mainnet', 'testnet'],
      default: 'testnet',
    },
  },

  // API Configuration
  apiKeys: [
    {
      keyId: {
        type: String,
        required: true,
      },
      keyHash: {
        type: String,
        required: true,
      },
      keyPreview: {
        type: String,
        required: true,
      },
      permissions: [
        {
          type: String,
          enum: ['read', 'write', 'admin', 'webhook'],
        },
      ],
      isActive: {
        type: Boolean,
        default: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      lastUsed: {
        type: Date,
      },
      expiresAt: {
        type: Date,
      },
      ipWhitelist: [String],
      usageCount: {
        type: Number,
        default: 0,
      },
    },
  ],

  // Webhook Configuration
  webhookUrl: {
    type: String,
    validate: {
      validator: function (v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Webhook URL must be a valid URL',
    },
  },
  webhookSecret: String,
  webhookEvents: [
    {
      type: String,
      enum: [
        'payment.created',
        'payment.processing',
        'payment.completed',
        'payment.failed',
        'payment.expired',
        'merchant.updated',
      ],
    },
  ],
  webhookRetries: {
    type: Number,
    default: 3,
    min: 0,
    max: 10,
  },

  // Status and Verification
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
  verificationDocuments: [
    {
      type: {
        type: String,
        enum: ['business_license', 'tax_id', 'bank_statement', 'identity'],
      },
      filename: String,
      uploadedAt: Date,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
    },
  ],

  // Rate Limiting
  rateLimits: {
    requestsPerMinute: {
      type: Number,
      default: 100,
    },
    paymentsPerHour: {
      type: Number,
      default: 1000,
    },
    maxPaymentAmount: {
      type: Number,
      default: 100000000, // 1 BTC
    },
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
    successfulPayments: {
      type: Number,
      default: 0,
    },
    failedPayments: {
      type: Number,
      default: 0,
    },
    lastPaymentAt: Date,
    averagePaymentAmount: {
      type: Number,
      default: 0,
    },
  },

  // Compliance and Security
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'not_required'],
    default: 'not_required',
  },
  amlChecks: [
    {
      checkType: String,
      result: String,
      performedAt: Date,
      details: Schema.Types.Mixed,
    },
  ],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: Date,
});

// Indexes
merchantSchema.index({ email: 1 }, { unique: true });
merchantSchema.index({ stacksAddress: 1 });
merchantSchema.index({ isActive: 1 });
merchantSchema.index({ verificationLevel: 1 });
merchantSchema.index({ createdAt: -1 });
merchantSchema.index({ 'apiKeys.keyId': 1 });

// Update timestamp on save
merchantSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Merchant = models.Merchant || model('Merchant', merchantSchema);
```

### 2. Enhanced Payment Model

**File**: `models/payment.ts`

```typescript
import { Schema, model, models } from 'mongoose';

const paymentSchema = new Schema({
  // Basic Payment Information
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 1000, // Minimum 0.00001 BTC
  },
  currency: {
    type: String,
    default: 'BTC',
    enum: ['BTC', 'SBTC'],
  },
  status: {
    type: String,
    enum: [
      'pending', // Waiting for payment
      'processing', // Bitcoin received, processing sBTC
      'completed', // sBTC minted successfully
      'failed', // Transaction failed
      'cancelled', // Cancelled by user/merchant
      'expired', // Payment window expired
      'refunded', // Payment refunded
    ],
    default: 'pending',
    index: true,
  },

  // sBTC-specific Fields
  depositAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  stacksAddress: {
    type: String,
    required: true,
    index: true,
  },
  bitcoinTxId: {
    type: String,
    index: true,
    sparse: true,
  },
  stacksTxId: {
    type: String,
    index: true,
    sparse: true,
  },

  // sBTC Protocol Data
  depositScript: {
    type: String,
    required: true,
  },
  reclaimScript: {
    type: String,
    required: true,
  },
  signerPublicKey: {
    type: String,
    required: true,
  },
  maxSignerFee: {
    type: Number,
    default: 80000, // 0.0008 BTC
  },

  // Transaction Details
  confirmations: {
    type: Number,
    default: 0,
  },
  requiredConfirmations: {
    type: Number,
    default: 6,
  },
  networkFee: {
    type: Number,
    default: 0,
  },
  actualSignerFee: {
    type: Number,
    default: 0,
  },

  // Payment Flow Tracking
  paymentSteps: [
    {
      step: {
        type: String,
        enum: [
          'payment_created',
          'bitcoin_received',
          'emily_notified',
          'sbtc_minting',
          'sbtc_minted',
          'payment_completed',
        ],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      data: Schema.Types.Mixed,
    },
  ],

  // Customer Information
  customerInfo: {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    ipAddress: String,
    userAgent: String,
  },

  // Payment Context
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  description: {
    type: String,
    maxlength: 500,
  },
  reference: {
    type: String,
    maxlength: 100,
  },

  // Webhook Tracking
  webhookEvents: [
    {
      event: String,
      url: String,
      attempts: {
        type: Number,
        default: 0,
      },
      lastAttempt: Date,
      success: {
        type: Boolean,
        default: false,
      },
      response: String,
    },
  ],

  // Error Handling
  errors: [
    {
      type: String,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      context: Schema.Types.Mixed,
    },
  ],

  // Timing
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
  firstConfirmedAt: Date,

  // Analytics
  conversionData: {
    sourceAmount: Number,
    sourceCurrency: String,
    exchangeRate: Number,
    convertedAt: Date,
  },
});

// Compound Indexes
paymentSchema.index({ merchantId: 1, status: 1 });
paymentSchema.index({ merchantId: 1, createdAt: -1 });
paymentSchema.index({ expiresAt: 1, status: 1 });
paymentSchema.index({ bitcoinTxId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// TTL Index for expired payments cleanup
paymentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours after expiry

// Update timestamp on save
paymentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Add payment step helper method
paymentSchema.methods.addStep = function (step: string, data?: any) {
  this.paymentSteps.push({
    step,
    timestamp: new Date(),
    data: data || {},
  });
};

export const Payment = models.Payment || model('Payment', paymentSchema);
```

### 3. Transaction Model

**File**: `models/transaction.ts`

```typescript
import { Schema, model, models } from 'mongoose';

const transactionSchema = new Schema({
  // Reference to payment
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true,
  },

  // Transaction Identification
  txId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'mint', 'burn'],
    required: true,
  },
  blockchain: {
    type: String,
    enum: ['bitcoin', 'stacks'],
    required: true,
  },

  // Transaction Details
  amount: {
    type: Number,
    required: true,
  },
  fee: {
    type: Number,
    default: 0,
  },
  fromAddress: String,
  toAddress: String,

  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'replaced'],
    default: 'pending',
    index: true,
  },
  confirmations: {
    type: Number,
    default: 0,
  },
  requiredConfirmations: {
    type: Number,
    default: 6,
  },

  // Block Information
  blockHeight: Number,
  blockHash: String,
  blockTime: Date,

  // Transaction Data
  rawTransaction: String,
  inputUtxos: [Schema.Types.Mixed],
  outputUtxos: [Schema.Types.Mixed],

  // Error Information
  errorMessage: String,
  errorCode: String,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  confirmedAt: Date,
});

// Indexes
transactionSchema.index({ paymentId: 1, blockchain: 1 });
transactionSchema.index({ status: 1, blockchain: 1 });
transactionSchema.index({ blockHeight: -1 });
transactionSchema.index({ createdAt: -1 });

// Update timestamp on save
transactionSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Transaction = models.Transaction || model('Transaction', transactionSchema);
```

### 4. API Key Model

**File**: `models/api-key.ts`

```typescript
import { Schema, model, models } from 'mongoose';

const apiKeySchema = new Schema({
  keyId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  },
  keyHash: {
    type: String,
    required: true,
  },
  keyPreview: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    default: 'Default API Key',
    maxlength: 100,
  },

  // Permissions
  permissions: [
    {
      type: String,
      enum: ['read', 'write', 'admin', 'webhook', 'analytics'],
    },
  ],

  // Security
  isActive: {
    type: Boolean,
    default: true,
  },
  ipWhitelist: [String],
  rateLimits: {
    requestsPerMinute: {
      type: Number,
      default: 100,
    },
    requestsPerHour: {
      type: Number,
      default: 1000,
    },
  },

  // Usage Tracking
  usageStats: {
    totalRequests: {
      type: Number,
      default: 0,
    },
    lastUsed: Date,
    lastIpAddress: String,
    lastUserAgent: String,
  },

  // Lifecycle
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: Date,
  revokedAt: Date,
  revokedReason: String,
});

// Indexes
apiKeySchema.index({ merchantId: 1, isActive: 1 });
apiKeySchema.index({ expiresAt: 1 });
apiKeySchema.index({ 'usageStats.lastUsed': -1 });

export const ApiKey = models.ApiKey || model('ApiKey', apiKeySchema);
```

### 5. Webhook Event Model

**File**: `models/webhook.ts`

```typescript
import { Schema, model, models } from 'mongoose';

const webhookSchema = new Schema({
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true,
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    index: true,
  },

  // Event Details
  eventType: {
    type: String,
    required: true,
    enum: [
      'payment.created',
      'payment.processing',
      'payment.completed',
      'payment.failed',
      'payment.expired',
      'payment.refunded',
      'merchant.updated',
    ],
  },
  eventData: {
    type: Schema.Types.Mixed,
    required: true,
  },

  // Delivery Details
  url: {
    type: String,
    required: true,
  },
  attempts: [
    {
      attemptNumber: Number,
      timestamp: Date,
      httpStatus: Number,
      responseBody: String,
      responseHeaders: Schema.Types.Mixed,
      error: String,
      duration: Number, // milliseconds
    },
  ],

  // Status
  status: {
    type: String,
    enum: ['pending', 'delivered', 'failed', 'expired'],
    default: 'pending',
    index: true,
  },
  nextAttemptAt: Date,
  maxAttempts: {
    type: Number,
    default: 3,
  },

  // Security
  signature: String,
  secretUsed: String,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  deliveredAt: Date,
  expiredAt: Date,
});

// Indexes
webhookSchema.index({ merchantId: 1, eventType: 1 });
webhookSchema.index({ status: 1, nextAttemptAt: 1 });
webhookSchema.index({ createdAt: -1 });

// TTL Index for old webhooks
webhookSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

export const Webhook = models.Webhook || model('Webhook', webhookSchema);
```

## Database Connection Implementation

**File**: `lib/database/mongodb.ts`

```typescript
import mongoose from 'mongoose';

interface MongoConnection {
  isConnected: boolean;
  client: typeof mongoose | null;
}

const connection: MongoConnection = {
  isConnected: false,
  client: null,
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (connection.isConnected && connection.client) {
    console.log('Using existing MongoDB connection');
    return connection.client;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Connection options
    const options = {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000'),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
      family: 4, // Use IPv4, skip trying IPv6
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    };

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const client = await mongoose.connect(mongoUri, options);

    // Set connection state
    connection.isConnected = true;
    connection.client = client;

    console.log('Connected to MongoDB successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      connection.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      connection.isConnected = false;
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    connection.isConnected = false;
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (!connection.isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    connection.isConnected = false;
    connection.client = null;
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
}

// Check connection status
export function isConnected(): boolean {
  return connection.isConnected;
}

// Get connection statistics
export function getConnectionStats() {
  if (!connection.isConnected) {
    return null;
  }

  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
}
```

## Database Migrations

**File**: `lib/database/migrations/001-initial-setup.ts`

```typescript
import { connectToDatabase } from '../mongodb';
import { Merchant } from '@/models/merchant';
import { Payment } from '@/models/payment';

export async function migration001InitialSetup() {
  console.log('Running migration: Initial Setup');

  await connectToDatabase();

  try {
    // Create indexes
    console.log('Creating indexes...');

    // Merchant indexes
    await Merchant.collection.createIndex({ email: 1 }, { unique: true });
    await Merchant.collection.createIndex({ stacksAddress: 1 });
    await Merchant.collection.createIndex({ isActive: 1 });

    // Payment indexes
    await Payment.collection.createIndex({ merchantId: 1, status: 1 });
    await Payment.collection.createIndex({ depositAddress: 1 }, { unique: true });
    await Payment.collection.createIndex({ bitcoinTxId: 1 }, { sparse: true });

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
```

## Database Utilities

**File**: `lib/database/utils.ts`

```typescript
import { connectToDatabase } from './mongodb';

// Health check function
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  latency: number;
  collections: string[];
}> {
  try {
    const start = Date.now();
    const db = await connectToDatabase();
    const latency = Date.now() - start;

    const collections = await db.connection.db.listCollections().toArray();

    return {
      connected: true,
      latency,
      collections: collections.map((c) => c.name),
    };
  } catch (error) {
    return {
      connected: false,
      latency: -1,
      collections: [],
    };
  }
}

// Database statistics
export async function getDatabaseStats() {
  try {
    const db = await connectToDatabase();
    const stats = await db.connection.db.stats();

    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      indexSize: stats.indexSize,
      documents: stats.objects,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return null;
  }
}

// Cleanup expired records
export async function cleanupExpiredRecords() {
  try {
    await connectToDatabase();

    // This is handled by TTL indexes, but we can add manual cleanup here
    console.log('Cleanup completed');
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
}
```

## Testing Setup

**File**: `scripts/setup-test-db.ts`

```typescript
import { connectToDatabase, disconnectFromDatabase } from '@/lib/database/mongodb';
import { Merchant } from '@/models/merchant';
import { merchantService } from '@/lib/services/merchant-service';

async function setupTestDatabase() {
  try {
    console.log('Setting up test database...');

    await connectToDatabase();

    // Clear existing data
    await Merchant.deleteMany({});
    console.log('Cleared existing merchants');

    // Create test merchant
    const testMerchant = await merchantService.createMerchant({
      name: 'Test Merchant',
      email: 'test@example.com',
      businessType: 'e-commerce',
      website: 'https://test.example.com',
      stacksAddress: 'ST000000000000000000002AMW42H',
      bitcoinAddress: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
    });

    console.log('Test merchant created:');
    console.log('ID:', testMerchant.id);
    console.log('API Key:', testMerchant.apiKey.apiKey);

    await disconnectFromDatabase();
    console.log('Database setup completed');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
}

setupTestDatabase();
```

This comprehensive database schema provides a solid foundation for the sBTC payment gateway with proper indexing, validation, and relationships to support high-volume payment processing.
