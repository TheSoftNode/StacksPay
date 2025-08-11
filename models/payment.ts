import { Schema, model, models } from 'mongoose';

const paymentSchema = new Schema({
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  },
  
  // Payment amounts and currencies
  amount: {
    type: Number,
    required: true, // Amount in smallest unit (satoshis, microSTX, etc.)
  },
  originalAmount: {
    type: Number, // Original amount in customer's chosen currency
  },
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
  
  // Payment method and wallet info
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
  
  // Exchange rate and conversion
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
  
  // Bitcoin-specific fields
  bitcoin: {
    depositAddress: String,
    txId: String,
    confirmations: Number,
    fee: Number,
  },
  
  // STX-specific fields
  stx: {
    fromAddress: String,
    toAddress: String,
    txId: String,
    contractCall: String,
    fee: Number,
  },
  
  // sBTC conversion fields
  sbtc: {
    depositAddress: String,
    withdrawalAddress: String, // Merchant's sBTC address
    txId: String,
    conversionTxId: String,
    receivedAmount: Number,
    fee: Number,
  },
  
  // USD/USDT conversion (if merchant wants fiat)
  fiatConversion: {
    targetCurrency: String, // 'USD' or 'USDT'
    convertedAmount: Number,
    exchangeUsed: String, // 'coinbase', 'kraken', etc.
    conversionTxId: String,
    bankAccount: String,
    stablecoinAddress: String,
  },
  
  // Transaction details
  transactionId: String, // Legacy field for compatibility
  confirmations: {
    type: Number,
    default: 0,
  },
  requiredConfirmations: {
    type: Number,
    default: 6,
  },
  networkFee: Number,
  
  // Customer and metadata
  customerInfo: {
    email: String,
    name: String,
    ipAddress: String,
  },
  metadata: Schema.Types.Mixed,
  
  // Timing
  expiresAt: {
    type: Date,
    required: true,
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
paymentSchema.index({ merchantId: 1, status: 1 });
paymentSchema.index({ 'bitcoin.depositAddress': 1 });
paymentSchema.index({ 'bitcoin.txId': 1 });
paymentSchema.index({ 'stx.txId': 1 });
paymentSchema.index({ 'sbtc.txId': 1 });
paymentSchema.index({ customerWalletAddress: 1 });
paymentSchema.index({ expiresAt: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export const Payment = models.Payment || model('Payment', paymentSchema);
