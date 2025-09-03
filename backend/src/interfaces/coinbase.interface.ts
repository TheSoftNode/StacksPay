export interface CoinbaseCommerceConfig {
  apiKey: string;
  webhookSecret: string;
  baseUrl: string;
  apiVersion: string;
}

export interface CoinbaseCharge {
  id: string;
  code: string;
  name: string;
  description: string;
  pricing: {
    local: { amount: string; currency: string };
    bitcoin?: { amount: string; currency: string };
    ethereum?: { amount: string; currency: string };
    settlement?: { amount: string; currency: string };
  };
  payments: any[];
  timeline: Array<{
    time: string;
    status: string;
    context?: string;
  }>;
  metadata: any;
  created_at: string;
  expires_at: string;
  confirmed_at?: string;
  checkout?: {
    id: string;
  };
  addresses: {
    bitcoin?: string;
    ethereum?: string;
    litecoin?: string;
    bitcoincash?: string;
    dogecoin?: string;
    usdc?: string;
  };
  hosted_url: string;
  status: 'NEW' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'UNRESOLVED' | 'RESOLVED' | 'CANCELED';
}

export interface CoinbaseCheckout {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  requested_info: string[];
  pricing_type: 'fixed_price' | 'no_price';
  local_price?: {
    amount: string;
    currency: string;
  };
}

export interface CoinbaseWebhookEvent {
  id: string;
  scheduled_for: string;
  attempt_number: number;
  event: {
    id: string;
    resource: string;
    type: string;
    api_version: string;
    created_at: string;
    data: CoinbaseCharge;
  };
}
