// Database import will be added when needed

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

class ConversionService {
  private rateCache: Map<string, ConversionRate> = new Map();
  private cacheTimeout = 60 * 1000; // 1 minute cache

  // Supported currencies and their properties
  private readonly currencies = {
    BTC: {
      name: 'Bitcoin',
      decimals: 8,
      minAmount: 0.00001,
      maxAmount: 100,
      networkFee: 0.0001,
    },
    STX: {
      name: 'Stacks',
      decimals: 6,
      minAmount: 0.1,
      maxAmount: 1000000,
      networkFee: 0.001,
    },
    sBTC: {
      name: 'Synthetic Bitcoin',
      decimals: 8,
      minAmount: 0.00001,
      maxAmount: 100,
      networkFee: 0.0001,
    },
    USD: {
      name: 'US Dollar',
      decimals: 2,
      minAmount: 1,
      maxAmount: 1000000,
      networkFee: 0,
    },
    USDT: {
      name: 'Tether USD',
      decimals: 6,
      minAmount: 1,
      maxAmount: 1000000,
      networkFee: 1, // USDT network fee
    },
  };

  /**
   * Get current conversion rates from multiple sources
   */
  async getConversionRates(): Promise<Record<string, number>> {
    try {
      // Primary source: CoinGecko
      const coingeckoRates = await this.fetchCoingeckoRates();
      
      // Backup source: CoinMarketCap (if primary fails)
      const fallbackRates = await this.getFallbackRates();
      
      // Combine and validate rates
      const rates = { ...fallbackRates, ...coingeckoRates };
      
      // Cache rates
      Object.entries(rates).forEach(([pair, rate]) => {
        this.rateCache.set(pair, {
          from: pair.split('/')[0],
          to: pair.split('/')[1],
          rate: rate as number,
          timestamp: new Date(),
          source: 'coingecko',
        });
      });

      return rates;

    } catch (error) {
      console.error('Failed to fetch conversion rates:', error);
      return this.getFallbackRates();
    }
  }

