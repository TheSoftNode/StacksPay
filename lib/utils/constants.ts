export const API_ENDPOINTS = {
  MERCHANTS: '/api/v1/merchants',
  PAYMENTS: '/api/v1/payments',
  SBTC: '/api/v1/sbtc',
  ANALYTICS: '/api/v1/analytics',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const NETWORK = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
} as const;

export const BTC_UNIT = 100000000; // 1 BTC = 100,000,000 satoshis

export const DEFAULT_CONFIRMATIONS = 3;
