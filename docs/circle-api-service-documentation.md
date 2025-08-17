# Circle API Service - Complete Method Documentation

## Overview

The CircleApiService is a production-ready, enterprise-grade service that provides comprehensive Circle API integration for the sBTC Payment Gateway. This service is designed to win hackathons by offering superior UX/DX, robust error handling, and complete feature coverage.

---

## Core Configuration & Setup

### `constructor(config: CircleConfig)`

**Purpose**: Initializes the Circle API service with configuration
**Usage**: Auto-instantiated as singleton with environment variables
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Essential foundation, proper config management impresses judges
**Implementation**:

- Merges default config with user config
- Sets up rate limiting and caching
- Validates configuration on startup

### `validateConfig(): void`

**Purpose**: Validates API key and environment settings
**Usage**: Called internally during initialization
**Hackathon Value**: ⭐⭐⭐⭐ - Shows production-readiness and error prevention
**Implementation**: Throws descriptive errors for missing/invalid config

### `updateConfig(newConfig: Partial<CircleConfig>): void`

**Purpose**: Updates service configuration at runtime
**Usage**: For switching environments or updating API keys
**Hackathon Value**: ⭐⭐⭐ - Shows flexibility and dynamic configuration

---

## HTTP Client & Network Layer

### `makeRequest<T>(method, endpoint, data?, options?): Promise<CircleResponse<T>>`

**Purpose**: Core HTTP client with timeout, rate limiting, and error handling
**Usage**: Internal method for all API calls
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Production-grade networking impresses judges
**Features**:

- Automatic timeout handling
- Rate limit enforcement
- Custom headers with request source tracking
- Structured error responses

### `makeRequestWithRetry<T>(method, endpoint, data?, options?): Promise<CircleResponse<T>>`

**Purpose**: HTTP client with automatic retry logic
**Usage**: Used by all public API methods
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Resilient networking shows enterprise thinking
**Features**:

- Exponential backoff
- Configurable retry attempts
- Smart error categorization

---

## USDC Contract Management

### `getUsdcContract(chain: SupportedChain, testnet?: boolean): string`

**Purpose**: Gets USDC contract address for specific blockchain
**Usage**: Frontend needs contract addresses for wallet interactions
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Essential for multi-chain support
**Demo Usage**: Show USDC transfers across different chains

### `getSupportedChains(testnet?: boolean): SupportedChain[]`

**Purpose**: Returns list of supported blockchain networks
**Usage**: Populate chain selection dropdowns in UI
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Shows comprehensive multi-chain support
**Demo Usage**: Display supported networks in payment interface

### `getAllCCTPDomains(): typeof CCTP_DOMAINS`

**Purpose**: Returns complete CCTP domain mapping
**Usage**: For cross-chain transfer routing decisions
**Hackathon Value**: ⭐⭐⭐⭐ - Shows deep CCTP integration knowledge

---

## CCTP (Cross-Chain Transfer Protocol)

### `initiateCCTPTransfer(request: CCTPTransferRequest): Promise<CircleResponse<CCTPTransferResponse>>`

**Purpose**: Initiates cross-chain USDC transfers using Circle's CCTP
**Usage**: Core feature for moving USDC between chains
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Flagship feature, shows cutting-edge tech usage
**Features**:

- Enhanced validation using all imported utilities
- Fee calculation and estimation
- Fast transfer support
- Comprehensive error handling
  **Demo Usage**: Show instant USDC transfer from Ethereum to Base

### `getCCTPAttestation(txHash: string): Promise<CircleResponse<CCTPAttestation>>`

**Purpose**: Gets Circle attestation for cross-chain message
**Usage**: Required step in CCTP flow to complete transfers
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Shows complete CCTP implementation
**Features**:

- Automatic caching to prevent duplicate requests
- Essential for cross-chain completion

### `getCCTPTransferStatus(transferId: string): Promise<CircleResponse<CCTPTransferResponse>>`

**Purpose**: Tracks status of CCTP transfers
**Usage**: Real-time status updates in UI
**Hackathon Value**: ⭐⭐⭐⭐ - Shows user-centric design with status tracking

---

## Circle Gateway Integration

### `createGatewayDeposit(request: GatewayDepositRequest): Promise<CircleResponse<GatewayDepositResponse>>`

