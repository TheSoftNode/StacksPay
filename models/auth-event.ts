import { Schema, model, models } from 'mongoose';

const authEventSchema = new Schema({
  merchantId: {
    type: Schema.Types.ObjectId,
    ref: 'Merchant',
    index: true,
  },
  eventType: {
    type: String,
    enum: [
      'login',
      'logout',
      'register',
      'api_key_used',
      'api_key_created',
      'api_key_revoked',
      'failed_login',
      'password_reset',
      'email_verification',
      'account_locked',
      'wallet_connected',
      'wallet_disconnected',
      'payment_authorized',
    ],
    required: true,
    index: true,
  },
  ipAddress: {
    type: String,
    index: true,
  },
  userAgent: String,
  success: {
    type: Boolean,
    required: true,
    index: true,
  },
  metadata: Schema.Types.Mixed, // Additional event data
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound indexes for efficient queries
authEventSchema.index({ merchantId: 1, eventType: 1, createdAt: -1 });
authEventSchema.index({ merchantId: 1, success: 1, createdAt: -1 });
authEventSchema.index({ ipAddress: 1, success: 1, createdAt: -1 });

export const AuthEvent = models?.AuthEvent || model('AuthEvent', authEventSchema);
