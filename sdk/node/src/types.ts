// Types for the sBTC Gateway SDK
export interface PaymentRequest {
  amount: number; // Amount in satoshis
  currency: 'sbtc' | 'btc' | 'stx';
  description: string;
  customer?: {
    email?: string;
    name?: string;
    id?: string;
  };
  metadata?: Record<string, any>;
  webhook_url?: string;
  redirect_url?: string;
  expires_in?: number; // Seconds until payment expires
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'completed' | 'failed' | 'expired';
  description: string;
  payment_url: string;
  qr_code: string;
  wallet_addresses: {
    bitcoin?: string;
    stacks?: string;
  };
  customer?: {
    email?: string;
    name?: string;
    wallet_address?: string;
  };
  confirmations?: number;
  transaction_hash?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
  timeline?: PaymentEvent[];
}

export interface PaymentEvent {
  status: string;
  timestamp: string;
  transaction_hash?: string;
  confirmations?: number;
}

export interface PaymentListResponse {
  success: boolean;
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface PaymentResponse {
  success: boolean;
  payment: Payment;
}

export interface WebhookEvent {
  id: string;
  type: 'payment.created' | 'payment.paid' | 'payment.completed' | 'payment.failed' | 'payment.expired';
  created: number;
  data: {
    payment: Payment;
  };
  livemode: boolean;
}

export interface SDKOptions {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  retries?: number;
}

export interface APIError {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export interface Merchant {
  id: string;
  name: string;
  email: string;
  businessName?: string;
  businessType?: string;
  stacksAddress?: string;
  bitcoinAddress?: string;
  emailVerified: boolean;
  verificationLevel: string;
  createdAt: string;
}

export interface MerchantResponse {
  success: boolean;
  merchant: Merchant;
}