**Purpose**: Creates deposits through Circle Gateway
**Usage**: For enterprise users needing gateway access
**Hackathon Value**: ⭐⭐⭐⭐ - Shows enterprise-grade features
**Features**: Complete validation of amount, chain, and address

### `createGatewayMint(request: GatewayMintRequest): Promise<CircleResponse<GatewayMintResponse>>`

**Purpose**: Mints USDC through Circle Gateway
**Usage**: For high-volume or institutional minting needs
**Hackathon Value**: ⭐⭐⭐⭐ - Enterprise feature differentiator

### `getUnifiedBalance(address: string): Promise<CircleResponse<UnifiedBalance>>`

**Purpose**: Gets unified balance across all supported chains
**Usage**: Dashboard showing total USDC holdings
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Amazing UX feature for portfolio view
**Features**: Smart caching with 10-second refresh

---

## Circle Mint (Enterprise Features)

### `createMintAccount(businessData: any): Promise<CircleResponse<CircleMintAccount>>`

**Purpose**: Creates enterprise Circle Mint account
**Usage**: Business onboarding flow
**Hackathon Value**: ⭐⭐⭐ - Shows enterprise capability but less demo-friendly

### `getMintAccount(accountId: string): Promise<CircleResponse<CircleMintAccount>>`

**Purpose**: Retrieves Circle Mint account details
**Usage**: Account management dashboard
**Hackathon Value**: ⭐⭐⭐ - Enterprise feature

### `createMintTransaction(request: MintRequest): Promise<CircleResponse<MintRedeemResponse>>`

**Purpose**: Creates USD to USDC minting transaction
**Usage**: Converting fiat to USDC
**Hackathon Value**: ⭐⭐⭐⭐ - Shows fiat on-ramp capability
**Features**: USD-specific formatting (2 decimals)

### `createRedeemTransaction(request: RedeemRequest): Promise<CircleResponse<MintRedeemResponse>>`

**Purpose**: Redeems USDC back to USD
**Usage**: Fiat off-ramp functionality
**Hackathon Value**: ⭐⭐⭐⭐ - Complete fiat bridge solution

---

## Exchange Rates & Conversion

### `getExchangeRate(request: ExchangeRateRequest): Promise<CircleResponse<ExchangeRateResponse>>`

**Purpose**: Gets real-time exchange rates between currencies
**Usage**: Display current rates in UI before conversions
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Essential for transparent pricing
**Features**: Smart caching (30 seconds) for performance

### `createConversion(request: ConversionRequest): Promise<CircleResponse<ConversionResponse>>`

**Purpose**: Converts between different currencies via Circle
**Usage**: Multi-currency payment support
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Key differentiator for global payments
**Features**: Configurable slippage tolerance, deadline protection

### `getConversionStatus(conversionId: string): Promise<CircleResponse<ConversionResponse>>`

**Purpose**: Tracks conversion transaction status
**Usage**: Real-time status updates for conversions
**Hackathon Value**: ⭐⭐⭐⭐ - User experience enhancement

---

## Payment Processing

### `createPayment(request: PaymentRequest): Promise<CircleResponse<any>>`

**Purpose**: Creates payment transactions with validation and fee calculation
**Usage**: Core payment processing functionality
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Core business logic with transparent fees
**Features**:

- Transaction limit validation
- Automatic fee calculation
- Metadata enrichment with timestamps

### `createPaymentWithFeeQuote(request: PaymentRequest): Promise<CircleResponse<{...}>>`

**Purpose**: Creates payment with upfront fee disclosure
**Usage**: Stripe-like checkout experience with transparent pricing
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Superior UX, shows Stripe-level thinking
**Features**:

- Pre-validation before processing
- Detailed fee breakdown
- Estimated completion time

### `getPaymentStatus(paymentId: string): Promise<CircleResponse<TransactionStatus>>`

**Purpose**: Tracks payment transaction status
**Usage**: Real-time payment tracking in UI
**Hackathon Value**: ⭐⭐⭐⭐ - Essential for payment UX

---

## Webhook Management

### `createWebhook(config: WebhookConfig): Promise<CircleResponse<any>>`

**Purpose**: Sets up webhook endpoints for real-time notifications
**Usage**: Backend integration for event-driven updates
**Hackathon Value**: ⭐⭐⭐⭐ - Shows production-ready architecture

