const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface PaymentCreateRequest {
  amount: number;
  currency: 'USD' | 'BTC' | 'STX' | 'sBTC';
  paymentMethod?: 'sbtc' | 'btc' | 'stx';
  payoutMethod?: 'sbtc' | 'usd' | 'usdt' | 'usdc';
  description?: string;
  customerInfo?: {
    email?: string;
    name?: string;
  };
  successUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: string;
  allowedPaymentMethods?: string[];
  preferredPaymentMethod?: string;
}

export interface PaymentLinkRequest {
  amount: number;
  currency: 'USD' | 'BTC' | 'STX' | 'sBTC';
  paymentMethod?: 'sbtc' | 'btc' | 'stx';
  description: string;
  customerEmail?: string;
  expiresIn?: string; // '1h', '24h', '7d', 'never'
  customId?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentUpdateRequest {
  status: 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  confirmations?: number;
}

export interface Payment {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  payoutMethod: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'expired' | 'cancelled' | 'refunded';
  description?: string;
  customerInfo?: {
    email?: string;
    name?: string;
  };
  depositAddress?: string;
  paymentAddress?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  completedAt?: string;
  transactionData?: {
    txId?: string;
    blockHeight?: number;
    confirmations?: number;
    timestamp?: string;
    fromAddress?: string;
  };
  metadata?: Record<string, any>;
  successUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class PaymentApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = this.getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  }

  private async makeRequest<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle authentication errors
      if (response.status === 401) {
        // Token might be expired, redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }

      return {
        success: response.ok,
        ...data,
      };
    } catch (error) {
      console.error('Payment API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Payment Management - Using merchant auth (not API keys)
  async createPaymentForMerchant(paymentData: PaymentCreateRequest): Promise<ApiResponse<Payment>> {
    return this.makeRequest('/api/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentForMerchant(paymentId: string): Promise<ApiResponse<Payment>> {
    return this.makeRequest(`/api/payments/${paymentId}`);
  }

  async updatePaymentForMerchant(paymentId: string, updateData: PaymentUpdateRequest): Promise<ApiResponse> {
    return this.makeRequest(`/api/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async listPaymentsForMerchant(query?: {
    status?: string;
    paymentMethod?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<PaymentListResponse>> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/payments${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  async cancelPaymentForMerchant(paymentId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/payments/${paymentId}/cancel`, {
      method: 'POST',
    });
  }

  async refundPaymentForMerchant(
    paymentId: string, 
    refundData: {
      amount?: number;
      reason?: string;
      blockchainRefundData: {
        transactionId: string;
        blockHeight?: number;
        status?: 'pending' | 'confirmed';
        feesPaid?: number;
      };
    }
  ): Promise<ApiResponse> {
    return this.makeRequest(`/api/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify(refundData),
    });
  }

  async verifyPaymentForMerchant(
    paymentId: string,
    verificationData: {
      signature: string;
      blockchainData?: {
        txId?: string;
        txHash?: string;
        blockHeight?: number;
        confirmations?: number;
        timestamp?: string;
      };
      customerWalletAddress?: string;
    }
  ): Promise<ApiResponse> {
    return this.makeRequest(`/api/payments/${paymentId}/verify`, {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  // Payment Links - For merchant dashboard
  async createPaymentLinkForMerchant(linkData: PaymentLinkRequest): Promise<ApiResponse<{ 
    id: string; 
    url: string; 
    qrCode: string; 
    expiresAt?: string; 
  }>> {
    return this.makeRequest('/api/payment-links', {
      method: 'POST',
      body: JSON.stringify(linkData),
    });
  }

  // Public endpoints (no auth required) - For customer payments
  async getPaymentStatus(paymentId: string): Promise<ApiResponse<{
    id: string;
    status: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    expiresAt?: string;
    depositAddress?: string;
    qrCode?: string;
  }>> {
    // No auth headers for public endpoint
    const url = `${this.baseURL}/api/public/payments/${paymentId}/status`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      return {
        success: response.ok,
        ...data,
      };
    } catch (error) {
      console.error('Payment status request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Process payment (public endpoint for customers)
  async processPayment(paymentId: string, paymentData: {
    walletAddress: string;
    transactionId: string;
    signature?: string;
    paymentMethod: 'bitcoin' | 'stx' | 'sbtc';
  }): Promise<ApiResponse> {
    const url = `${this.baseURL}/api/public/payments/${paymentId}/process`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
      
      const data = await response.json();
      return {
        success: response.ok,
        ...data,
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Multi-currency conversion utilities
  async getExchangeRates(): Promise<ApiResponse<{
    btcToUsd: number;
    stxToUsd: number;
    sbtcToUsd: number;
    timestamp: string;
  }>> {
    return this.makeRequest('/api/exchange-rates');
  }

  // QR Code generation
  async generateQRCode(paymentId: string, size?: number): Promise<ApiResponse<{
    qrCodeDataUrl: string;
    paymentUrl: string;
  }>> {
    const params = size ? `?size=${size}` : '';
    return this.makeRequest(`/api/payments/${paymentId}/qr${params}`);
  }

  // Payment analytics for merchant dashboard
  async getPaymentAnalytics(query?: {
    startDate?: string;
    endDate?: string;
    currency?: string;
    paymentMethod?: string;
  }): Promise<ApiResponse<{
    totalPayments: number;
    totalVolume: number;
    averagePayment: number;
    successRate: number;
    topCurrencies: Array<{ currency: string; count: number; volume: number }>;
    dailyVolume: Array<{ date: string; volume: number; count: number }>;
  }>> {
    const params = new URLSearchParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const endpoint = `/api/analytics/payments${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }
}

export const paymentApiClient = new PaymentApiClient();
export { PaymentApiClient };