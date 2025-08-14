import { connectToDatabase } from '@/lib/database/mongodb';

// Circle API Service for production-ready crypto-fiat conversions
export interface CircleApiConfig {
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

export interface CircleExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: string;
}

export interface CircleFxTrade {
  id: string;
  status: 'pending' | 'complete' | 'failed';
  sourceAmount: string;
  sourceCurrency: string;
  targetAmount: string;
  targetCurrency: string;
  exchangeRate: number;
  fee: string;
  createdAt: string;
  settledAt?: string;
}

export interface CirclePayout {
  id: string;
  status: 'pending' | 'complete' | 'failed';
  amount: string;
  currency: string;
  destination: any;
  fees: string;
  trackingRef?: string;
  createdAt: string;
}

export interface CircleWalletBalance {
  currency: string;
  amount: string;
}

/**
 * Circle API Service for USDC/USD conversions and crypto settlements
 * Handles all Circle API interactions for the payment gateway
 */
export class CircleApiService {
  private config: CircleApiConfig;
  private headers: Record<string, string>;

  constructor() {
    this.config = {
      apiKey: process.env.CIRCLE_API_KEY || '',
      baseUrl: process.env.CIRCLE_API_URL || 'https://api-sandbox.circle.com',
      environment: (process.env.CIRCLE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
    };

    this.headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (!this.config.apiKey) {
      console.warn('Circle API key not configured - some features will be unavailable');
    }
  }

  /**
   * Get current exchange rates from Circle
   */
  async getExchangeRates(sourceCurrency: string, targetCurrency: string): Promise<CircleExchangeRate | null> {
    try {
      const response = await this.makeRequest('GET', '/v1/exchange/quotes', {
        from: sourceCurrency.toUpperCase(),
        to: targetCurrency.toUpperCase(),
      });

      if (response && response.data) {
        return {
          from: sourceCurrency.toUpperCase(),
          to: targetCurrency.toUpperCase(),
          rate: parseFloat(response.data.exchangeRate),
          timestamp: response.data.validUntil || new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching Circle exchange rates:', error);
      return null;
    }
  }

  /**
   * Create FX trade (currency conversion) via Circle
   */
  async createFxTrade(
    sourceAmount: string,
    sourceCurrency: string,
    targetCurrency: string,
    idempotencyKey?: string
  ): Promise<CircleFxTrade | null> {
    try {
      const headers = { ...this.headers };
      if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
      }

      const response = await this.makeRequest('POST', '/v1/exchange/trades', {
        sourceAmount,
        sourceCurrency: sourceCurrency.toUpperCase(),
        targetCurrency: targetCurrency.toUpperCase(),
      }, headers);

      if (response && response.data) {
        return {
          id: response.data.id,
          status: response.data.status,
          sourceAmount: response.data.sourceAmount,
          sourceCurrency: response.data.sourceCurrency,
          targetAmount: response.data.targetAmount,
          targetCurrency: response.data.targetCurrency,
          exchangeRate: parseFloat(response.data.exchangeRate),
          fee: response.data.fee || '0',
          createdAt: response.data.createDate,
          settledAt: response.data.settleDate,
        };
      }

      return null;
    } catch (error) {
      console.error('Error creating Circle FX trade:', error);
      throw new Error(`Circle FX trade failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get FX trade status and details
   */
  async getFxTrade(tradeId: string): Promise<CircleFxTrade | null> {
    try {
      const response = await this.makeRequest('GET', `/v1/exchange/trades/${tradeId}`);

      if (response && response.data) {
        return {
          id: response.data.id,
          status: response.data.status,
          sourceAmount: response.data.sourceAmount,
          sourceCurrency: response.data.sourceCurrency,
          targetAmount: response.data.targetAmount,
          targetCurrency: response.data.targetCurrency,
          exchangeRate: parseFloat(response.data.exchangeRate),
          fee: response.data.fee || '0',
          createdAt: response.data.createDate,
          settledAt: response.data.settleDate,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching Circle FX trade:', error);
      return null;
    }
  }

  /**
   * Create payout to bank account or external wallet
   */
  async createPayout(
    amount: string,
    currency: string,
    destination: any,
    metadata?: any
  ): Promise<CirclePayout | null> {
    try {
      const idempotencyKey = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await this.makeRequest('POST', '/v1/payouts', {
        amount: {
          amount,
          currency: currency.toUpperCase(),
        },
        destination,
        metadata: metadata || {},
      }, {
        ...this.headers,
        'X-Idempotency-Key': idempotencyKey,
      });

      if (response && response.data) {
        return {
          id: response.data.id,
          status: response.data.status,
          amount: response.data.amount.amount,
          currency: response.data.amount.currency,
          destination: response.data.destination,
          fees: response.data.fees?.amount || '0',
          trackingRef: response.data.trackingRef,
          createdAt: response.data.createDate,
        };
      }

      return null;
    } catch (error) {
      console.error('Error creating Circle payout:', error);
      throw new Error(`Circle payout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get payout status and details
   */
  async getPayout(payoutId: string): Promise<CirclePayout | null> {
    try {
      const response = await this.makeRequest('GET', `/v1/payouts/${payoutId}`);

      if (response && response.data) {
        return {
          id: response.data.id,
          status: response.data.status,
          amount: response.data.amount.amount,
          currency: response.data.amount.currency,
          destination: response.data.destination,
          fees: response.data.fees?.amount || '0',
          trackingRef: response.data.trackingRef,
          createdAt: response.data.createDate,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching Circle payout:', error);
      return null;
    }
  }

  /**
   * Get Circle wallet balances
   */
  async getWalletBalances(): Promise<CircleWalletBalance[]> {
    try {
      const response = await this.makeRequest('GET', '/v1/wallets');

      if (response && response.data && Array.isArray(response.data)) {
        return response.data.flatMap((wallet: any) => 
          wallet.balances?.map((balance: any) => ({
            currency: balance.currency,
            amount: balance.amount,
          })) || []
        );
      }

      return [];
    } catch (error) {
      console.error('Error fetching Circle wallet balances:', error);
      return [];
    }
  }

  /**
   * Create USDC address for receiving payments
   */
  async createUsdcAddress(idempotencyKey?: string): Promise<{
    address: string;
    currency: string;
    chain: string;
  } | null> {
    try {
      const headers = { ...this.headers };
      if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
      }

      const response = await this.makeRequest('POST', '/v1/wallets/addresses/deposit', {
        currency: 'USDC',
        chain: 'ETH', // or other supported chains
      }, headers);

      if (response && response.data) {
        return {
          address: response.data.address,
          currency: response.data.currency,
          chain: response.data.chain,
        };
      }

      return null;
    } catch (error) {
      console.error('Error creating Circle USDC address:', error);
      return null;
    }
  }

  /**
   * Get supported currencies and chains
   */
  async getSupportedCurrencies(): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', '/v1/configuration');

      if (response && response.data && response.data.payments) {
        return response.data.payments.masterWalletId ? [] : [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching Circle supported currencies:', error);
      return [];
    }
  }

  /**
   * Execute complete crypto-to-fiat conversion flow
   */
  async executeCryptoToFiatConversion(
    fromAmount: string,
    fromCurrency: string,
    toCurrency: string,
    bankDestination?: any
  ): Promise<{
    success: boolean;
    fxTrade?: CircleFxTrade;
    payout?: CirclePayout;
    error?: string;
  }> {
    try {
      // Step 1: Convert crypto to USDC (if not already USDC)
      let fxTrade: CircleFxTrade | null = null;
      let convertedAmount = fromAmount;

      if (fromCurrency.toUpperCase() !== 'USDC') {
        fxTrade = await this.createFxTrade(fromAmount, fromCurrency, 'USDC');
        if (!fxTrade) {
          return { success: false, error: 'Failed to convert to USDC' };
        }
        convertedAmount = fxTrade.targetAmount;
      }

      // Step 2: If target is USD and bank destination provided, create payout
      let payout: CirclePayout | null = null;
      if (toCurrency.toUpperCase() === 'USD' && bankDestination) {
        payout = await this.createPayout(convertedAmount, 'USD', bankDestination);
        if (!payout) {
          return { success: false, error: 'Failed to create payout' };
        }
      }

      return {
        success: true,
        fxTrade: fxTrade || undefined,
        payout: payout || undefined,
      };
    } catch (error) {
      console.error('Error in crypto-to-fiat conversion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Conversion failed',
      };
    }
  }

  /**
   * Make authenticated request to Circle API
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = customHeaders || this.headers;

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    } else if (data && method === 'GET') {
      // Add query parameters for GET requests
      const queryParams = new URLSearchParams(data).toString();
      return this.makeRequest(method, `${endpoint}?${queryParams}`, undefined, customHeaders);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Circle API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check for Circle API
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    status: string;
    lastChecked: Date;
  }> {
    try {
      // Try to fetch configuration as a health check
      await this.makeRequest('GET', '/v1/configuration');
      
      return {
        isHealthy: true,
        status: 'Circle API is operational',
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        isHealthy: false,
        status: `Circle API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        lastChecked: new Date(),
      };
    }
  }
}

// Create singleton instance
export const circleApiService = new CircleApiService();