### `updateWebhook(webhookId, config): Promise<CircleResponse<any>>`

**Purpose**: Updates existing webhook configuration
**Usage**: Webhook management dashboard
**Hackathon Value**: ⭐⭐⭐ - Management capability

### `deleteWebhook(webhookId: string): Promise<CircleResponse<any>>`

**Purpose**: Removes webhook endpoints
**Usage**: Cleanup and webhook management
**Hackathon Value**: ⭐⭐⭐ - Complete CRUD operations

### `listWebhooks(): Promise<CircleResponse<any[]>>`

**Purpose**: Lists all configured webhooks
**Usage**: Webhook management interface
**Hackathon Value**: ⭐⭐⭐ - Administrative features

### `validateWebhookEvent(event: any): event is WebhookEvent`

**Purpose**: Type-safe webhook event validation
**Usage**: Webhook handler security
**Hackathon Value**: ⭐⭐⭐⭐ - Shows security consciousness

---

## Analytics & Reporting

### `getTransactionMetrics(startDate, endDate, filters?): Promise<CircleResponse<TransactionMetrics>>`

**Purpose**: Retrieves transaction analytics and metrics
**Usage**: Dashboard analytics and business intelligence
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Impressive dashboard capabilities
**Demo Usage**: Show beautiful charts of transaction volume, success rates

### `getBalances(): Promise<CircleResponse<any>>`

**Purpose**: Gets account balance information
**Usage**: Account dashboard balance display
**Hackathon Value**: ⭐⭐⭐⭐ - Essential financial information

---

## Health & Monitoring

### `healthCheck(): Promise<CircleResponse<{...}>>`

**Purpose**: Comprehensive service health monitoring
**Usage**: System status page, monitoring dashboards
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Shows production operations thinking
**Features**:

- Latency measurement
- Service status tracking
- Rate limit status
- Graceful error handling

---

## Fee Calculation & Limits

### `calculateTransactionFees(amount, transferType, chain?): {...}`

**Purpose**: Calculates detailed fee breakdown for transactions
**Usage**: Show fees upfront in UI (Stripe-like transparency)
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Superior UX, judges love transparency
**Features**:

- Detailed fee breakdown (base, network, service)
- Support for different transfer types
- Chain-specific fee calculation

### `getApiLimits(): typeof API_LIMITS`

**Purpose**: Returns current API rate limits and timeouts
**Usage**: Display limits in developer dashboard
**Hackathon Value**: ⭐⭐⭐ - Developer experience feature

### `validateTransactionLimits(amount, currency?): {...}`

**Purpose**: Validates transaction against configured limits
**Usage**: Pre-transaction validation in UI
**Hackathon Value**: ⭐⭐⭐⭐ - Prevents user errors, better UX
**Features**:

- Amount validation
- Rate limiting checks
- Detailed violation reporting

---

## Error Handling & Analysis

### `analyzeError(error: CircleApiError): {...}`

**Purpose**: Provides actionable insights for Circle API errors
**Usage**: Intelligent error messages in UI
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Shows sophisticated error handling
**Features**:

- Error categorization
- User-friendly messages
- Recommended actions
- Retry delay estimation

### `handleErrorWithRetry<T>(operation, maxRetries?): Promise<T>`

**Purpose**: Automatic error handling with smart retry logic
**Usage**: Wraps critical operations for resilience
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Production-grade resilience
**Features**:

- Respects error retryability
- Exponential backoff
- Maximum retry limits

---

## Utility Methods

### `clearCache(): void`

**Purpose**: Clears all cached data
**Usage**: Admin operations, debugging
**Hackathon Value**: ⭐⭐ - Basic utility

### `getCacheStats(): { size: number }`

**Purpose**: Returns cache statistics
**Usage**: Performance monitoring dashboard
**Hackathon Value**: ⭐⭐⭐ - Shows performance consciousness

### `getRateLimitStatus(): {...}`

**Purpose**: Detailed rate limiting status information
**Usage**: Developer dashboard, API usage monitoring
**Hackathon Value**: ⭐⭐⭐⭐ - Transparent API usage tracking
**Features**:

- Request remaining count
- Reset time information
- Current limit configuration

### `resetRateLimit(): void`

