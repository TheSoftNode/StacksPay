# Professional Architecture Migration Plan

# sBTC Payment Gateway - Wallet Service Restructuring

## Current System Analysis

### 🔍 What We're Building (Core Requirements)

1. **Multi-Currency Payment Gateway**:

   - Accept: Bitcoin (BTC), Stacks (STX), sBTC
   - Process: Convert to sBTC for merchants
   - Payout: sBTC, USD, USDT, USDC

2. **Wallet Support Matrix**:

   - **Bitcoin Wallets**: Electrum, Bitcoin Core, Sparrow, BlueWallet, etc.
   - **Stacks Wallets**: Xverse, Hiro, Leather, Boom, etc.
   - **sBTC Integration**: Deposit/withdrawal via sBTC protocol

3. **Payment Flow**:
   ```
   Customer Wallet → Payment Gateway → Merchant Settlement → Cashout
   (BTC/STX/sBTC) → (Conversion) → (sBTC) → (USD/USDC/sBTC)
   ```

## 🏗️ NEW ARCHITECTURE (Professional Implementation)

### Frontend Responsibilities

```typescript
// 🎯 FRONTEND: Complete wallet management
class WalletService {
  // Multi-wallet connection
  connectBitcoinWallet() → BitcoinWalletInfo
  connectStacksWallet() → StacksWalletInfo

  // Payment preparation
  preparePayment(paymentData) → SignedPaymentData

  // Transaction signing
  signBitcoinTransaction(tx) → SignedBitcoinTx
  signStacksTransaction(tx) → SignedStacksTx
  signMessage(message) → Signature

  // Submit to backend
  submitPayment(signedData) → PaymentResult
}
```

### Backend Responsibilities (Refined)

```typescript
// 🎯 BACKEND: Verification + Processing + sBTC Operations

// 1. Signature Verification Service
class SignatureVerificationService {
  verifyBitcoinSignature(data) → boolean
  verifyStacksSignature(data) → boolean
  validatePaymentAuth(auth) → ValidationResult
}

// 2. sBTC Protocol Service (KEEP - Server-side only)
class SbtcService {
  createDepositAddress() → DepositAddress
  monitorDeposits() → DepositStatus
  processWithdrawal() → WithdrawalTx
  getBalance() → sBTCBalance
  // All sBTC protocol operations
}

// 3. Payment Processing Service
class PaymentService {
  processVerifiedPayment() → ProcessingResult
  convertCurrencies() → ConversionResult
  settleToMerchant() → SettlementResult
}

// 4. Multi-Currency Support Service
class CurrencyService {
  convertBtcToSbtc() → ConversionData
  convertStxToSbtc() → ConversionData
  getExchangeRates() → RateData
}
```

## 📋 Migration Steps (Preserve All Functionality)

### Step 1: Extract and Preserve Critical Backend Logic
