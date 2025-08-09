import { Schema, model, models } from 'mongoose';

const merchantSchema = new Schema({
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
  apiKeys: [{
    keyId: String,
    keyHash: String,
    permissions: [String],
    createdAt: Date,
    lastUsed: Date,
  }],
  webhookUrl: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Merchant = models.Merchant || model('Merchant', merchantSchema);
