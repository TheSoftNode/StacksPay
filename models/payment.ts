import { Schema, model, models } from 'mongoose';

const paymentSchema = new Schema({
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'BTC',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  bitcoinAddress: String,
  transactionId: String,
  confirmations: {
    type: Number,
    default: 0,
  },
  metadata: Schema.Types.Mixed,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Payment = models.Payment || model('Payment', paymentSchema);