  /**
   * Fetch rates from CoinGecko API
   */
  private async fetchCoingeckoRates(): Promise<Record<string, number>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,stacks,tether&vs_currencies=usd',
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'sBTC-Payment-Gateway/1.0',
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        'BTC/USD': data.bitcoin?.usd || 45000,
        'STX/USD': data.stacks?.usd || 0.5,
        'sBTC/USD': data.bitcoin?.usd || 45000, // sBTC is pegged to BTC
        'USDT/USD': data.tether?.usd || 1.0,
        'USD/USD': 1.0,
        // Derived rates
        'USD/BTC': 1 / (data.bitcoin?.usd || 45000),
        'USD/STX': 1 / (data.stacks?.usd || 0.5),
        'USD/sBTC': 1 / (data.bitcoin?.usd || 45000),
        'USD/USDT': 1 / (data.tether?.usd || 1.0),
        'BTC/STX': (data.bitcoin?.usd || 45000) / (data.stacks?.usd || 0.5),
        'STX/BTC': (data.stacks?.usd || 0.5) / (data.bitcoin?.usd || 45000),
        'BTC/sBTC': 1.0, // 1:1 peg
        'sBTC/BTC': 1.0, // 1:1 peg
        'STX/sBTC': (data.stacks?.usd || 0.5) / (data.bitcoin?.usd || 45000),
        'sBTC/STX': (data.bitcoin?.usd || 45000) / (data.stacks?.usd || 0.5),
        'BTC/USDT': (data.bitcoin?.usd || 45000) / (data.tether?.usd || 1.0),
        'USDT/BTC': (data.tether?.usd || 1.0) / (data.bitcoin?.usd || 45000),
        'STX/USDT': (data.stacks?.usd || 0.5) / (data.tether?.usd || 1.0),
        'USDT/STX': (data.tether?.usd || 1.0) / (data.stacks?.usd || 0.5),
        'sBTC/USDT': (data.bitcoin?.usd || 45000) / (data.tether?.usd || 1.0),
        'USDT/sBTC': (data.tether?.usd || 1.0) / (data.bitcoin?.usd || 45000),
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Fallback rates when APIs are unavailable
   */
  private async getFallbackRates(): Promise<Record<string, number>> {
    return {
      'BTC/USD': 45000,
      'STX/USD': 0.5,
      'sBTC/USD': 45000,
      'USDT/USD': 1.0,
      'USD/USD': 1.0,
      'USD/BTC': 1 / 45000,
      'USD/STX': 1 / 0.5,
      'USD/sBTC': 1 / 45000,
      'USD/USDT': 1.0,
      'BTC/STX': 45000 / 0.5,
      'STX/BTC': 0.5 / 45000,
      'BTC/sBTC': 1.0,
      'sBTC/BTC': 1.0,
      'STX/sBTC': 0.5 / 45000,
      'sBTC/STX': 45000 / 0.5,
      'BTC/USDT': 45000,
      'USDT/BTC': 1 / 45000,
      'STX/USDT': 0.5,
      'USDT/STX': 1 / 0.5,
      'sBTC/USDT': 45000,
      'USDT/sBTC': 1 / 45000,
    };
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    options: {
      includeNetworkFees?: boolean;
      conversionFeeRate?: number;
      slippageTolerance?: number;
    } = {}
  ): Promise<ConversionResult> {
    try {
      const {
        includeNetworkFees = true,
        conversionFeeRate = 0.005, // 0.5% default conversion fee
        slippageTolerance = 0.01, // 1% slippage tolerance
      } = options;

      // Validate currencies
      if (!this.currencies[fromCurrency as keyof typeof this.currencies]) {
        throw new Error(`Unsupported from currency: ${fromCurrency}`);
      }
      if (!this.currencies[toCurrency as keyof typeof this.currencies]) {
        throw new Error(`Unsupported to currency: ${toCurrency}`);
      }

      // Get current rates
      const rates = await this.getConversionRates();
      const conversionPair = `${fromCurrency}/${toCurrency}`;
      const rate = rates[conversionPair];

      if (!rate) {
        throw new Error(`No conversion rate available for ${conversionPair}`);
      }

      // Check amount limits
      const fromCurrencyInfo = this.currencies[fromCurrency as keyof typeof this.currencies];
      const toCurrencyInfo = this.currencies[toCurrency as keyof typeof this.currencies];

      if (amount < fromCurrencyInfo.minAmount) {
        throw new Error(`Amount below minimum: ${fromCurrencyInfo.minAmount} ${fromCurrency}`);
      }
      if (amount > fromCurrencyInfo.maxAmount) {
        throw new Error(`Amount above maximum: ${fromCurrencyInfo.maxAmount} ${fromCurrency}`);
      }

      // Calculate conversion
      const baseConvertedAmount = amount * rate;

      // Calculate fees
      const conversionFee = baseConvertedAmount * conversionFeeRate;
      const networkFee = includeNetworkFees ? toCurrencyInfo.networkFee : 0;
      const totalFees = conversionFee + networkFee;

      // Final amount after fees
      const finalAmount = baseConvertedAmount - totalFees;

      // Apply slippage tolerance for volatile conversions
      const adjustedAmount = this.shouldApplySlippage(fromCurrency, toCurrency) 
        ? finalAmount * (1 - slippageTolerance)
        : finalAmount;

      // Estimated completion time
      const estimatedTime = this.getEstimatedTime(fromCurrency, toCurrency);

      return {
        success: true,
        fromAmount: amount,
        fromCurrency,
        toAmount: Math.max(0, adjustedAmount),
        toCurrency,
        rate,
        fees: {
          conversion: conversionFee,
          network: networkFee,
          total: totalFees,
        },
        estimatedTime,
        minAmount: fromCurrencyInfo.minAmount,
        maxAmount: fromCurrencyInfo.maxAmount,
      };

    } catch (error) {
      console.error('Currency conversion error:', error);
      throw error;
    }
  }

  /**
   * Execute actual conversion/swap
   */
  async executeConversion(
    conversionId: string,
    fromAmount: number,
    fromCurrency: string,
    toCurrency: string,
    recipientAddress: string,
    options: {
      merchantId?: string;
      paymentId?: string;
      slippageTolerance?: number;
    } = {}
  ): Promise<{
    success: boolean;
    transactionId: string;
    fromTxId?: string;
    toTxId?: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    estimatedCompletion: Date;
  }> {
    try {
      // Database connection would be established here in production

      // This would integrate with actual conversion services
      // For hackathon, we'll simulate the process

      const conversionResult = await this.convertCurrency(fromAmount, fromCurrency, toCurrency, {
        slippageTolerance: options.slippageTolerance,
      });

      if (!conversionResult.success) {
        throw new Error('Conversion calculation failed');
      }

      // Execute based on conversion type
      let executionResult;

      if (this.isCryptoToFiat(fromCurrency, toCurrency)) {
        // Crypto to fiat (USD/USDT)
        executionResult = await this.executeCryptoToFiat(
          fromAmount,
          fromCurrency,
          toCurrency,
          recipientAddress,
          conversionResult
        );
      } else if (this.isFiatToCrypto(fromCurrency, toCurrency)) {
        // Fiat to crypto
        executionResult = await this.executeFiatToCrypto(
          fromAmount,
          fromCurrency,
          toCurrency,
          recipientAddress,
          conversionResult
        );
      } else {
        // Crypto to crypto
        executionResult = await this.executeCryptoToCrypto(
          fromAmount,
          fromCurrency,
          toCurrency,
          recipientAddress,
          conversionResult
        );
      }

      return {
        success: true,
        transactionId: executionResult.transactionId,
        fromTxId: executionResult.fromTxId,
        toTxId: executionResult.toTxId,
        status: 'processing',
        estimatedCompletion: new Date(Date.now() + this.getEstimatedTimeMs(fromCurrency, toCurrency)),
      };

    } catch (error) {
      console.error('Conversion execution error:', error);
      return {
        success: false,
        transactionId: '',
        status: 'failed',
        estimatedCompletion: new Date(),
      };
    }
  }

