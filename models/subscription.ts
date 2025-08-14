import mongoose, { Schema, Document } from 'mongoose';

// Subscription Plan Schema
export interface ISubscriptionPlan extends Document {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  amount: number;
  currency: 'USD' | 'BTC' | 'STX' | 'sBTC';
  interval: 'day' | 'week' | 'month' | 'year';
  intervalCount: number;
  trialDays?: number;
  setupFee?: number;
  usageType: 'licensed' | 'metered';
  meteredComponents?: IMeteredComponent[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMeteredComponent {
  id: string;
  name: string;
  unitName: string;
  pricePerUnit: number;
  includedUnits: number;
  overage: 'block' | 'charge';
}

const MeteredComponentSchema = new Schema<IMeteredComponent>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  unitName: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  includedUnits: { type: Number, required: true, default: 0 },
  overage: { type: String, enum: ['block', 'charge'], default: 'charge' },
});

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>({
  id: { type: String, required: true, unique: true },
  merchantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['USD', 'BTC', 'STX', 'sBTC'], default: 'USD' },
  interval: { type: String, enum: ['day', 'week', 'month', 'year'], required: true },
  intervalCount: { type: Number, required: true, default: 1 },
  trialDays: { type: Number, default: 0 },
  setupFee: { type: Number, default: 0 },
  usageType: { type: String, enum: ['licensed', 'metered'], default: 'licensed' },
  meteredComponents: [MeteredComponentSchema],
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Subscription Schema
export interface ISubscription extends Document {
  id: string;
  merchantId: string;
  customerId: string;
  planId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | 'paused';
  paymentMethod: 'bitcoin' | 'stx' | 'sbtc';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  cancelAtPeriodEnd: boolean;
  lastPaymentDate?: Date;
  nextPaymentDate: Date;
  failedPaymentCount: number;
  totalAmount: number;
  metadata: any;
  webhookUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>({
  id: { type: String, required: true, unique: true },
  merchantId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  planId: { type: String, required: true, index: true },
  status: { 
    type: String, 
    enum: ['trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'],
    default: 'active'
  },
  paymentMethod: { type: String, enum: ['bitcoin', 'stx', 'sbtc'], required: true },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  trialStart: { type: Date },
  trialEnd: { type: Date },
  canceledAt: { type: Date },
  cancelAtPeriodEnd: { type: Boolean, default: false },
  lastPaymentDate: { type: Date },
  nextPaymentDate: { type: Date, required: true },
  failedPaymentCount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed, default: {} },
  webhookUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Usage Record Schema
export interface IUsageRecord extends Document {
  id: string;
  subscriptionId: string;
  componentId: string;
  quantity: number;
  timestamp: Date;
  idempotencyKey?: string;
  metadata?: any;
}

const UsageRecordSchema = new Schema<IUsageRecord>({
  id: { type: String, required: true, unique: true },
  subscriptionId: { type: String, required: true, index: true },
  componentId: { type: String, required: true, index: true },
  quantity: { type: Number, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  idempotencyKey: { type: String, unique: true, sparse: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

// Invoice Schema
export interface IInvoice extends Document {
  id: string;
  subscriptionId: string;
  merchantId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  paymentId?: string;
  dueDate: Date;
  paidDate?: Date;
  lineItems: IInvoiceLineItem[];
  discounts?: IInvoiceDiscount[];
  createdAt: Date;
}

export interface IInvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
  amount: number;
  type: 'subscription' | 'usage' | 'setup_fee' | 'discount';
  metadata?: any;
}

export interface IInvoiceDiscount {
  id: string;
  couponId: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

const InvoiceLineItemSchema = new Schema<IInvoiceLineItem>({
  id: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitAmount: { type: Number, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['subscription', 'usage', 'setup_fee', 'discount'], required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
});

const InvoiceDiscountSchema = new Schema<IInvoiceDiscount>({
  id: { type: String, required: true },
  couponId: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['fixed', 'percentage'], required: true },
});

const InvoiceSchema = new Schema<IInvoice>({
  id: { type: String, required: true, unique: true },
  subscriptionId: { type: String, required: true, index: true },
  merchantId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'open', 'paid', 'uncollectible', 'void'],
    default: 'open'
  },
  paymentId: { type: String },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  lineItems: [InvoiceLineItemSchema],
  discounts: [InvoiceDiscountSchema],
  createdAt: { type: Date, default: Date.now },
});

// Customer Schema for subscriptions
export interface ICustomer extends Document {
  id: string;
  merchantId: string;
  email: string;
  name?: string;
  phone?: string;
  address?: any;
  paymentMethods: ICustomerPaymentMethod[];
  defaultPaymentMethod?: string;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerPaymentMethod {
  id: string;
  type: 'bitcoin' | 'stx' | 'sbtc';
  walletAddress?: string;
  default: boolean;
  createdAt: Date;
}

const CustomerPaymentMethodSchema = new Schema<ICustomerPaymentMethod>({
  id: { type: String, required: true },
  type: { type: String, enum: ['bitcoin', 'stx', 'sbtc'], required: true },
  walletAddress: { type: String },
  default: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const CustomerSchema = new Schema<ICustomer>({
  id: { type: String, required: true, unique: true },
  merchantId: { type: String, required: true, index: true },
  email: { type: String, required: true },
  name: { type: String },
  phone: { type: String },
  address: { type: Schema.Types.Mixed },
  paymentMethods: [CustomerPaymentMethodSchema],
  defaultPaymentMethod: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
SubscriptionPlanSchema.index({ merchantId: 1, active: 1 });
SubscriptionSchema.index({ merchantId: 1, status: 1 });
SubscriptionSchema.index({ nextPaymentDate: 1 }); // For payment processing jobs
UsageRecordSchema.index({ subscriptionId: 1, timestamp: 1 });
InvoiceSchema.index({ merchantId: 1, status: 1 });
CustomerSchema.index({ merchantId: 1, email: 1 });

// Add middleware for updating timestamps
SubscriptionPlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

SubscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

CustomerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Export models
export const SubscriptionPlan = mongoose.models.SubscriptionPlan || mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);
export const Subscription = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
export const UsageRecord = mongoose.models.UsageRecord || mongoose.model<IUsageRecord>('UsageRecord', UsageRecordSchema);
export const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);