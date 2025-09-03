/**
 * Enhanced Circle API Service
 * Production-ready Circle integration with all features
 */

import type {
  CircleConfig,
  CircleResponse,
  CCTPTransferRequest,
  CCTPTransferResponse,
  CCTPAttestation,
  GatewayDepositRequest,
  GatewayDepositResponse,
  GatewayMintRequest,
  GatewayMintResponse,
  UnifiedBalance,
  CircleMintAccount,
  MintRequest,
  RedeemRequest,
  MintRedeemResponse,
  ExchangeRateRequest,
  ExchangeRateResponse,
  ConversionRequest,
  ConversionResponse,
  PaymentRequest,
  TransactionStatus,
  TransactionMetrics,
  WebhookConfig,
  WebhookEvent,
  CircleApiError,
  SupportedChain
} from '../../interfaces/circle.interface';

import {
  CIRCLE_API_ENDPOINTS,
  USDC_CONTRACTS,
  DEFAULT_CONFIG,
  API_LIMITS,
  CCTP_DOMAINS,
  FEE_STRUCTURES,
  CCTP_SUPPORTED_CHAINS,
  FAST_TRANSFER_CHAINS
} from './constants';

import {
  isValidChain,
  isCCTPSupported,
  isFastTransferSupported,
  isValidAddress,
  isValidAmount,
  getCCTPDomain,
  getChainFromDomain,
  formatAmount,
  parseAmount,
  calculateFees,
  createCircleError,
  withRetry,
  RateLimiter,
  SimpleCache
} from './utils';

export class CircleApiService {
  private config: Required<CircleConfig>;
  private rateLimiter: RateLimiter;
  private cache: SimpleCache<any>;
  private baseUrl: string;

  constructor(config: CircleConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      baseUrl: config.baseUrl || CIRCLE_API_ENDPOINTS[config.environment]
    };

    this.baseUrl = this.config.baseUrl;
    this.rateLimiter = new RateLimiter(
      this.config.rateLimitPerMinute,
      60000
    );
    this.cache = new SimpleCache();