  /**
   * Get supported conversion pairs
   */
  getSupportedPairs(): Array<{ from: string; to: string; fee: number; estimatedTime: string }> {
    const pairs = [];
    const currencies = Object.keys(this.currencies);

    for (const from of currencies) {
      for (const to of currencies) {
        if (from !== to) {
          pairs.push({
            from,
            to,
            fee: this.getConversionFee(from, to),
            estimatedTime: this.getEstimatedTime(from, to),
          });
        }
      }
    }

    return pairs;
  }

  // Private helper methods

  private shouldApplySlippage(fromCurrency: string, toCurrency: string): boolean {
    // Apply slippage for volatile crypto pairs
    const stableCoins = ['USD', 'USDT'];
    const fromIsStable = stableCoins.includes(fromCurrency);
    const toIsStable = stableCoins.includes(toCurrency);
    
    return !fromIsStable || !toIsStable;
  }

  private getEstimatedTime(fromCurrency: string, toCurrency: string): string {
    // USD/USDT conversions
    if (fromCurrency === 'USD' || toCurrency === 'USD') {
      return '1-3 business days';
    }
    if (fromCurrency === 'USDT' || toCurrency === 'USDT') {
      return '5-30 minutes';
    }

    // Crypto conversions
    if (fromCurrency === 'BTC' || toCurrency === 'BTC') {
      return '10-20 minutes';
    }
    if (fromCurrency === 'STX' || toCurrency === 'STX') {
      return '10 minutes';
    }
    if (fromCurrency === 'sBTC' || toCurrency === 'sBTC') {
      return '10-20 minutes';
    }

    return '5-15 minutes';
  }

  private getEstimatedTimeMs(fromCurrency: string, toCurrency: string): number {
    // Convert estimated time to milliseconds for calculation
    const timeMap: Record<string, number> = {
      '1-3 business days': 3 * 24 * 60 * 60 * 1000,
      '5-30 minutes': 30 * 60 * 1000,
      '10-20 minutes': 20 * 60 * 1000,
      '10 minutes': 10 * 60 * 1000,
      '5-15 minutes': 15 * 60 * 1000,
    };

    const timeString = this.getEstimatedTime(fromCurrency, toCurrency);
    return timeMap[timeString] || 15 * 60 * 1000;
  }

  private getConversionFee(fromCurrency: string, toCurrency: string): number {
    // Fee structure based on conversion type
    if (this.isCryptoToFiat(fromCurrency, toCurrency) || this.isFiatToCrypto(fromCurrency, toCurrency)) {
      return 0.015; // 1.5% for crypto-fiat conversions
    }
    return 0.005; // 0.5% for crypto-crypto conversions
  }

  private isCryptoToFiat(from: string, to: string): boolean {
    const cryptos = ['BTC', 'STX', 'sBTC'];
    const fiats = ['USD', 'USDT'];
    return cryptos.includes(from) && fiats.includes(to);
  }

  private isFiatToCrypto(from: string, to: string): boolean {
    const cryptos = ['BTC', 'STX', 'sBTC'];
    const fiats = ['USD', 'USDT'];
    return fiats.includes(from) && cryptos.includes(to);
  }

  private async executeCryptoToFiat(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    recipientAddress: string,
    conversionResult: ConversionResult
  ) {
    // Simulate crypto to fiat conversion
    // In production, this would integrate with services like:
    // - Circle API for USDC/USD
    // - Coinbase Commerce for crypto to fiat
    // - BitGo for institutional conversions

    const transactionId = `cfiat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transactionId,
      fromTxId: `${fromCurrency.toLowerCase()}_${Date.now()}`,
      toTxId: toCurrency === 'USD' ? `bank_${Date.now()}` : `usdt_${Date.now()}`,
    };
  }

  private async executeFiatToCrypto(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    recipientAddress: string,
    conversionResult: ConversionResult
  ) {
    // Simulate fiat to crypto conversion
    const transactionId = `fcrypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transactionId,
      fromTxId: fromCurrency === 'USD' ? `bank_${Date.now()}` : `usdt_${Date.now()}`,
      toTxId: `${toCurrency.toLowerCase()}_${Date.now()}`,
    };
  }

  private async executeCryptoToCrypto(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    recipientAddress: string,
    conversionResult: ConversionResult
  ) {
    // Simulate crypto to crypto swap
    // In production, this would use:
    // - Atomic swaps for BTC <-> sBTC
    // - DEX integration for STX conversions
    // - Cross-chain bridges

    const transactionId = `cswap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transactionId,
      fromTxId: `${fromCurrency.toLowerCase()}_${Date.now()}`,
      toTxId: `${toCurrency.toLowerCase()}_${Date.now()}`,
    };
  }
}

export const conversionService = new ConversionService();
