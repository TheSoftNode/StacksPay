import { Schema, model, models, Document } from 'mongoose';

export interface IPayment extends Document {
  merchantId: Schema.Types.ObjectId;
  amount: number;
  originalAmount?: number;
  currency: 'BTC' | 'STX' | 'sBTC' | 'USD' | 'USDT';
  merchantReceivesCurrency: 'sbtc' | 'usd' | 'usdt';
  paymentMethod: 'bitcoin' | 'stx' | 'sbtc';
  customerWalletType: 'stacks' | 'bitcoin';
  customerWalletAddress?: string;
  exchangeRate?: {
    btcToUsd?: number;
    stxToUsd?: number;
    sbtcToUsd?: number;
    timestamp?: Date;
  };
  conversionFee?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'expired' | 'converting';
  bitcoin?: {
    depositAddress?: string;
    txId?: string;
    confirmations?: number;
    fee?: number;
  };
  stx?: {
    fromAddress?: string;
    toAddress?: string;
    txId?: string;
    contractCall?: string;
    fee?: number;
  };
  sbtc?: {
    depositAddress?: string;
    withdrawalAddress?: string;
    txId?: string;
    conversionTxId?: string;
    receivedAmount?: number;
    fee?: number;
  };
  fiatConversion?: {
    targetCurrency?: string;
    convertedAmount?: number;
    exchangeUsed?: string;
    conversionTxId?: string;
    bankAccount?: string;
    stablecoinAddress?: string;
  };
  transactionId?: string;
  confirmations: number;
  requiredConfirmations: number;
  networkFee?: number;
  customerInfo?: {
    email?: string;
    name?: string;
    ipAddress?: string;
  };
  metadata?: any;
  expiresAt: Date;
  completedAt?: Date;
}

const paymentSchema = new Schema<IPayment>({
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  },
  
  amount: {
    type: Number,
    required: true,
  },
  originalAmount: Number,
  currency: {
    type: String,
    enum: ['BTC', 'STX', 'sBTC', 'USD', 'USDT'],
    default: 'sBTC',
  },
  merchantReceivesCurrency: {
    type: String,
    enum: ['sbtc', 'usd', 'usdt'],
    default: 'sbtc',
  },
  
  paymentMethod: {
    type: String,
    enum: ['bitcoin', 'stx', 'sbtc'],
    required: true,
  },
  customerWalletType: {
    type: String,
    enum: ['stacks', 'bitcoin'],
    required: true,
  },
  customerWalletAddress: String,
  
  exchangeRate: {
    btcToUsd: Number,
    stxToUsd: Number,
    sbtcToUsd: Number,
    timestamp: Date,
  },
  conversionFee: Number,
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'expired', 'converting'],
    default: 'pending',
  },
  
  bitcoin: {
    depositAddress: String,
    txId: String,
    confirmations: Number,
    fee: Number,
  },
  
  stx: {
    fromAddress: String,
    toAddress: String,
    txId: String,
    contractCall: String,
    fee: Number,
  },
  
  sbtc: {
    depositAddress: String,
    withdrawalAddress: String,
    txId: String,
    conversionTxId: String,
    receivedAmount: Number,
    fee: Number,
  },
  
  fiatConversion: {
    targetCurrency: String,
    convertedAmount: Number,
    exchangeUsed: String,
    conversionTxId: String,
    bankAccount: String,
    stablecoinAddress: String,
  },
  
  transactionId: String,
  confirmations: {
    type: Number,
    default: 0,
  },
  requiredConfirmations: {
    type: Number,
    default: 6,
  },
  networkFee: Number,
  
  customerInfo: {
    email: String,
    name: String,
    ipAddress: String,
  },
  metadata: Schema.Types.Mixed,
  
  expiresAt: {
    type: Date,
    required: true,
  },
  completedAt: Date,
}, {
  timestamps: true,
  collection: 'payments'
});

paymentSchema.index({ merchantId: 1, status: 1 });
paymentSchema.index({ 'bitcoin.depositAddress': 1 });
paymentSchema.index({ 'bitcoin.txId': 1 });
paymentSchema.index({ 'stx.txId': 1 });
paymentSchema.index({ 'sbtc.txId': 1 });
paymentSchema.index({ customerWalletAddress: 1 });
paymentSchema.index({ expiresAt: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = models?.Payment || model<IPayment>('Payment', paymentSchema);