    this.validateConfig();
  }

  // ===== CONFIGURATION & VALIDATION =====

  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw createCircleError('invalid_api_key', 'API key is required');
    }

    if (!['sandbox', 'production'].includes(this.config.environment)) {
      throw createCircleError('invalid_request', 'Environment must be sandbox or production');
    }
  }

  public updateConfig(newConfig: Partial<CircleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.baseUrl) {
      this.baseUrl = newConfig.baseUrl;
    }
    this.validateConfig();
  }

  // ===== HTTP CLIENT =====

  private async makeRequest<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    options: { skipRateLimit?: boolean; timeout?: number } = {}
  ): Promise<CircleResponse<T>> {
    // Rate limiting
    if (!options.skipRateLimit && !this.rateLimiter.canMakeRequest()) {
      const waitTime = this.rateLimiter.getWaitTime();
      throw createCircleError(
        'rate_limit_exceeded',
        `Rate limit exceeded. Wait ${waitTime}ms before next request`
      );
    }

    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options.timeout || this.config.timeout;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      this.rateLimiter.recordRequest();

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Request-Source': 'sbtc-payment-gateway'
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseData = await response.json() as any;

      if (!response.ok) {
        throw createCircleError(
          responseData.code || 'api_error',
          responseData.message || `HTTP ${response.status}: ${response.statusText}`,
          responseData
        );
      }

      return {
        success: true,
        data: responseData.data || responseData,
        timestamp: new Date().toISOString(),
        requestId: response.headers.get('x-request-id') || undefined
      };

    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw createCircleError('timeout', `Request timeout after ${timeout}ms`);
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw createCircleError('network_error', 'Network connection failed');
      }

      throw error;
    }
  }

  private async makeRequestWithRetry<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    options?: { skipRateLimit?: boolean; timeout?: number }
  ): Promise<CircleResponse<T>> {
    return withRetry(
      () => this.makeRequest<T>(method, endpoint, data, options),
      this.config.retryAttempts
    );
  }

  // ===== USDC CONTRACT UTILITIES =====

  public getUsdcContract(chain: SupportedChain, testnet: boolean = false): string {
    if (!isValidChain(chain)) {
      throw createCircleError('unsupported_chain', `Unsupported chain: ${chain}`);
    }

    const contracts = testnet ? USDC_CONTRACTS.testnet : USDC_CONTRACTS.mainnet;
    const contract = (contracts as any)[chain];

    if (!contract) {
      throw createCircleError('unsupported_chain', `USDC not available on ${chain}`);
    }

    return contract;
  }

  public getSupportedChains(testnet: boolean = false): SupportedChain[] {
    const contracts = testnet ? USDC_CONTRACTS.testnet : USDC_CONTRACTS.mainnet;
    return Object.keys(contracts) as SupportedChain[];
  }

  // Helper method for getting chain from domain
  private getChainFromDomain(domain: number): string | null {
    return getChainFromDomain(domain);
  }

  // Get all supported CCTP domains
  public getAllCCTPDomains(): typeof CCTP_DOMAINS {
    return CCTP_DOMAINS;
  }

  // ===== CCTP (Cross-Chain Transfer Protocol) =====

  public async initiateCCTPTransfer(request: CCTPTransferRequest): Promise<CircleResponse<CCTPTransferResponse>> {
    const { amount, sourceDomain, destinationDomain, recipient, transferType } = request;

    // Enhanced validation using imported utilities
    if (!isValidAmount(amount)) {
      throw createCircleError('invalid_amount', 'Invalid transfer amount');
    }

    // Use getChainFromDomain utility to get chain names from domains
    const sourceChain = this.getChainFromDomain(sourceDomain);
    const destChain = this.getChainFromDomain(destinationDomain);

    if (!sourceChain || !destChain) {
      throw createCircleError('unsupported_chain', 'Invalid CCTP domain');
    }

    // Use isCCTPSupported utility for validation
    if (!isCCTPSupported(sourceChain) || !isCCTPSupported(destChain)) {
      throw createCircleError('unsupported_chain', 'CCTP not supported on specified chains');
    }

    if (!isValidAddress(recipient, destChain as SupportedChain)) {
      throw createCircleError('invalid_address', 'Invalid recipient address');
    }

    if (transferType === 'fast' && !isFastTransferSupported(destChain)) {
      throw createCircleError('unsupported_chain', `Fast transfers not supported on ${destChain}`);
    }

    // Calculate fees using imported utility
    const feeInfo = calculateFees(parseAmount(amount), transferType || 'standard');
    
    const endpoint = transferType === 'fast' ? '/cctp/fast-transfers' : '/cctp/transfers';
    
    return this.makeRequestWithRetry('POST', endpoint, {
      amount: formatAmount(amount),
      sourceDomain,
      destinationDomain,
      recipient,
      burnTxHash: request.burnTxHash,
      estimatedFees: feeInfo
    });
  }

  public async getCCTPAttestation(txHash: string): Promise<CircleResponse<CCTPAttestation>> {
    if (!txHash) {
      throw createCircleError('invalid_request', 'Transaction hash is required');
    }

    // Check cache first
    const cacheKey = `cctp_attestation_${txHash}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const response = await this.makeRequestWithRetry('GET', `/cctp/attestations/${txHash}`);
    
    // Cache successful attestations
    if (response.success && response.data) {
      this.cache.set(cacheKey, response.data, 30000); // 30 second cache
    }

    return response;
  }

  public async getCCTPTransferStatus(transferId: string): Promise<CircleResponse<CCTPTransferResponse>> {
    return this.makeRequestWithRetry('GET', `/cctp/transfers/${transferId}`);
  }

  // ===== CIRCLE GATEWAY =====

  public async createGatewayDeposit(request: GatewayDepositRequest): Promise<CircleResponse<GatewayDepositResponse>> {
    const { amount, sourceChain, walletAddress } = request;

    if (!isValidAmount(amount)) {
      throw createCircleError('invalid_amount', 'Invalid deposit amount');
    }

    if (!isValidChain(sourceChain)) {
      throw createCircleError('unsupported_chain', `Unsupported chain: ${sourceChain}`);
    }

    if (!isValidAddress(walletAddress, sourceChain)) {
      throw createCircleError('invalid_address', 'Invalid wallet address');
    }

    return this.makeRequestWithRetry('POST', '/gateway/deposits', {
      amount: formatAmount(amount),
      sourceChain,
      walletAddress,
      gasLimit: request.gasLimit
    });
  }

  public async createGatewayMint(request: GatewayMintRequest): Promise<CircleResponse<GatewayMintResponse>> {
    const { amount, destinationChain, recipient, burnIntent } = request;

    if (!isValidAmount(amount)) {
      throw createCircleError('invalid_amount', 'Invalid mint amount');
    }

    if (!isValidChain(destinationChain)) {
      throw createCircleError('unsupported_chain', `Unsupported chain: ${destinationChain}`);
    }

    if (!isValidAddress(recipient, destinationChain)) {
      throw createCircleError('invalid_address', 'Invalid recipient address');
    }

    return this.makeRequestWithRetry('POST', '/gateway/mints', {
      amount: formatAmount(amount),
      destinationChain,
      recipient,
      burnIntent
    });
  }

  public async getUnifiedBalance(address: string): Promise<CircleResponse<UnifiedBalance>> {
    if (!address) {
      throw createCircleError('invalid_address', 'Address is required');
    }

    // Check cache first
    const cacheKey = `unified_balance_${address}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const response = await this.makeRequestWithRetry('GET', `/gateway/balances/${address}`);

    // Cache balance for 10 seconds
    if (response.success && response.data) {
      this.cache.set(cacheKey, response.data, 10000);
    }

    return response;
  }

  // ===== CIRCLE MINT (Enterprise) =====

  public async createMintAccount(businessData: any): Promise<CircleResponse<CircleMintAccount>> {
    return this.makeRequestWithRetry('POST', '/mint/accounts', businessData);
  }

  public async getMintAccount(accountId: string): Promise<CircleResponse<CircleMintAccount>> {
    return this.makeRequestWithRetry('GET', `/mint/accounts/${accountId}`);
  }

  public async createMintTransaction(request: MintRequest): Promise<CircleResponse<MintRedeemResponse>> {
    const { amount, currency, destination, idempotencyKey } = request;

    if (!isValidAmount(amount)) {
      throw createCircleError('invalid_amount', 'Invalid mint amount');
    }

    if (currency !== 'USD') {
      throw createCircleError('invalid_request', 'Only USD minting supported');
    }

    return this.makeRequestWithRetry('POST', '/mint/transactions', {
      amount: formatAmount(amount, 2), // USD has 2 decimals
      currency,
      destination,
      idempotencyKey
    });
  }

  public async createRedeemTransaction(request: RedeemRequest): Promise<CircleResponse<MintRedeemResponse>> {
    const { amount, currency, source, destination, idempotencyKey } = request;

    if (!isValidAmount(amount)) {
      throw createCircleError('invalid_amount', 'Invalid redeem amount');
    }

    return this.makeRequestWithRetry('POST', '/mint/redemptions', {
      amount: formatAmount(amount, 2),
      currency,
      source,
      destination,
      idempotencyKey
    });
  }

  // ===== EXCHANGE RATES & CONVERSION =====

  public async getExchangeRate(request: ExchangeRateRequest): Promise<CircleResponse<ExchangeRateResponse>> {
    const { from, to, amount } = request;

    // Check cache first
    const cacheKey = `exchange_rate_${from}_${to}`;
    const cached = this.cache.get(cacheKey);
    if (cached && !amount) {
      return { success: true, data: cached };
    }

    const params = new URLSearchParams({ from, to });
    if (amount) params.append('amount', amount);

    const response = await this.makeRequestWithRetry('GET', `/rates?${params.toString()}`);

    // Cache rates for 30 seconds
    if (response.success && response.data && !amount) {
      this.cache.set(cacheKey, response.data, 30000);
    }

    return response;
  }

  public async createConversion(request: ConversionRequest): Promise<CircleResponse<ConversionResponse>> {
    const { from, to, amount, slippageTolerance, deadline, recipient } = request;

    if (!isValidAmount(amount)) {
      throw createCircleError('invalid_amount', 'Invalid conversion amount');
    }

    return this.makeRequestWithRetry('POST', '/conversions', {
      from,
      to,
      amount: formatAmount(amount),
      slippageTolerance: slippageTolerance || '0.02', // 2% default
      deadline,
      recipient
    });
  }

  public async getConversionStatus(conversionId: string): Promise<CircleResponse<ConversionResponse>> {
    return this.makeRequestWithRetry('GET', `/conversions/${conversionId}`);
  }

  // ===== PAYMENTS =====

  public async createPayment(request: PaymentRequest): Promise<CircleResponse<any>> {
    const { amount, currency, source, destination, metadata } = request;

    if (!isValidAmount(amount)) {
      throw createCircleError('invalid_amount', 'Invalid payment amount');
    }

    // Validate transaction limits
    const limitValidation = this.validateTransactionLimits(amount, currency);
    if (!limitValidation.valid) {
      throw createCircleError('invalid_amount', `Transaction validation failed: ${limitValidation.violations.join(', ')}`);
    }

    // Calculate fees for transparency
    const feeCalculation = this.calculateTransactionFees(amount, 'conversion');

    return this.makeRequestWithRetry('POST', '/payments', {
      amount: formatAmount(amount),
      currency,
      source,
      destination,
      metadata: {
        ...metadata,
        feeEstimate: feeCalculation,
        timestamp: new Date().toISOString()
      }
    });
  }

  public async createPaymentWithFeeQuote(request: PaymentRequest): Promise<CircleResponse<{
    paymentId: string;
    feeQuote: {
      amount: string;
      fees: string;
      netAmount: string;
      breakdown: {
        baseFee: string;
        networkFee: string;
        serviceFee: string;
      };
    };
    estimatedTime: string;
  }>> {
    const { amount, currency } = request;

    // Pre-validate and calculate fees
    const limitValidation = this.validateTransactionLimits(amount, currency);
    if (!limitValidation.valid) {
      throw createCircleError('invalid_amount', `Transaction validation failed: ${limitValidation.violations.join(', ')}`);
    }

    const feeQuote = this.calculateTransactionFees(amount, 'conversion');
    
    // Create payment with fee information
    const paymentResponse = await this.createPayment(request);

    return {
      success: true,
      data: {
        paymentId: paymentResponse.data?.id || 'unknown',
        feeQuote,
        estimatedTime: '30-60 seconds'
      }
    };
  }

  public async getPaymentStatus(paymentId: string): Promise<CircleResponse<TransactionStatus>> {
    return this.makeRequestWithRetry('GET', `/payments/${paymentId}`);
  }

  // ===== WEBHOOKS =====

  public async createWebhook(config: WebhookConfig): Promise<CircleResponse<any>> {
    return this.makeRequestWithRetry('POST', '/webhooks', config);
  }

  public async updateWebhook(webhookId: string, config: Partial<WebhookConfig>): Promise<CircleResponse<any>> {
    return this.makeRequestWithRetry('PUT', `/webhooks/${webhookId}`, config);
  }

  public async deleteWebhook(webhookId: string): Promise<CircleResponse<any>> {
    return this.makeRequestWithRetry('DELETE', `/webhooks/${webhookId}`);
  }

  public async listWebhooks(): Promise<CircleResponse<any[]>> {
    return this.makeRequestWithRetry('GET', '/webhooks');
  }

  // ===== ANALYTICS & REPORTING =====

  public async getTransactionMetrics(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<CircleResponse<TransactionMetrics>> {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...filters
    });

    return this.makeRequestWithRetry('GET', `/analytics/transactions?${params.toString()}`);
  }

  public async getBalances(): Promise<CircleResponse<any>> {
    return this.makeRequestWithRetry('GET', '/balances');
  }

  // ===== HEALTH & MONITORING =====

  public async healthCheck(): Promise<CircleResponse<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, 'operational' | 'degraded' | 'down'>;
    timestamp: string;
    latency: number;
    rateLimitStatus: {
      remaining: number;
      resetAt: Date;
    };
  }>> {
    const start = Date.now();
    
    try {
      const response = await this.makeRequest('GET', '/health', undefined, { 
        skipRateLimit: true,
        timeout: 5000 
      });
      
      const latency = Date.now() - start;
      
      return {
        success: true,
        data: {
          status: 'healthy',
          services: {
            api: 'operational',
            cctp: 'operational',
            gateway: 'operational',
            mint: 'operational'
          },
          timestamp: new Date().toISOString(),
          latency,
          rateLimitStatus: {
            remaining: this.rateLimiter.canMakeRequest() ? 1 : 0,
            resetAt: new Date(Date.now() + this.rateLimiter.getWaitTime())
          }
        }
      };
    } catch (error) {
      const latency = Date.now() - start;
      
      return {
        success: false,
        data: {
          status: 'unhealthy',
          services: {
            api: 'down',
            cctp: 'down',
            gateway: 'down',
            mint: 'down'
          },
          timestamp: new Date().toISOString(),
          latency,
          rateLimitStatus: {
            remaining: 0,
            resetAt: new Date(Date.now() + 60000)
          }
        },
        error: (error as Error).message
      };
    }
  }

  // ===== FEE CALCULATION & LIMITS =====

  public calculateTransactionFees(
    amount: string, 
    transferType: 'cctp' | 'conversion' | 'gateway' = 'cctp',
    chain?: string
  ): {
    amount: string;
    fees: string;
    netAmount: string;
    breakdown: {
      baseFee: string;
      networkFee: string;
      serviceFee: string;
    };
  } {
    const numericAmount = parseFloat(amount);
    
    // Determine fee rate based on transfer type
    let feeRate = '0';
    if (transferType === 'cctp') {
      feeRate = FEE_STRUCTURES.cctp.standard;
      if (chain && FEE_STRUCTURES.cctp.fast[chain as keyof typeof FEE_STRUCTURES.cctp.fast]) {
        feeRate = FEE_STRUCTURES.cctp.fast[chain as keyof typeof FEE_STRUCTURES.cctp.fast];
      }
    } else if (transferType === 'conversion') {
      feeRate = FEE_STRUCTURES.conversion.spread;
    } else if (transferType === 'gateway') {
      feeRate = FEE_STRUCTURES.gateway.mint;
    }
    
    const feeInfo = calculateFees(amount, feeRate);
    
    // Get fee structure for detailed breakdown
    let baseFee = 0;
    let networkFee = 0;
    let serviceFee = 0;
    
    if (transferType === 'cctp') {
      // CCTP fees are usually zero for standard, small for fast
      baseFee = 0;
      networkFee = parseFloat(FEE_STRUCTURES.cctp.standard);
      if (chain && FEE_STRUCTURES.cctp.fast[chain as keyof typeof FEE_STRUCTURES.cctp.fast]) {
        serviceFee = parseFloat(FEE_STRUCTURES.cctp.fast[chain as keyof typeof FEE_STRUCTURES.cctp.fast]);
      }
    } else if (transferType === 'conversion') {
      baseFee = numericAmount * parseFloat(FEE_STRUCTURES.conversion.spread);
      networkFee = parseFloat(FEE_STRUCTURES.conversion.minimum);
    } else if (transferType === 'gateway') {
      baseFee = 0;
      networkFee = parseFloat(FEE_STRUCTURES.gateway.mint);
    }
    
    return {
      ...feeInfo,
      breakdown: {
        baseFee: baseFee.toFixed(6),
        networkFee: networkFee.toFixed(6),
        serviceFee: serviceFee.toFixed(6)
      }
    };
  }

  public getApiLimits(): typeof API_LIMITS {
    return API_LIMITS;
  }

  public validateTransactionLimits(amount: string, currency: string = 'USDC'): {
    valid: boolean;
    violations: string[];
    limits: {
      timeout: number;
      rateLimit: number;
      retryAttempts: number;
    };
  } {
    const numericAmount = parseFloat(amount);
    const violations: string[] = [];
    
    // Basic amount validation (you can add more specific limits)
    if (numericAmount <= 0) {
      violations.push('Amount must be greater than zero');
    }
    
    if (numericAmount > 1000000) { // 1M USDC limit example
      violations.push('Amount exceeds maximum transaction limit');
    }
    
    // Check rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      violations.push(`Rate limit exceeded. Wait ${this.rateLimiter.getWaitTime()}ms`);
    }
    
    return {
      valid: violations.length === 0,
      violations,
      limits: {
        timeout: API_LIMITS.timeout,
        rateLimit: API_LIMITS.defaultRateLimit,
        retryAttempts: API_LIMITS.retryAttempts
      }
    };
  }

  // ===== WEBHOOK VALIDATION =====

  public validateWebhookEvent(event: any): event is WebhookEvent {
    return event && 
           typeof event.type === 'string' && 
           typeof event.id === 'string' &&
           event.data !== undefined;
  }

  // ===== ERROR HANDLING & ANALYSIS =====

  /**
   * Analyze CircleApiError and provide actionable insights
   */
  public analyzeError(error: CircleApiError): {
    category: CircleApiError['category'];
    isRetryable: boolean;
    recommendedAction: string;
    estimatedRetryDelay?: number;
    userFriendlyMessage: string;
  } {
    const category = error.category;
    const isRetryable = error.retryable;
    
    let recommendedAction = 'Contact support';
    let estimatedRetryDelay: number | undefined;
    let userFriendlyMessage = 'Something went wrong. Please try again.';
    
    switch (category) {
      case 'authentication':
        recommendedAction = 'Check API credentials and permissions';
        userFriendlyMessage = 'Authentication failed. Please check your API configuration.';
        break;
        
      case 'validation':
        recommendedAction = 'Review and correct input parameters';
        userFriendlyMessage = 'Invalid input provided. Please check your transaction details.';
        break;
        
      case 'rate_limit':
        recommendedAction = 'Wait and retry with exponential backoff';
        estimatedRetryDelay = 60000; // 1 minute
        userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
        break;
        
      case 'network':
        recommendedAction = 'Retry with exponential backoff';
        estimatedRetryDelay = 5000; // 5 seconds
        userFriendlyMessage = 'Network error occurred. Retrying automatically...';
        break;
        
      case 'server':
        recommendedAction = 'Wait and retry, or use alternative endpoint';
        estimatedRetryDelay = 30000; // 30 seconds
        userFriendlyMessage = 'Service temporarily unavailable. Please try again later.';
        break;
        
      case 'business_logic':
        recommendedAction = 'Review transaction parameters and business rules';
        userFriendlyMessage = 'Transaction cannot be processed due to business rules.';
        break;
        
      default:
        recommendedAction = 'Contact support with error details';
        userFriendlyMessage = 'An unexpected error occurred. Please contact support.';
    }
    
    return {
      category,
      isRetryable,
      recommendedAction,
      estimatedRetryDelay,
      userFriendlyMessage
    };
  }

  /**
   * Handle errors with automatic retry logic based on CircleApiError properties
   */
  public async handleErrorWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: CircleApiError | Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as CircleApiError | Error;
        
        // Check if it's a CircleApiError and if it's retryable
        if ('retryable' in lastError && !lastError.retryable) {
          throw lastError; // Don't retry non-retryable errors
        }
        
        if (attempt === maxRetries) {
          throw lastError; // Max retries reached
        }
        
        // Calculate delay based on error analysis
        const errorAnalysis = 'category' in lastError 
          ? this.analyzeError(lastError as CircleApiError)
          : { estimatedRetryDelay: 1000 * attempt }; // Exponential backoff fallback
        
        const delay = errorAnalysis.estimatedRetryDelay || (1000 * Math.pow(2, attempt - 1));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  // ===== UTILITY METHODS =====

  public clearCache(): void {
    this.cache.clear();
  }

  public getCacheStats(): { size: number } {
    return { size: this.cache.size() };
  }

  public getRateLimitStatus(): { 
    canMakeRequest: boolean; 
    waitTime: number;
    requestsRemaining: number;
    resetTime: Date;
    currentLimit: number;
  } {
    const status = this.rateLimiter.canMakeRequest();
    const waitTime = this.rateLimiter.getWaitTime();
    
    return {
      canMakeRequest: status,
      waitTime,
      ...this.getDetailedRateLimitStatus(status)
    };
  }

  private getDetailedRateLimitStatus(canMakeRequest: boolean): {
    requestsRemaining: number;
    resetTime: Date;
    currentLimit: number;
  } {
    const currentLimit = this.config.rateLimitPerMinute;
    // This would need to be tracked properly in the RateLimiter class
    return {
      requestsRemaining: canMakeRequest ? currentLimit - 1 : 0,
      resetTime: new Date(Date.now() + 60000),
      currentLimit
    };
  }

  public resetRateLimit(): void {
    this.rateLimiter.reset();
  }

  // ===== HACKATHON-WINNING FEATURES =====

  /**
   * Comprehensive transaction preparation with all validations and fee calculations
   * This method showcases all the imported utilities in action
   */
  public async prepareTransaction(request: {
    amount: string;
    fromChain: string;
    toChain: string;
    recipient: string;
    transferType?: 'standard' | 'fast';
    currency?: string;
  }): Promise<CircleResponse<{
    isValid: boolean;
    validations: {
      amount: boolean;
      chains: boolean;
      address: boolean;
      limits: boolean;
      rateLimit: boolean;
    };
    feeEstimate: {
      amount: string;
      fees: string;
      netAmount: string;
      breakdown: {
        baseFee: string;
        networkFee: string;
        serviceFee: string;
      };
    };
    chainInfo: {
      sourceDomain: number | null;
      destinationDomain: number | null;
      supportsCCTP: boolean;
      supportsFastTransfer: boolean;
    };
    recommendations: string[];
    estimatedTime: string;
  }>> {
    const { amount, fromChain, toChain, recipient, transferType = 'standard', currency = 'USDC' } = request;
    
    const validations = {
      amount: isValidAmount(amount),
      chains: isValidChain(fromChain) && isValidChain(toChain),
      address: isValidAddress(recipient, toChain as SupportedChain),
      limits: this.validateTransactionLimits(amount, currency).valid,
      rateLimit: this.rateLimiter.canMakeRequest()
    };

    const chainInfo = {
      sourceDomain: getCCTPDomain(fromChain),
      destinationDomain: getCCTPDomain(toChain),
      supportsCCTP: isCCTPSupported(fromChain) && isCCTPSupported(toChain),
      supportsFastTransfer: isFastTransferSupported(toChain)
    };

    const feeEstimate = this.calculateTransactionFees(amount, 'cctp', toChain);

    const recommendations: string[] = [];
    
    if (!validations.amount) recommendations.push('Please enter a valid amount');
    if (!validations.chains) recommendations.push('One or both chains are not supported');
    if (!validations.address) recommendations.push('Please check the recipient address format');
    if (!validations.limits) recommendations.push('Transaction exceeds limits');
    if (!validations.rateLimit) recommendations.push(`Rate limit exceeded, wait ${this.rateLimiter.getWaitTime()}ms`);
    
    if (transferType === 'fast' && !chainInfo.supportsFastTransfer) {
      recommendations.push('Fast transfer not available for destination chain, using standard');
    }
    
    if (!chainInfo.supportsCCTP) {
      recommendations.push('Direct CCTP not available, will use alternative routing');
    }

    const isValid = Object.values(validations).every(v => v);
    
    const estimatedTime = transferType === 'fast' && chainInfo.supportsFastTransfer 
      ? '1-3 minutes' 
      : '10-20 minutes';

    return {
      success: true,
      data: {
        isValid,
        validations,
        feeEstimate,
        chainInfo,
        recommendations,
        estimatedTime
      }
    };
  }

  /**
   * Get detailed CCTP information using CCTP_DOMAINS
   */
  public getCCTPNetworkInfo(): {
    domains: typeof CCTP_DOMAINS;
    supportedChains: string[];
    domainMappings: Array<{
      chain: string;
      domain: number;
      supportsCCTP: boolean;
      supportsFastTransfer: boolean;
    }>;
  } {
    const supportedChains = Object.keys(CCTP_DOMAINS);
    const domainMappings = supportedChains.map(chain => ({
      chain,
      domain: (CCTP_DOMAINS as any)[chain],
      supportsCCTP: isCCTPSupported(chain),
      supportsFastTransfer: isFastTransferSupported(chain)
    }));

    return {
      domains: CCTP_DOMAINS,
      supportedChains,
      domainMappings
    };
  }

  /**
   * Get comprehensive service status using all imported constants and utilities
   */
  public async getServiceStatus(): Promise<CircleResponse<{
    health: 'healthy' | 'degraded' | 'unhealthy';
    features: {
      cctp: boolean;
      gateway: boolean;
      conversion: boolean;
      webhooks: boolean;
    };
    chains: {
      supported: string[];
      cctpEnabled: string[];
      fastTransferEnabled: string[];
      cctpDomains: typeof CCTP_DOMAINS;
    };
    limits: typeof API_LIMITS;
    feeStructures: typeof FEE_STRUCTURES;
    rateLimitStatus: {
      canMakeRequest: boolean;
      waitTime: number;
      requestsRemaining: number;
      resetTime: Date;
      currentLimit: number;
    };
  }>> {
    const healthResponse = await this.healthCheck();
    
    return {
      success: true,
      data: {
        health: healthResponse.data?.status || 'unhealthy',
        features: {
          cctp: true,
          gateway: true,
          conversion: true,
          webhooks: true
        },
        chains: {
          supported: Object.keys(USDC_CONTRACTS.mainnet),
          cctpEnabled: [...CCTP_SUPPORTED_CHAINS],
          fastTransferEnabled: [...FAST_TRANSFER_CHAINS],
          cctpDomains: CCTP_DOMAINS
        },
        limits: API_LIMITS,
        feeStructures: FEE_STRUCTURES,
        rateLimitStatus: this.getRateLimitStatus()
      }
    };
  }
}

// Export singleton instance
export const circleApiService = new CircleApiService({
  apiKey: process.env.CIRCLE_API_KEY || '',
  environment: (process.env.CIRCLE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
});

// Export types for external use
export type * from '../../interfaces/circle.interface';
export * from './constants';
export * from './utils';
