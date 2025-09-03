/**
 * Circle Service Module Exports
 * Clean interface for importing Circle API functionality
 */

// Main service class and instance
export { CircleApiService, circleApiService } from './index';

// Type definitions
export type {
  // Core types
  CircleConfig,
  CircleResponse,
  CircleApiError,
  SupportedChain,
  SupportedCurrency,
  TransferType,
  Environment,
  
  // USDC & Contract types
  UsdcContractAddresses,
  
  // CCTP types
  CCTPTransferRequest,
  CCTPTransferResponse,
  CCTPAttestation,
  CCTPDomainMapping,
  
  // Gateway types
  GatewayDepositRequest,
  GatewayDepositResponse,
  GatewayMintRequest,
  GatewayMintResponse,
  UnifiedBalance,
  
  // Circle Mint types
  CircleMintAccount,
  MintRequest,
  RedeemRequest,
  MintRedeemResponse,
  
  // Exchange & Conversion types
  ExchangeRateRequest,
  ExchangeRateResponse,
  ConversionRequest,
  ConversionResponse,
  
  // Payment types
  PaymentRequest,
  TransactionStatus,
  TransactionMetrics,
  
  // Webhook types
  WebhookConfig,
  WebhookEvent
} from '../../interfaces/circle.interface';

// Constants
export {
  CIRCLE_API_ENDPOINTS,
  USDC_CONTRACTS,
  CCTP_DOMAINS,
  SUPPORTED_CHAINS,
  CCTP_SUPPORTED_CHAINS,
  FAST_TRANSFER_CHAINS,
  API_LIMITS,
  FEE_STRUCTURES,
  BLOCKCHAIN_CONFIG,
  CIRCLE_ERROR_CODES,
  WEBHOOK_EVENTS,
  DEFAULT_CONFIG
} from './constants';

// Utilities
export {
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
  isRetryableError,
  getErrorCategory,
  RateLimiter,
  SimpleCache,
  withRetry,
  verifyWebhookSignature,
  formatCurrency,
  truncateAddress,
  getApiUrl,
  isProduction,
  getBlockchainConfig,
  getRequiredConfirmations,
  getEstimatedBlockTime
} from './utils';
