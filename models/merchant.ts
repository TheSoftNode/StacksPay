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

  // Authentication
  passwordHash: String, // For dashboard login
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // sBTC configuration (can be added later)
  stacksAddress: {
    type: String,
    required: false, // Allow registration without Stacks wallet
  },
  bitcoinAddress: String,
  
  // Payment preferences
  paymentPreferences: {
    acceptBitcoin: {
      type: Boolean,
      default: true,
    },
    acceptSTX: {
      type: Boolean,
      default: true,
    },
    acceptsBTC: {
      type: Boolean,
      default: true,
    },
    preferredCurrency: {
      type: String,
      enum: ['sbtc', 'usd', 'usdt'],
      default: 'sbtc',
    },
    autoConvertToUSD: {
      type: Boolean,
      default: false,
    },
    usdConversionMethod: {
      type: String,
      enum: ['coinbase', 'kraken', 'binance', 'manual'],
      default: 'coinbase',
    },
  },
  
  // Wallet configuration for receiving payments
  walletSetup: {
    sBTCWallet: {
      address: String, // Where to receive sBTC
      isConfigured: {
        type: Boolean,
        default: false,
      },
    },
    usdWallet: {
      bankAccount: String,
      exchangeAccount: String,
      stablecoinAddress: String, // USDT/USDC address
      isConfigured: {
        type: Boolean,
        default: false,
      },
    },
  },
  
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

  // API configuration (enhanced for authentication)
  apiKeys: [
    {
      keyId: String,
      keyHash: String, // bcrypt hash of actual key
      keyPreview: String, // "sk_test_abc...xyz" for display
      permissions: [String], // ['read', 'write', 'webhooks']
      environment: {
        type: String,
        enum: ['test', 'live'],
        default: 'test',
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      createdAt: Date,
      lastUsed: Date,
      expiresAt: Date,
      ipRestrictions: [String], // Optional IP whitelist
      rateLimit: {
        type: Number,
        default: 1000, // requests per hour
      },
    },
  ],

  // Session Management
  sessions: [
    {
      sessionId: String,
      tokenHash: String,
      createdAt: Date,
      expiresAt: Date,
      lastActivity: Date,
      ipAddress: String,
      userAgent: String,
    },
  ],

  // Security
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: String,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,

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
merchantSchema.index({ 'apiKeys.keyId': 1 });
merchantSchema.index({ 'sessions.sessionId': 1 });

export const Merchant = models.Merchant || model('Merchant', merchantSchema);
