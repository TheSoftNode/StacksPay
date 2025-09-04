# Payment Service Refactor Documentation

## Overview

The payment service has been completely refactored to separate blockchain operations from business logic, following a clean architecture where:

- **Frontend**: Handles all wallet connections, blockchain transactions, and real-time status monitoring
- **Backend**: Orchestrates payment lifecycle, validates data, stores records, and triggers webhooks

## Key Changes

### 🔄 Architecture Changes

#### Before Refactor

```
Backend Payment Service
├── Direct blockchain interaction
├── Wallet service dependency
├── sBTC service dependency
├── Mock data generation
└── Blockchain status polling
```

#### After Refactor

```
Frontend Services          Backend Payment Service
├── Wallet connections  →   ├── Payment orchestration
├── Blockchain calls    →   ├── Data validation
├── Transaction status  →   ├── Record storage
└── Real-time updates   →   └── Webhook triggers
```

### 🗑️ Removed Dependencies

- `sbtcService` import and usage
- `walletService` import and usage
- Direct blockchain API calls
- Mock transaction ID generation
- Deprecated status check methods

### 🔧 Updated Methods

#### `createPayment()`

- Now accepts optional `blockchainData` from frontend
- No longer generates mock addresses
- Only returns merchant-provided addresses
- Real payment creation with frontend coordination

#### `verifyPaymentSignature()`

- Enhanced to accept real blockchain transaction data
- Validates signatures and transaction details from frontend
- Updates payment status with confirmed blockchain data
- Triggers webhooks for successful verifications

#### `updatePaymentStatus()`

- Accepts real blockchain transaction data
- Caches transaction information for tracking
- No longer polls blockchain directly

#### `refundPayment()`

- Requires `blockchainRefundData` from frontend
- Validates refund transaction details
- Processes business logic only after frontend confirmation
- Supports partial and full refunds with real transaction IDs

### 🆕 New Interfaces

```typescript
interface BlockchainTransactionData {
  transactionId: string;
  blockHeight?: number;
  confirmations?: number;
  status: "pending" | "confirmed" | "failed";
  timestamp: Date;
  feesPaid?: number;
  gasUsed?: number;
  fromAddress?: string;
  toAddress?: string;
}

interface FrontendBackendPaymentData {
  paymentAddress: string;
  blockchainData?: BlockchainTransactionData;
  walletSignature?: string;
  walletPublicKey?: string;
}
```

### 🚫 Deprecated Methods

#### Status Check Methods (Now Deprecated)

- `checkSbtcPaymentStatus()` - Throws error directing to frontend verification
- `checkBtcPaymentStatus()` - Throws error directing to frontend verification
- `checkStxPaymentStatus()` - Throws error directing to frontend verification

#### Payment Processing Methods (Now Deprecated)

- `processSbtcPaymentWithWallet()` - Redirects to `verifyPaymentSignature()`
- `processBtcPaymentWithWallet()` - Redirects to `verifyPaymentSignature()`

## 🔄 Frontend-Backend Coordination

### Payment Flow

1. **Frontend**: User initiates payment
2. **Backend**: Creates payment record with merchant address
3. **Frontend**: Connects wallet and executes blockchain transaction
4. **Frontend**: Calls `verifyPaymentSignature()` with real transaction data
5. **Backend**: Validates and confirms payment
6. **Backend**: Triggers webhook notifications

### Refund Flow

1. **Frontend**: Merchant initiates refund
2. **Frontend**: Executes blockchain refund transaction
3. **Frontend**: Calls `refundPayment()` with real refund transaction data
4. **Backend**: Validates refund and updates records
5. **Backend**: Triggers refund webhook notifications

### Data Requirements

#### For Payment Verification

```typescript
const verificationData = {
  signature: "0x...", // Wallet signature
  blockchainData: {
    transactionId: "0x...", // Real blockchain transaction ID
    blockHeight: 123456,
    confirmations: 6,
    status: "confirmed",
    timestamp: new Date(),
    feesPaid: 0.0001,
    fromAddress: "bc1...",
    toAddress: "bc1...",
  },
};
```

#### For Refund Processing

```typescript
const refundData = {
  blockchainRefundData: {
    transactionId: "0x...", // Real refund transaction ID
    blockHeight: 123457,
    status: "confirmed",
    feesPaid: 0.0001,
  },
  amount: 0.001, // Optional: partial refund
  reason: "Customer request",
};
```

## 🔍 Error Handling

### Validation Errors

- Missing blockchain transaction data
- Invalid transaction signatures
- Unconfirmed blockchain status
- Insufficient payment amounts

### Deprecated Method Calls

- Clear error messages directing to correct frontend methods
- No fallback to mock data
- Production-ready error responses

## 🚀 Production Readiness

### No Mock Data

- All transaction IDs are real blockchain transactions
- All addresses are from actual wallets
- All status checks use real blockchain data

### Real Blockchain Integration

- Frontend services use actual blockchain APIs
- Backend only processes confirmed blockchain data
- Full transaction traceability

### Data Integrity

- All payment records linked to real transactions
- Comprehensive audit trail
- Blockchain-verified transaction details

## 📝 Usage Examples

### Creating a Payment (Backend)

```typescript
const payment = await paymentService.createPayment({
  amount: 100,
  currency: "sbtc",
  merchantId: "merchant_123",
  customerEmail: "user@example.com",
  // No blockchain data needed - frontend will handle
});
```

### Verifying Payment (After Frontend Transaction)

```typescript
const verification = await paymentService.verifyPaymentSignature(
  paymentId,
  signature,
  {
    transactionId: realBlockchainTxId,
    blockHeight: 123456,
    confirmations: 6,
    status: "confirmed",
    timestamp: new Date(),
  }
);
```

### Processing Refund (After Frontend Transaction)

```typescript
const refund = await paymentService.refundPayment(paymentId, merchantId, {
  amount: 50, // Partial refund
  reason: "Customer return",
  blockchainRefundData: {
    transactionId: realRefundTxId,
    blockHeight: 123500,
    status: "confirmed",
  },
});
```

## 🎯 Benefits

1. **Clean Separation**: Blockchain logic is client-side, business logic is server-side
2. **Real Data**: No mock transactions, everything uses real blockchain data
3. **Scalability**: Backend focuses on orchestration rather than blockchain polling
4. **Security**: Wallet operations stay in frontend, sensitive operations server-side
5. **Performance**: No blockchain API calls blocking backend responses
6. **Maintainability**: Clear responsibilities and simpler codebase

## 🔮 Next Steps

1. Frontend integration testing with real wallet connections
2. End-to-end payment flow validation
3. Webhook delivery testing
4. Error scenario testing
5. Performance optimization
6. Documentation updates for API endpoints
