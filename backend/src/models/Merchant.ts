import { Schema, model, models, Document } from 'mongoose';

export interface IMerchant extends Document {
  name: string;
  email: string;
  businessType: string;
  website?: string;
  passwordHash?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  authMethod: 'email' | 'wallet';
  stacksAddress?: string;
  bitcoinAddress?: string;
  paymentPreferences: {
    acceptBitcoin: boolean;
    acceptSTX: boolean;
    acceptsBTC: boolean;
    preferredCurrency: 'sbtc' | 'usd' | 'usdt';
    autoConvertToUSD: boolean;
    usdConversionMethod: 'coinbase' | 'kraken' | 'binance' | 'manual';
  };
  walletSetup: {
    sBTCWallet: {
      address?: string;
      isConfigured: boolean;
    };
    usdWallet: {
      bankAccount?: string;
      exchangeAccount?: string;
      stablecoinAddress?: string;
      isConfigured: boolean;
    };
  };
  sbtcSettings: {
    autoConvert: boolean;
    minAmount: number;
    maxAmount: number;
    confirmationThreshold: number;
  };
  apiKeys: Array<{
    keyId: string;
    keyHash: string;
    keyPreview: string;
    permissions: string[];
    environment: 'test' | 'live';
    isActive: boolean;
    createdAt?: Date;
    lastUsed?: Date;
    expiresAt?: Date;
    ipRestrictions?: string[];
    rateLimit: number;
  }>;
  sessions: Array<{
    sessionId: string;
    tokenHash: string;
    createdAt?: Date;
    expiresAt?: Date;
    lastActivity?: Date;
    ipAddress?: string;
    userAgent?: string;
  }>;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorTempSecret?: string;
  twoFactorBackupCodes?: Array<{
    code: string;
    used: boolean;
    createdAt: Date;
    usedAt?: Date;
  }>;
  twoFactorRecoveryToken?: string;
  twoFactorRecoveryExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  lastLoginIP?: string;
  passwordResetAttempts?: number;
  passwordResetLockUntil?: Date;
  webhookUrl?: string;
  webhookSecret?: string;
  webhookEvents?: string[];
  isActive: boolean;
  isVerified: boolean;
  verificationLevel: 'none' | 'basic' | 'full';
  stats: {
    totalPayments: number;
    totalVolume: number;
    lastPaymentAt?: Date;
  };
}

const merchantSchema = new Schema<IMerchant>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false, // Allow empty email for wallet registrations
    default: '',
  },
  businessType: {
    type: String,
    required: true,
  },
  website: String,

  passwordHash: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Track how user registered/authenticated
  authMethod: {
    type: String,
    enum: ['email', 'wallet'],
    default: 'email',
  },

  stacksAddress: {
    type: String,
    required: false,
  },
  bitcoinAddress: String,
  
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
  
  walletSetup: {
    sBTCWallet: {
      address: String,
      isConfigured: {
        type: Boolean,
        default: false,
      },
    },
    usdWallet: {
      bankAccount: String,
      exchangeAccount: String,
      stablecoinAddress: String,
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
      default: 10000,
    },
    maxAmount: {
      type: Number,
      default: 100000000,
    },
    confirmationThreshold: {
      type: Number,
      default: 6,
    },
  },

  apiKeys: [
    {
      keyId: String,
      keyHash: String,
      keyPreview: String,
      permissions: [String],
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
      ipRestrictions: [String],
      rateLimit: {
        type: Number,
        default: 1000,
      },
      lastUsedAt: Date,
      requestCount: Number,
    },
  ],

  sessions: [
    {
      sessionId: String,
      tokenHash: String,
      createdAt: Date,
      expiresAt: Date,
      lastActivity: Date,
      ipAddress: String,
      userAgent: String,
      location: String,
      deviceFingerprint: String,
    },
  ],

  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: String,
  twoFactorTempSecret: String,
  twoFactorBackupCodes: [
    {
      code: String,
      used: {
        type: Boolean,
        default: false,
      },
      createdAt: Date,
      usedAt: Date,
    },
  ],
  twoFactorRecoveryToken: String,
  twoFactorRecoveryExpires: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: Date,
  lastLoginAt: Date,
  lastLoginIP: String,
  passwordResetAttempts: {
    type: Number,
    default: 0,
  },
  passwordResetLockUntil: Date,

  webhookUrl: String,
  webhookSecret: String,
  webhookEvents: [String],

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
}, {
  timestamps: true,
  collection: 'merchants'
});

merchantSchema.index({ email: 1 }, { unique: true });
merchantSchema.index({ stacksAddress: 1 });
merchantSchema.index({ isActive: 1 });
merchantSchema.index({ 'apiKeys.keyId': 1 });
merchantSchema.index({ 'sessions.sessionId': 1 });

export const Merchant = models?.Merchant || model<IMerchant>('Merchant', merchantSchema);