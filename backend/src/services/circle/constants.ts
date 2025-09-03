/**
 * Circle API Configuration Constants
 * All contract addresses, domain mappings, and configuration values
 */

import type { UsdcContractAddresses, CCTPDomainMapping } from '../../interfaces/circle.interface';

// ===== API ENDPOINTS =====

export const CIRCLE_API_ENDPOINTS = {
  production: 'https://api.circle.com/v1',
  sandbox: 'https://api-sandbox.circle.com/v1'
} as const;

// ===== USDC CONTRACT ADDRESSES =====

export const USDC_CONTRACTS: UsdcContractAddresses = {
  mainnet: {
    ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    linea: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    sei: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
    solana: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    sui: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    unichain: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
    worldChain: '0x79A02482A880bCe3F13E09da970dC34dB4cD24D1',
    zkSyncEra: '0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4'
  },
  testnet: {
    sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    polygonAmoy: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
    arbitrumSepolia: '0x75faf114eafb1BDbe2F0316DF893fd58Ce46AA4d',
    baseSepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    avalancheFuji: '0x5425890298aed601595a70AB815c96711a31Bc65',
    optimismSepolia: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
    lineaSepolia: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7',
    seiTestnet: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
    solanaDevnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    suiTestnet: '0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC',
    unichainSepolia: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
    worldChainSepolia: '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88',
    zkSyncEraTestnet: '0xAe045DE5638162fa134807Cb558E15A3F5A7F853'
  }
};

// ===== CCTP DOMAIN MAPPING =====

export const CCTP_DOMAINS: CCTPDomainMapping = {
  ethereum: 0,
  avalanche: 1,
  optimism: 2,
  arbitrum: 3,
  base: 8,
  polygon: 7,
  noble: 4,
  solana: 5
};

// ===== SUPPORTED CHAINS =====

export const SUPPORTED_CHAINS = [
  'ethereum', 'polygon', 'arbitrum', 'base', 'avalanche',
  'optimism', 'linea', 'sei', 'solana', 'sui',
  'unichain', 'worldChain', 'zkSyncEra'
] as const;

export const CCTP_SUPPORTED_CHAINS = [
  'ethereum', 'avalanche', 'optimism', 'arbitrum', 
  'base', 'polygon', 'noble', 'solana'
] as const;

export const FAST_TRANSFER_CHAINS = [
  'ethereum', 'arbitrum', 'base', 'optimism', 
  'polygon', 'solana', 'unichain', 'worldChain'
] as const;

// ===== RATE LIMITS & TIMEOUTS =====

export const API_LIMITS = {
  defaultRateLimit: 100, // requests per minute
  burstLimit: 20, // concurrent requests
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelays: [1000, 2000, 4000], // exponential backoff
  cacheTimeout: 30000 // 30 seconds for rate caching
} as const;

// ===== FEE STRUCTURES =====

export const FEE_STRUCTURES = {
  cctp: {
    standard: '0', // No fee for standard transfers
    fast: {
      ethereum: '0.001',
      base: '0.0001',
      arbitrum: '0.0001',
      polygon: '0.0001',
      solana: '0.00001'
    }
  },
  conversion: {
    spread: '0.001', // 0.1% spread
    minimum: '0.01',
    maximum: '100'
  },
  gateway: {
    deposit: '0',
    mint: '0.0001' // Per mint transaction
  }
} as const;

// ===== BLOCKCHAIN CONFIGURATION =====

export const BLOCKCHAIN_CONFIG = {
  ethereum: {
    chainId: 1,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2',
    explorer: 'https://etherscan.io',
    confirmations: 12,
    blockTime: 12000
  },
  polygon: {
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    confirmations: 20,
    blockTime: 2000
  },
  arbitrum: {
    chainId: 42161,
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    confirmations: 1,
    blockTime: 250
  },
  base: {
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    confirmations: 1,
    blockTime: 2000
  }
} as const;

// ===== ERROR CODES =====

export const CIRCLE_ERROR_CODES = {
  // Authentication
  INVALID_API_KEY: 'invalid_api_key',
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  QUOTA_EXCEEDED: 'quota_exceeded',
  
  // Validation
  INVALID_REQUEST: 'invalid_request',
  INVALID_AMOUNT: 'invalid_amount',
  INVALID_ADDRESS: 'invalid_address',
  UNSUPPORTED_CHAIN: 'unsupported_chain',
  
  // Business Logic
  INSUFFICIENT_BALANCE: 'insufficient_balance',
  TRANSFER_LIMIT_EXCEEDED: 'transfer_limit_exceeded',
  ACCOUNT_SUSPENDED: 'account_suspended',
  
  // Network/Technical
  NETWORK_ERROR: 'network_error',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  TIMEOUT: 'timeout'
} as const;

// ===== WEBHOOK EVENTS =====

export const WEBHOOK_EVENTS = {
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_CONFIRMED: 'payment.confirmed',
  PAYMENT_FAILED: 'payment.failed',
  
  TRANSFER_CREATED: 'transfer.created',
  TRANSFER_COMPLETED: 'transfer.completed',
  TRANSFER_FAILED: 'transfer.failed',
  
  CONVERSION_CREATED: 'conversion.created',
  CONVERSION_COMPLETED: 'conversion.completed',
  CONVERSION_FAILED: 'conversion.failed',
  
  BALANCE_UPDATED: 'balance.updated',
  
  ACCOUNT_VERIFIED: 'account.verified',
  ACCOUNT_SUSPENDED: 'account.suspended'
} as const;

// ===== DEFAULT CONFIGURATION =====

export const DEFAULT_CONFIG = {
  environment: 'sandbox' as const,
  timeout: API_LIMITS.timeout,
  retryAttempts: API_LIMITS.retryAttempts,
  rateLimitPerMinute: API_LIMITS.defaultRateLimit,
  cacheTimeout: API_LIMITS.cacheTimeout
} as const;
