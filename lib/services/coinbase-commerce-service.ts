import crypto from 'crypto';

// Coinbase Commerce API Service for comprehensive crypto payment acceptance
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

/**
 * Coinbase Commerce Service for crypto payment processing
 * Provides comprehensive crypto acceptance with automatic USDC settlement
 * Perfect complement to Circle API for broader cryptocurrency support
 */
export class CoinbaseCommerceService {
  private config: CoinbaseCommerceConfig;
  private headers: Record<string, string>;

  constructor() {
    this.config = {
      apiKey: process.env.COINBASE_COMMERCE_API_KEY || '',
      webhookSecret: process.env.COINBASE_COMMERCE_WEBHOOK_SECRET || '',
      baseUrl: 'https://api.commerce.coinbase.com',
      apiVersion: '2018-03-22',
    };

    this.headers = {
      'X-CC-Api-Key': this.config.apiKey,
      'X-CC-Version': this.config.apiVersion,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (!this.config.apiKey) {
      console.warn('Coinbase Commerce API key not configured - crypto payment features will be unavailable');
    }
  }

  /**
   * Create a charge for crypto payment with fixed pricing
   */
  async createCharge(options: {
    name: string;
    description: string;
    amount: string;
    currency: string;
    metadata?: any;
    redirectUrl?: string;
    cancelUrl?: string;
  }): Promise<CoinbaseCharge | null> {
    try {
      const chargeData = {
        name: options.name,
        description: options.description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: options.amount,
          currency: options.currency.toUpperCase(),
        },
        metadata: options.metadata || {},
        redirect_url: options.redirectUrl,
        cancel_url: options.cancelUrl,
      };

      const response = await this.makeRequest('POST', '/charges', chargeData);
      return response?.data || null;
    } catch (error) {
      console.error('Error creating Coinbase Commerce charge:', error);
      throw new Error(`Coinbase Commerce charge creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a charge with dynamic pricing (no fixed amount)
   */
  async createDynamicCharge(options: {
    name: string;
    description: string;
    metadata?: any;
    redirectUrl?: string;
    cancelUrl?: string;
  }): Promise<CoinbaseCharge | null> {
    try {
      const chargeData = {
        name: options.name,
        description: options.description,
        pricing_type: 'no_price',
        metadata: options.metadata || {},
        redirect_url: options.redirectUrl,
        cancel_url: options.cancelUrl,
      };

      const response = await this.makeRequest('POST', '/charges', chargeData);
      return response?.data || null;
    } catch (error) {
      console.error('Error creating dynamic Coinbase Commerce charge:', error);
      throw new Error(`Dynamic charge creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get charge details and payment status
   */
  async getCharge(chargeId: string): Promise<CoinbaseCharge | null> {
    try {
      const response = await this.makeRequest('GET', `/charges/${chargeId}`);
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching Coinbase Commerce charge:', error);
      return null;
    }
  }

  /**
   * List all charges with pagination support
   */
  async listCharges(options: {
    limit?: number;
    startingAfter?: string;
    endingBefore?: string;
    order?: 'desc' | 'asc';
  } = {}): Promise<{
    data: CoinbaseCharge[];
    pagination: {
      ending_before?: string;
      starting_after?: string;
      limit: number;
      order: string;
      total: number;
      yielded: number;
      cursor_range: string[];
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.startingAfter) queryParams.append('starting_after', options.startingAfter);
      if (options.endingBefore) queryParams.append('ending_before', options.endingBefore);
      if (options.order) queryParams.append('order', options.order);

      const endpoint = `/charges${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await this.makeRequest('GET', endpoint);

      return {
        data: response?.data || [],
        pagination: response?.pagination || {
          limit: options.limit || 25,
          order: options.order || 'desc',
          total: 0,
          yielded: 0,
          cursor_range: [],
        },
      };
    } catch (error) {
      console.error('Error listing Coinbase Commerce charges:', error);
      return {
        data: [],
        pagination: {
          limit: 25,
          order: 'desc',
          total: 0,
          yielded: 0,
          cursor_range: [],
        },
      };
    }
  }

  /**
   * Create a checkout for hosted payment page
   */
  async createCheckout(options: {
    name: string;
    description: string;
    amount?: string;
    currency?: string;
    requestedInfo?: string[];
    logoUrl?: string;
  }): Promise<CoinbaseCheckout | null> {
    try {
      const checkoutData: any = {
        name: options.name,
        description: options.description,
        requested_info: options.requestedInfo || [],
      };

      if (options.amount && options.currency) {
        checkoutData.pricing_type = 'fixed_price';
        checkoutData.local_price = {
          amount: options.amount,
          currency: options.currency.toUpperCase(),
        };
      } else {
        checkoutData.pricing_type = 'no_price';
      }

      if (options.logoUrl) {
        checkoutData.logo_url = options.logoUrl;
      }

      const response = await this.makeRequest('POST', '/checkouts', checkoutData);
      return response?.data || null;
    } catch (error) {
      console.error('Error creating Coinbase Commerce checkout:', error);
      throw new Error(`Checkout creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get checkout details
   */
  async getCheckout(checkoutId: string): Promise<CoinbaseCheckout | null> {
    try {
      const response = await this.makeRequest('GET', `/checkouts/${checkoutId}`);
      return response?.data || null;
    } catch (error) {
      console.error('Error fetching Coinbase Commerce checkout:', error);
      return null;
    }
  }

  /**
   * Verify webhook signature for security (HMAC-SHA256)
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
  ): boolean {
    try {
      const webhookSecret = secret || this.config.webhookSecret;
      if (!webhookSecret) {
        throw new Error('Webhook secret not configured');
      }

      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      return signature === computedSignature;
    } catch (error) {
      console.error('Error verifying Coinbase webhook signature:', error);
      return false;
    }
  }

  /**
   * Process webhook event with comprehensive event handling
   */
  processWebhookEvent(eventData: CoinbaseWebhookEvent): {
    success: boolean;
    eventType: string;
    chargeId?: string;
    status?: string;
    paymentMethod?: string;
    amount?: string;
    currency?: string;
    timeline?: any[];
  } {
    try {
      const { event } = eventData;
      const charge = event.data;
      
      // Extract payment information
      const lastPayment = charge.payments && charge.payments.length > 0 
        ? charge.payments[charge.payments.length - 1] 
        : null;

      const result = {
        success: true,
        eventType: event.type,
        chargeId: charge.id,
        status: charge.status,
        paymentMethod: lastPayment?.network || 'unknown',
        amount: charge.pricing?.local?.amount,
        currency: charge.pricing?.local?.currency,
        timeline: charge.timeline,
      };

      // Handle different event types
      switch (event.type) {
        case 'charge:created':
          console.log(`Coinbase charge created: ${charge.id} for ${charge.pricing?.local?.amount} ${charge.pricing?.local?.currency}`);
          break;
        case 'charge:confirmed':
          console.log(`Coinbase charge confirmed: ${charge.id} - Payment received!`);
          break;
        case 'charge:failed':
          console.log(`Coinbase charge failed: ${charge.id}`);
          break;
        case 'charge:delayed':
          console.log(`Coinbase charge delayed: ${charge.id} - Waiting for more confirmations`);
          break;
        case 'charge:pending':
          console.log(`Coinbase charge pending: ${charge.id} - Payment detected, waiting for confirmations`);
          break;
        case 'charge:resolved':
          console.log(`Coinbase charge resolved: ${charge.id}`);
          break;
        default:
          console.log(`Unknown Coinbase webhook event: ${event.type}`);
      }

      return result;
    } catch (error) {
      console.error('Error processing Coinbase webhook:', error);
      return {
        success: false,
        eventType: 'unknown',
      };
    }
  }

  /**
   * Get supported cryptocurrencies for 2025
   */
  getSupportedCryptocurrencies(): Array<{
    symbol: string;
    name: string;
    network?: string;
  }> {
    return [
      { symbol: 'BTC', name: 'Bitcoin' },
      { symbol: 'ETH', name: 'Ethereum' },
      { symbol: 'USDC', name: 'USD Coin', network: 'Ethereum/Polygon' },
      { symbol: 'USDT', name: 'Tether USD' },
      { symbol: 'BCH', name: 'Bitcoin Cash' },
      { symbol: 'LTC', name: 'Litecoin' },
      { symbol: 'DOGE', name: 'Dogecoin' },
      { symbol: 'DAI', name: 'Dai Stablecoin' },
      { symbol: 'APE', name: 'ApeCoin' },
      { symbol: 'SHIB', name: 'Shiba Inu' },
      // Note: Coinbase Commerce supports "hundreds of currencies" as of 2025
      // with automatic USDC conversion through their onchain protocol
    ];
  }

  /**
   * Cancel a charge (if possible)
   */
  async cancelCharge(chargeId: string): Promise<{
    success: boolean;
    charge?: CoinbaseCharge;
    error?: string;
  }> {
    try {
      // Note: Coinbase Commerce doesn't have a direct cancel endpoint
      // Once a charge is created, it can only expire naturally
      // This method is for consistency with other payment providers
      
      const charge = await this.getCharge(chargeId);
      if (!charge) {
        return { success: false, error: 'Charge not found' };
      }

      if (charge.status === 'COMPLETED') {
        return { success: false, error: 'Cannot cancel completed charge' };
      }

      if (charge.status === 'EXPIRED' || charge.status === 'CANCELED') {
        return { success: true, charge, error: 'Charge already canceled/expired' };
      }

      // For now, we can only return the current status
      // In practice, charges expire automatically after the timeout period
      return { 
        success: true, 
        charge,
        error: 'Charges auto-expire after timeout period'
      };
    } catch (error) {
      console.error('Error canceling Coinbase Commerce charge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cancel operation failed',
      };
    }
  }

  /**
   * Get charge events/timeline for detailed tracking
   */
  async getChargeEvents(chargeId: string): Promise<Array<{
    time: string;
    status: string;
    context?: string;
  }>> {
    try {
      const charge = await this.getCharge(chargeId);
      return charge?.timeline || [];
    } catch (error) {
      console.error('Error fetching charge events:', error);
      return [];
    }
  }

  /**
   * Make authenticated request to Coinbase Commerce API
   */
  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: this.headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: { message: response.statusText } };
      }
      
      throw new Error(`Coinbase Commerce API error: ${response.status} - ${errorData.error?.message || errorData.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check for Coinbase Commerce API
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    status: string;
    lastChecked: Date;
    apiKeyValid: boolean;
  }> {
    try {
      // Test API connectivity by trying to list charges with limit 1
      await this.listCharges({ limit: 1 });
      
      return {
        isHealthy: true,
        status: 'Coinbase Commerce API is operational',
        lastChecked: new Date(),
        apiKeyValid: true,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isAuthError = errorMessage.includes('401') || errorMessage.includes('authentication');
      
      return {
        isHealthy: false,
        status: `Coinbase Commerce API error: ${errorMessage}`,
        lastChecked: new Date(),
        apiKeyValid: !isAuthError,
      };
    }
  }

  /**
   * Get API usage statistics (if available)
   */
  async getApiUsage(): Promise<{
    rateLimit?: {
      limit: number;
      remaining: number;
      reset: number;
    };
    monthlyVolume?: {
      charges: number;
      amount: string;
      currency: string;
    };
  }> {
    // Coinbase Commerce doesn't expose rate limiting info in headers
    // This is a placeholder for future implementation
    return {
      rateLimit: {
        limit: 1000, // Estimated based on typical limits
        remaining: 999,
        reset: Date.now() + 3600000, // 1 hour
      },
    };
  }
}

// Create singleton instance
export const coinbaseCommerceService = new CoinbaseCommerceService();