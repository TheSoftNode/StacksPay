interface ConversionRate {
  from: string;
  to: string;
  rate: number;
  timestamp: Date;
  source: string;
}

interface ConversionResult {
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
  minAmount: number;
  maxAmount: number;
}

interface ConversionExecution {
  success: boolean;
  transactionId: string;
  fromTxId?: string;
  toTxId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedCompletion: Date;
  circleTradeId?: string;
  coinbaseChargeId?: string;
  provider: 'circle' | 'coinbase' | 'internal';
  error?: string;
}
