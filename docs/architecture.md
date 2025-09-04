# StacksPay Architecture Documentation

## Overview

StacksPay is a comprehensive payment gateway solution for the Stacks ecosystem that enables merchants to accept Bitcoin, STX, and sBTC payments seamlessly. This document explains how all components work together.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        StacksPay Ecosystem                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Frontend  │    │   Backend   │    │  Smart Contracts    │  │
│  │  (Next.js)  │◄──►│  (Node.js)  │◄──►│     (Clarity)       │  │
│  │             │    │             │    │                     │  │
│  │ • Dashboard │    │ • REST API  │    │ • sBTC Token        │  │
│  │ • Checkout  │    │ • Payment   │    │ • Deposit Manager   │  │
│  │ • Wallet UI │    │   Logic     │    │ • Registry          │  │
│  └─────────────┘    │ • Webhooks  │    │ • Withdrawal        │  │
│                     │ • Auth      │    └─────────────────────┘  │
│  ┌─────────────┐    └─────────────┘                             │
│  │    SDKs     │                                                │
│  │             │    ┌─────────────┐    ┌─────────────────────┐  │
│  │ • Node.js   │◄──►│  Database   │    │   External APIs     │  │
│  │ • Python    │    │ (MongoDB)   │    │                     │  │
│  │ • More...   │    │             │    │ • Stacks API        │  │
│  └─────────────┘    │ • Merchants │    │ • Bitcoin RPC       │  │
│                     │ • Payments  │    │ • sBTC Bridge       │  │
│                     │ • API Keys  │    │ • Wallet Providers  │  │
│                     └─────────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Application (Next.js)

**Location**: `/frontend`

The frontend is a modern React application built with Next.js 14 that provides:

#### Merchant Dashboard

- **Authentication**: JWT-based login system
- **Payment Management**: View and manage all payments
- **Analytics**: Real-time payment statistics and charts
- **API Key Management**: Generate and manage API keys
- **Wallet Setup**: Connect Stacks wallets (Leather, Xverse)
- **Settings**: Configure webhooks, notifications, and security

#### Checkout Interface

- **Payment Processing**: Accept payments in BTC, STX, or sBTC
- **QR Code Generation**: Mobile-friendly payment experience
- **Real-time Updates**: Live payment status using WebSockets
- **Multi-wallet Support**: Automatic wallet detection and connection
- **Responsive Design**: Works on desktop and mobile

#### Key Technologies

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Query for server state
- **Wallet Integration**: @stacks/connect for wallet interactions
- **Real-time**: Socket.io client for live updates

### 2. Backend API (Node.js)

**Location**: `/backend`

The backend is a RESTful API server that handles all business logic:

#### Core Services

**Authentication Service**

```typescript
// JWT-based authentication
POST / api / auth / register; // Merchant registration
POST / api / auth / login; // Merchant login
POST / api / auth / refresh; // Token refresh
```

**Payment Service**

```typescript
// Payment processing
POST /api/payments       // Create payment
GET /api/payments/:id    // Get payment details
PUT /api/payments/:id    // Update payment
DELETE /api/payments/:id // Cancel payment
```

**sBTC Service**

```typescript
// sBTC operations
POST / api / sbtc / deposit; // Create sBTC deposit
GET / api / sbtc / balance; // Check sBTC balance
POST / api / sbtc / transfer; // Transfer sBTC
```

#### Data Models

**Payment Model**

```typescript
interface Payment {
  _id: string;
  merchantId: string;
  amount: number;
  currency: "BTC" | "STX" | "SBTC";
  status: "pending" | "completed" | "failed" | "cancelled";
  addresses: {
    bitcoin?: { depositAddress: string };
    stx?: { toAddress: string };
    sbtc?: { depositAddress: string };
  };
  transactionId?: string;
  createdAt: Date;
  expiresAt: Date;
}
```

**Merchant Model**

```typescript
interface Merchant {
  _id: string;
  email: string;
  name: string;
  stacksAddress?: string;
  walletSetup: boolean;
  connectedWallets: string[];
  apiKeys: string[];
  settings: {
    notifications: boolean;
    webhooks: string[];
  };
}
```

### 3. Smart Contracts (Clarity)

**Location**: `/contracts`

The smart contracts handle on-chain operations:

#### sBTC Token Contract

```clarity
;; Core sBTC functionality
(define-public (mint (amount uint) (recipient principal))
  ;; Mint sBTC tokens
)

(define-public (transfer (amount uint) (sender principal) (recipient principal))
  ;; Transfer sBTC tokens
)

(define-public (burn (amount uint) (owner principal))
  ;; Burn sBTC tokens for Bitcoin withdrawal
)
```

#### Deposit Manager Contract

