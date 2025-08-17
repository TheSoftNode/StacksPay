/**
 * Circle API Utility Functions
 * Helper functions for Circle API integration
 */

import type { 
  CircleApiError, 
  SupportedChain, 
  TransferType,
  Environment 
} from './types';
import { 
  CIRCLE_ERROR_CODES, 
  CCTP_DOMAINS, 
  SUPPORTED_CHAINS,
  FAST_TRANSFER_CHAINS,
  BLOCKCHAIN_CONFIG
} from './constants';

// ===== VALIDATION UTILITIES =====

export function isValidChain(chain: string): chain is SupportedChain {
  return SUPPORTED_CHAINS.includes(chain as SupportedChain);
}

export function isCCTPSupported(chain: string): boolean {
  return Object.keys(CCTP_DOMAINS).includes(chain);
}

export function isFastTransferSupported(chain: string): boolean {
  return FAST_TRANSFER_CHAINS.includes(chain as any);
}

export function isValidAddress(address: string, chain: SupportedChain): boolean {
  switch (chain) {
    case 'ethereum':
    case 'polygon':
    case 'arbitrum':
    case 'base':
    case 'avalanche':
    case 'optimism':
    case 'linea':
    case 'sei':
    case 'unichain':
    case 'worldChain':
    case 'zkSyncEra':
      // EVM address validation (0x + 40 hex characters)
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    
    case 'solana':
      // Solana address validation (base58, 32-44 characters)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    
    case 'sui':
      // Sui address validation (0x + 64 hex characters)
      return /^0x[a-fA-F0-9]{64}$/.test(address);
    
    default:
      return false;
  }
}

export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && isFinite(num);
}

// ===== CONVERSION UTILITIES =====

export function getCCTPDomain(chain: string): number | null {
  return (CCTP_DOMAINS as any)[chain] ?? null;
}

export function getChainFromDomain(domain: number): string | null {
  const entries = Object.entries(CCTP_DOMAINS);
  const found = entries.find(([_, domainNum]) => domainNum === domain);
  return found?.[0] ?? null;
}

export function formatAmount(amount: string | number, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (num * Math.pow(10, decimals)).toFixed(0);
}

export function parseAmount(amount: string, decimals: number = 6): string {
  const num = parseFloat(amount);
  return (num / Math.pow(10, decimals)).toFixed(decimals);
}

export function calculateFees(amount: string, feeRate: string): {
  amount: string;
  fees: string;
  netAmount: string;
} {
  const amountNum = parseFloat(amount);
  const feeRateNum = parseFloat(feeRate);
  const fees = amountNum * feeRateNum;
  const netAmount = amountNum - fees;
  
  return {
    amount: amount,
    fees: fees.toFixed(6),
    netAmount: netAmount.toFixed(6)
  };
}

// ===== ERROR HANDLING UTILITIES =====

export function createCircleError(
  code: string, 
  message: string, 
  details?: any
): CircleApiError {
  return {
    code,
    message,
    details,
    retryable: isRetryableError(code),
    category: getErrorCategory(code)
  };
}

export function isRetryableError(code: string): boolean {
  const retryableCodes = [
    CIRCLE_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    CIRCLE_ERROR_CODES.NETWORK_ERROR,
    CIRCLE_ERROR_CODES.SERVICE_UNAVAILABLE,
    CIRCLE_ERROR_CODES.TIMEOUT
  ];
  return retryableCodes.includes(code as any);
}

export function getErrorCategory(code: string): CircleApiError['category'] {
  if ([CIRCLE_ERROR_CODES.INVALID_API_KEY, CIRCLE_ERROR_CODES.INSUFFICIENT_PERMISSIONS].includes(code as any)) {
    return 'authentication';
  }
  if ([CIRCLE_ERROR_CODES.INVALID_REQUEST, CIRCLE_ERROR_CODES.INVALID_AMOUNT, CIRCLE_ERROR_CODES.INVALID_ADDRESS].includes(code as any)) {
    return 'validation';
  }
  if ([CIRCLE_ERROR_CODES.RATE_LIMIT_EXCEEDED, CIRCLE_ERROR_CODES.QUOTA_EXCEEDED].includes(code as any)) {
    return 'rate_limit';
  }
  if ([CIRCLE_ERROR_CODES.NETWORK_ERROR, CIRCLE_ERROR_CODES.TIMEOUT].includes(code as any)) {
    return 'network';
  }
  if ([CIRCLE_ERROR_CODES.SERVICE_UNAVAILABLE].includes(code as any)) {
    return 'server';
  }
  return 'business_logic';
}

// ===== RATE LIMITING UTILITIES =====

export class RateLimiter {
  private requests: number[] = [];
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 100, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    return this.requests.length < this.limit;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }

  getWaitTime(): number {
    if (this.canMakeRequest()) return 0;
    
    const oldest = Math.min(...this.requests);
    return oldest + this.windowMs - Date.now();
  }

  reset(): void {
    this.requests = [];
  }
}

// ===== RETRY UTILITIES =====

export async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delays: number[] = [1000, 2000, 4000]
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on non-retryable errors
      if (error instanceof Error && 'code' in error) {
        const circleError = error as any as CircleApiError;
        if (!circleError.retryable) {
          throw error;
        }
      }
      
      // Wait before retry (except on last attempt)
      if (attempt < maxAttempts - 1) {
        const delay = delays[attempt] || delays[delays.length - 1];
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// ===== CACHE UTILITIES =====

export class SimpleCache<T> {
  private cache = new Map<string, { value: T; expires: number }>();
  
  set(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    // Clean expired entries
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expires) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    return this.cache.size;
  }
}

// ===== WEBHOOK UTILITIES =====

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Simplified signature verification
  // In production, use proper HMAC verification
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

// ===== FORMATTING UTILITIES =====

export function formatCurrency(amount: string, currency: string): string {
  const num = parseFloat(amount);
  
  switch (currency) {
    case 'USDC':
    case 'USD':
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case 'BTC':
      return `₿${num.toFixed(8)}`;
    case 'ETH':
      return `Ξ${num.toFixed(6)}`;
    default:
      return `${num.toFixed(6)} ${currency}`;
  }
}

export function truncateAddress(address: string, chars: number = 6): string {
  if (address.length <= chars * 2) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// ===== ENVIRONMENT UTILITIES =====

export function getApiUrl(environment: Environment): string {
  return environment === 'production' 
    ? 'https://api.circle.com/v1'
    : 'https://api-sandbox.circle.com/v1';
}

export function isProduction(environment: Environment): boolean {
  return environment === 'production';
}

// ===== BLOCKCHAIN UTILITIES =====

export function getBlockchainConfig(chain: SupportedChain) {
  return (BLOCKCHAIN_CONFIG as any)[chain];
}

export function getRequiredConfirmations(chain: SupportedChain): number {
  const config = getBlockchainConfig(chain);
  return config?.confirmations || 12;
}

export function getEstimatedBlockTime(chain: SupportedChain): number {
  const config = getBlockchainConfig(chain);
  return config?.blockTime || 12000;
}
