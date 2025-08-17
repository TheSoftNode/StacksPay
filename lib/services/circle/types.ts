/**
 * Circle API Type Definitions
 * Comprehensive interfaces for Circle's ecosystem integration
 */

// ===== CORE CONFIGURATION =====

export interface CircleConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
  rateLimitPerMinute?: number;
}

export interface CircleResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: any;
  timestamp?: string;
  requestId?: string;
}

// ===== USDC CONTRACTS =====

export interface UsdcContractAddresses {
  mainnet: {
    ethereum: string;
    polygon: string;
    arbitrum: string;
    base: string;
    avalanche: string;
    optimism: string;
    linea: string;
    sei: string;
    solana: string;
    sui: string;
    unichain: string;
    worldChain: string;
    zkSyncEra: string;
  };
  testnet: {
    sepolia: string;
    polygonAmoy: string;
    arbitrumSepolia: string;
    baseSepolia: string;
    avalancheFuji: string;
    optimismSepolia: string;
    lineaSepolia: string;
    seiTestnet: string;
    solanaDevnet: string;
    suiTestnet: string;
    unichainSepolia: string;
    worldChainSepolia: string;
    zkSyncEraTestnet: string;
  };
}

// ===== CCTP (Cross-Chain Transfer Protocol) =====

export interface CCTPTransferRequest {
  amount: string;
  sourceDomain: number;
  destinationDomain: number;
  recipient: string;
  burnTxHash?: string;
  transferType: 'standard' | 'fast';
}

export interface CCTPTransferResponse {
  transferId: string;
  status: 'pending' | 'attested' | 'completed' | 'failed';
  sourceTxHash: string;
  destinationTxHash?: string;
  attestation?: string;
  estimatedCompletionTime: Date;
  actualCompletionTime?: Date;
  fees: {
    sourceFee: string;
    destinationFee: string;
    totalFee: string;
  };
}

export interface CCTPAttestation {
  attestation: string;
  status: 'pending' | 'complete';
  messageSent: string;
  messageReceived: boolean;
}

export interface CCTPDomainMapping {
  ethereum: 0;
  avalanche: 1;
  optimism: 2;
  arbitrum: 3;
  base: 8;
  polygon: 7;
  noble: 4;
  solana: 5;
}

// ===== CIRCLE GATEWAY =====

export interface GatewayDepositRequest {
  amount: string;
  sourceChain: string;
  walletAddress: string;
  gasLimit?: string;
}

export interface GatewayDepositResponse {
  depositId: string;
  walletContract: string;
  depositTxHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  unifiedBalance: string;
  expiresAt: Date;
}

export interface GatewayMintRequest {
  amount: string;
  destinationChain: string;
  recipient: string;
  burnIntent: {
    signature: string;
    nonce: string;
    amount: string;
  };
}

export interface GatewayMintResponse {
  mintId: string;
  attestation: string;
  mintTxHash: string;
  status: 'pending' | 'completed' | 'failed';
  actualAmount: string;
}

export interface UnifiedBalance {
  address: string;
  totalBalance: string;
  chainBalances: Record<string, {
    available: string;
    pending: string;
    locked: string;
  }>;
  lastUpdated: Date;
}

// ===== CIRCLE MINT (Enterprise) =====

export interface CircleMintAccount {
  accountId: string;
  businessName: string;
  status: 'pending' | 'approved' | 'suspended';
  tier: 'basic' | 'premium' | 'enterprise';
  limits: {
    dailyMint: string;
    dailyRedeem: string;
    monthlyVolume: string;
  };
  bankingDetails?: {
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  };
}

export interface MintRequest {
  amount: string;
  currency: 'USD';
  destination: {
    type: 'blockchain';
    chain: string;
    address: string;
  };
  idempotencyKey: string;
}

export interface RedeemRequest {
  amount: string;
  currency: 'USD';
  source: {
    type: 'blockchain';
    chain: string;
    address: string;
  };
  destination: {
    type: 'bank_account';
    accountId: string;
  };
  idempotencyKey: string;
}

export interface MintRedeemResponse {
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  amount: string;
  fees: string;
  netAmount: string;
  estimatedCompletion: Date;
  actualCompletion?: Date;
}

// ===== EXCHANGE RATES & CONVERSION =====

export interface ExchangeRateRequest {
  from: string;
  to: string;
  amount?: string;
}

export interface ExchangeRateResponse {
  from: string;
  to: string;
  rate: string;
  inverseRate: string;
  timestamp: Date;
  validUntil: Date;
  spread: string;
  fees: {
    fixed: string;
    percentage: string;
    minimum: string;
    maximum: string;
  };
}

export interface ConversionRequest {
  from: string;
  to: string;
  amount: string;
  slippageTolerance?: string;
  deadline?: Date;
  recipient?: string;
}

export interface ConversionResponse {
  conversionId: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  inputAmount: string;
  outputAmount: string;
  executionRate: string;
  fees: string;
  slippage: string;
  txHash?: string;
}

// ===== WEBHOOKS =====

export interface WebhookConfig {
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: Date;
  signature: string;
}

// ===== PAYMENTS & TRANSACTIONS =====

export interface PaymentRequest {
  amount: string;
  currency: string;
  source: {
    type: 'card' | 'bank' | 'crypto';
    id: string;
  };
  destination: {
    type: 'blockchain';
    chain: string;
    address: string;
  };
  metadata?: Record<string, any>;
}

export interface TransactionStatus {
  id: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  type: 'deposit' | 'withdrawal' | 'transfer' | 'conversion';
  amount: string;
  currency: string;
  fees: string;
  confirmations?: number;
  requiredConfirmations?: number;
  txHash?: string;
  blockHeight?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ===== ANALYTICS & REPORTING =====

export interface TransactionMetrics {
  period: {
    start: Date;
    end: Date;
  };
  volume: {
    total: string;
    byChain: Record<string, string>;
    byCurrency: Record<string, string>;
  };
  transactions: {
    count: number;
    successful: number;
    failed: number;
    pending: number;
  };
  fees: {
    total: string;
    average: string;
    byType: Record<string, string>;
  };
  performance: {
    averageCompletionTime: number;
    successRate: number;
    uptime: number;
  };
}

// ===== ERROR HANDLING =====

export interface CircleApiError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  category: 'authentication' | 'validation' | 'rate_limit' | 'network' | 'server' | 'business_logic';
}

// ===== UTILITY TYPES =====

export type SupportedChain = 
  | 'ethereum' | 'polygon' | 'arbitrum' | 'base' | 'avalanche' 
  | 'optimism' | 'linea' | 'sei' | 'solana' | 'sui' 
  | 'unichain' | 'worldChain' | 'zkSyncEra';

export type SupportedCurrency = 'USDC' | 'EURC' | 'USD' | 'EUR' | 'BTC' | 'ETH' | 'STX' | 'sBTC';

export type TransferType = 'standard' | 'fast' | 'instant';

export type Environment = 'sandbox' | 'production';