```clarity
;; Handle Bitcoin deposits for sBTC minting
(define-public (process-deposit (btc-txid (buff 32)) (amount uint))
  ;; Process Bitcoin deposit and mint sBTC
)
```

#### Payment Registry Contract

```clarity
;; Record payment transactions
(define-public (record-payment (payment-id (string-ascii 64)) (amount uint))
  ;; Record successful payment
)
```

### 4. Database Layer (MongoDB)

The MongoDB database stores all application data:

#### Collections

**merchants**

- Merchant account information
- Wallet addresses and settings
- API key references

**payments**

- Payment transactions
- Status tracking
- Currency and amount details

**apikeys**

- API key metadata
- Permissions and rate limits
- Usage statistics

**webhooks**

- Webhook configurations
- Delivery logs and retries

## Data Flow

### Payment Creation Flow

1. **API Request**: Developer calls `POST /api/payments`
2. **Validation**: Backend validates request and API key
3. **Address Generation**: Generate addresses for selected currency
4. **Database Storage**: Store payment in MongoDB
5. **Response**: Return payment object with checkout URL

### Payment Processing Flow

1. **Customer Payment**: Customer sends crypto to generated address
2. **Blockchain Monitoring**: Backend monitors for incoming transactions
3. **Confirmation**: Transaction confirmed on blockchain
4. **sBTC Operations**: If needed, mint/transfer sBTC via smart contracts
5. **Status Update**: Update payment status in database
6. **Webhooks**: Notify merchant via configured webhooks
7. **Settlement**: Transfer funds to merchant's wallet

### Real-time Updates

1. **WebSocket Connection**: Frontend establishes WebSocket connection
2. **Room Subscription**: Subscribe to payment-specific room
3. **Event Broadcasting**: Backend broadcasts status changes
4. **UI Updates**: Frontend updates UI in real-time

## Security Architecture

### Authentication & Authorization

```typescript
// JWT Token Structure
{
  "merchantId": "merchant_id",
  "permissions": ["payments:read", "payments:write"],
  "iat": 1234567890,
  "exp": 1234567890
}
```

### API Key Management

```typescript
// API Key Format
sk_test_1234567890abcdef; // Test environment
sk_live_1234567890abcdef; // Live environment
```

### Rate Limiting

- **Per API Key**: 1000 requests per hour
- **Per IP**: 100 requests per hour
- **Payment Creation**: 10 per minute

### Input Validation

- **Joi Schemas**: Validate all API inputs
- **Sanitization**: Clean and escape user data
- **Type Safety**: TypeScript for compile-time safety

## Integration Points

### Stacks Blockchain

- **Stacks API**: Query blockchain data
- **Transaction Broadcasting**: Submit signed transactions
- **Address Generation**: Create Stacks addresses

### Bitcoin Network

- **Bitcoin RPC**: Monitor Bitcoin transactions
- **Address Generation**: Create Bitcoin addresses
- **UTXO Tracking**: Track unspent outputs

### Wallet Providers

- **Leather Wallet**: @leather-wallet/connect
- **Xverse**: @secretkeylabs/xverse-connect
- **Generic**: @stacks/connect

## Monitoring & Observability

### Logging

```typescript
// Structured logging with Winston
logger.info("Payment created", {
  paymentId: payment.id,
  merchantId: merchant.id,
  amount: payment.amount,
  currency: payment.currency,
});
```

### Metrics

- **Payment Volume**: Track total payment volume
- **Success Rate**: Monitor payment success rates
- **Response Times**: API endpoint performance
- **Error Rates**: Track and alert on errors

### Health Checks

```typescript
GET /health
{
  "status": "healthy",
  "database": "connected",
  "blockchain": "synced",
  "uptime": "24h 15m 30s"
}
```

## Scalability Considerations

### Horizontal Scaling

- **Stateless API**: No server-side sessions
- **Database Replication**: MongoDB replica sets
- **Load Balancing**: Multiple API server instances

### Performance Optimization

- **Caching**: Redis for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Background Jobs**: Async processing for heavy operations

### Future Enhancements

- **Microservices**: Split into smaller services
- **Event Sourcing**: Audit trail and replay capability
- **Multi-region**: Deploy across multiple regions

## Development Workflow

### Local Development

1. **Database**: Start MongoDB locally
2. **Backend**: Run `npm run dev` in `/backend`
3. **Frontend**: Run `npm run dev` in `/frontend`
4. **Contracts**: Use Clarinet for contract development

### Testing Strategy

- **Unit Tests**: Jest for individual functions
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user workflows
- **Contract Tests**: Clarinet testing framework

### Deployment

- **Backend**: Docker containers on cloud platforms
- **Frontend**: Static deployment on Vercel/Netlify
- **Database**: MongoDB Atlas or self-hosted
- **Contracts**: Deployed to Stacks mainnet/testnet
