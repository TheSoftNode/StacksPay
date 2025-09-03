export interface PaymentCreateRequest {
  amount: number;
  currency: 'BTC' | 'STX' | 'sBTC' | 'USD' | 'USDT';
  merchantReceivesCurrency?: 'sbtc' | 'usd' | 'usdt';
  paymentMethod: 'bitcoin' | 'stx' | 'sbtc';
  customerWalletType: 'stacks' | 'bitcoin';
  customerInfo?: {
    email?: string;
    name?: string;
    ipAddress?: string;
  };
  metadata?: any;
  webhookUrl?: string;
  expirationMinutes?: number;
}

export interface PaymentResponse {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  depositAddress?: string;
  qrCode?: string;
  expiresAt: Date;
  estimatedConfirmationTime: string;
  networkFee: number;
  conversionFee?: number;
  exchangeRate?: {
    rate: number;
    source: string;
    timestamp: Date;
  };
  instructions: {
    walletConnect?: boolean;
    copyAddress?: string;
    qrCode?: string;
    amountToPay: number;
    currency: string;
    networkFee: number;
  };
}

export interface PaymentUpdateRequest {
  status?: 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  confirmations?: number;
  customerWalletAddress?: string;
  metadata?: any;
}

export interface PaymentListQuery {
  status?: string;
  currency?: string;
  paymentMethod?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ConversionRequest {
  fromAmount: number;
  fromCurrency: string;
  toCurrency: string;
  slippageTolerance?: number;
  preferredProvider?: 'circle' | 'coinbase' | 'internal';
}

export interface ConversionResponse {
  success: boolean;
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  rate: number;
  fees: {
    conversion: number;
    network: number;
    total: number;
  };
  estimatedTime: string;
  provider: string;
}

export interface WebhookPayload {
  type: 'payment.created' | 'payment.completed' | 'payment.failed' | 'payment.expired';
  id: string;
  merchantId: string;
  data: any;
  timestamp: Date;
}