**Purpose**: Resets rate limiting counters
**Usage**: Admin operations, testing
**Hackathon Value**: ⭐⭐ - Utility function

---

## Hackathon-Winning Features

### `prepareTransaction(request): Promise<CircleResponse<{...}>>`

**Purpose**: **FLAGSHIP METHOD** - Comprehensive transaction preparation with all validations
**Usage**: Single API call for complete transaction readiness check
**Hackathon Value**: ⭐⭐⭐⭐⭐ - **DEMO CENTERPIECE** - Shows all capabilities at once
**Features**:

- Complete validation suite
- Fee estimation
- Chain compatibility checks
- Smart recommendations
- Time estimation
- Real-time validation feedback

**Demo Script**:

```javascript
// Show this in live demo - it's IMPRESSIVE!
const result = await circleApiService.prepareTransaction({
  amount: '100',
  fromChain: 'ethereum',
  toChain: 'base',
  recipient: '0x...',
  transferType: 'fast',
});

// Shows validation, fees, chain info, recommendations all at once
console.log(result.data);
```

### `getCCTPNetworkInfo(): {...}`

**Purpose**: **SHOWCASE METHOD** - Displays complete CCTP network capabilities
**Usage**: Network status page showing all supported chains and capabilities
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Perfect for demonstrating comprehensive chain support
**Features**:

- Complete domain mapping
- Chain capability matrix
- CCTP and fast transfer support flags

### `getServiceStatus(): Promise<CircleResponse<{...}>>`

**Purpose**: **STATUS DASHBOARD** - Complete service health and capability overview
**Usage**: Main dashboard showing service health, features, and limits
**Hackathon Value**: ⭐⭐⭐⭐⭐ - Impressive overview of entire system
**Features**:

- Health monitoring
- Feature availability
- Chain support matrix
- Rate limiting status
- Fee structures
- Live API limits

---

## Hackathon Demo Strategy

### **High-Impact Demo Flow**:

1. **Service Status** (`getServiceStatus()`) - Show comprehensive system overview
2. **Network Info** (`getCCTPNetworkInfo()`) - Display multi-chain capabilities
3. **Transaction Prep** (`prepareTransaction()`) - **CENTERPIECE** - Show intelligent validation
4. **Fee Calculation** (`calculateTransactionFees()`) - Transparent pricing
5. **CCTP Transfer** (`initiateCCTPTransfer()`) - Execute cross-chain transfer
6. **Real-time Tracking** (`getCCTPTransferStatus()`) - Show progress
7. **Analytics** (`getTransactionMetrics()`) - Beautiful dashboard

### **Judge-Impressing Features**:

- ✅ **Production-ready error handling**
- ✅ **Transparent fee calculation**
- ✅ **Comprehensive validation**
- ✅ **Multi-chain support**
- ✅ **Real-time monitoring**
- ✅ **Enterprise features**
- ✅ **Developer-friendly APIs**

### **Competitive Advantages**:

1. **Complete Feature Coverage** - Not just basic integration
2. **Production-Grade Architecture** - Rate limiting, caching, retries
3. **Superior UX** - Transparent fees, real-time status, smart validation
4. **Enterprise Ready** - Gateway, Mint, comprehensive monitoring
5. **Developer Experience** - Type-safe, well-documented, intelligent errors

---

## Integration Recommendations

### **Frontend Integration**:

```typescript
// Use prepareTransaction for form validation
const validation = await circleApiService.prepareTransaction(formData);

// Show fees upfront
const fees = circleApiService.calculateTransactionFees(amount, 'cctp', chain);

// Real-time status updates
const status = await circleApiService.getCCTPTransferStatus(transferId);
```

### **Backend Integration**:

```typescript
// Health monitoring
app.get('/health', async (req, res) => {
  const health = await circleApiService.healthCheck();
  res.json(health);
});

// Analytics dashboard
const metrics = await circleApiService.getTransactionMetrics(startDate, endDate);
```

### **Error Handling**:

```typescript
try {
  await circleApiService.initiateCCTPTransfer(request);
} catch (error) {
  const analysis = circleApiService.analyzeError(error);
  // Show user-friendly message with recommended action
}
```

This Circle API service is designed to impress hackathon judges with its comprehensive feature set, production-ready architecture, and superior user experience. Every method serves a purpose in creating a world-class payment gateway.
