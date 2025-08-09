import { Schema, model, models } from 'mongoose';

const transactionSchema = new Schema({
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'refund'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  fees: {
    type: Number,
    default: 0,
  },
  bitcoinTxId: String,
  stacksTxId: String,
  blockHeight: Number,
  confirmations: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Transaction = models.Transaction || model('Transaction', transactionSchema);
