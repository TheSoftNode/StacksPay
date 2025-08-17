# Circle API Integration Analysis - Complete Documentation

## 🎯 **Core Circle Services for Our sBTC Gateway**

### **1. USDC Stablecoin Foundation**

- **USDC**: Digital dollar, 1:1 USD backed, 100% liquid reserves
- **Multi-chain support**: 25+ blockchains including Ethereum, Polygon, Arbitrum, Base
- **Real financial value on mainnet**, test tokens on testnet (no value)
- **Global accessibility**: 24/7/365 availability

### **2. Key Circle Products for Our Use Case**

#### **A. Cross-Chain Transfer Protocol (CCTP)**

- **CCTP V2** (latest): Fast transfers in 8-20 seconds
- **Standard Transfer**: 13-19 minutes (hard finality)
- **Fast Transfer**: Seconds (soft finality with Circle backing)
- **Perfect for**: sBTC → USDC conversions across chains

#### **B. Circle Gateway**

- **Unified USDC balance** across multiple chains
- **Instant access** (<500ms) to USDC on any supported chain
- **Non-custodial**: Users retain ownership
- **Perfect for**: Multi-chain merchant settlements

#### **C. Circle Mint** (Enterprise)

- **Direct USD ↔ USDC conversion** at no additional cost
- **For qualified businesses** (our target merchants!)
- **Bank-grade compliance**
- **Perfect for**: Merchant USD cashout

## 🏗️ **Technical Architecture Requirements**

### **Contract Addresses We Need**

#### **Mainnet USDC Contracts:**

```typescript
const USDC_CONTRACTS = {
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
  optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  linea: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  sei: '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392',
  worldChain: '0x79A02482A880bCe3F13E09da970dC34dB4cD24D1',
  unichain: '0x078D782b760474a361dDA0AF3839290b0EF57AD6',
};
```

#### **Testnet USDC Contracts:**

```typescript
const USDC_TESTNET = {
  sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  polygonAmoy: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  arbitrumSepolia: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  baseSepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  avalancheFuji: '0x5425890298aed601595a70AB815c96711a31Bc65',
  opSepolia: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
  lineaSepolia: '0xFEce4462D57bD51A6A552365A011b95f0E16d9B7',
  seiTestnet: '0x4fCF1784B31630811181f670Aea7A7bEF803eaED',
  worldChainSepolia: '0x66145f38cBAC35Ca6F1Dfb4914dF98F1614aeA88',
  unichainSepolia: '0x31d0220469e10c4E71834a79b1f276d740d3768F',
};
```

### **API Integration Requirements**

#### **1. Authentication System**

```typescript
interface CircleAuth {
  apiKey: string; // Bearer token for API calls
  environment: 'sandbox' | 'production';
  baseUrl: string; // https://api.circle.com/v1/
  headers: {
    Authorization: `Bearer ${apiKey}`;
    'Content-Type': 'application/json';
    Accept: 'application/json';
  };
}
```

#### **2. CCTP Integration**

```typescript
interface CCTPTransfer {
  // Burn USDC on source chain
  burnUsdc(amount: string, destinationDomain: number): Promise<string>;

  // Get attestation from Circle
  getAttestation(txHash: string): Promise<string>;

  // Mint USDC on destination chain
  mintUsdc(attestation: string): Promise<string>;

  // Fast Transfer (CCTP V2)
  fastTransfer(amount: string, destination: number): Promise<string>;

  // Check transfer status
  getTransferStatus(txHash: string): Promise<TransferStatus>;
}
```

#### **3. Gateway Integration**

```typescript
interface CircleGateway {
  // Create unified balance
  depositToGateway(amount: string, chain: string): Promise<string>;

  // Instant cross-chain access
  mintFromGateway(amount: string, targetChain: string): Promise<string>;

  // Check balance across all chains
  getUnifiedBalance(address: string): Promise<string>;

  // Gateway wallet management
  createGatewayWallet(address: string): Promise<string>;
}
```

#### **4. Circle Mint Integration**

```typescript
interface CircleMint {
  // Business account management
  createBusinessAccount(details: BusinessDetails): Promise<string>;

  // USD to USDC conversion
  mintUsdc(amount: string, businessId: string): Promise<string>;

  // USDC to USD redemption
  redeemUsdc(amount: string, businessId: string): Promise<string>;

  // Bank account integration
  addBankAccount(businessId: string, bankDetails: BankDetails): Promise<string>;

  // Withdrawal to bank
  withdrawToBank(amount: string, businessId: string): Promise<string>;
}
```

### **Rate Limiting & Performance**

- **API Rate Limits**: Vary by endpoint (need to implement exponential backoff)
- **Real-time rates**: Cache with 30-second TTL
- **Webhook support**: For transaction notifications
- **Monitoring**: Health check endpoints required

### **Chain Domain Mapping**

```typescript
const CHAIN_DOMAINS = {
  ethereum: 0,
  avalanche: 1,
  optimism: 2,
  arbitrum: 3,
  polygon: 7,
  base: 6,
  solana: 5,
  linea: 9,
  sei: 32,
  worldChain: 30,
  unichain: 31,
};
```

## 🚀 **Our Complete Integration Strategy**

### **Phase 1: USDC Conversion Core (60% → 95%)**

```typescript
// Enhanced circle-api-service.ts needs:
- USDC contract integration (all chains)
- CCTP V2 Fast Transfer implementation
- Real-time rate fetching with caching
- Proper error handling & retries
- Webhook notification support
```

### **Phase 2: Gateway Integration (New Feature - 0% → 90%)**

```typescript
// Add to circle-api-service.ts:
- Gateway wallet contract integration
- Unified balance management
- Instant cross-chain transfers
- Multi-chain merchant settlements
```

### **Phase 3: Circle Mint Integration (New Feature - 0% → 85%)**

```typescript
// Add enterprise features:
- Circle Mint API for direct USD conversion
- Business account management
- Compliance reporting
- Bank withdrawal integration
```

## 🎯 **Hackathon Winning Implementation Plan**

### **Critical Updates for circle-api-service.ts:**

1. **Multi-Chain USDC Support**

   - All mainnet + testnet contract addresses
   - Chain-specific gas optimization
   - Cross-chain transfer routing

2. **CCTP V2 Fast Transfers**

   - 8-20 second conversion times (perfect for demos!)
   - Automatic attestation fetching
   - Error recovery for failed transfers

3. **Real-Time Rate Integration**

   - Live USDC exchange rates
   - Slippage protection (max 2%)
   - Transparent fee calculation

4. **Enterprise Features**

   - Circle Mint integration for qualified merchants
   - Webhook notifications for all events
   - Comprehensive transaction logging

5. **Developer Experience**
   - Stripe-like API interface
   - Detailed error messages
   - SDK-style integration

## 🏆 **Competitive Advantages This Gives Us**

### **Demo Appeal:**

- **8-20 second** USDC conversions (vs 10-30 min Bitcoin)
- **Multi-chain flexibility** (Ethereum, Polygon, Base, Arbitrum)
- **Real USD cashout** via Circle Mint
- **Enterprise-grade** compliance ready

### **Production Readiness:**

- **Circle's infrastructure** (trusted by institutions)
- **Regulatory compliance** built-in
- **Global accessibility** (25+ blockchains)
- **Non-custodial** security model

### **Business Model:**

```
Customer pays BTC → sBTC → Circle USDC → Merchant USD bank account
                    ↑            ↑              ↑
               6 seconds    8-20 seconds   Same day
```

**This is our killer feature!** No other hackathon project will have this complete, production-ready USD cashout flow.

## 📊 **API Endpoints We'll Use**

### **Base URLs:**

- **Sandbox**: `https://api-sandbox.circle.com`
- **Production**: `https://api.circle.com`

### **Key Endpoints:**

```
GET  /v1/ping                           # Health check
POST /v1/businessAccount/wallets        # Create business wallet
GET  /v1/businessAccount/deposits       # List deposits
POST /v1/businessAccount/transfers      # Create transfer
GET  /v1/businessAccount/transfers/{id} # Get transfer
POST /v1/banks                          # Add bank account
POST /v1/payouts                        # Create payout
GET  /v1/payouts/{id}                   # Get payout status
```

### **CCTP Endpoints:**

```
POST /v1/cctp/burns                     # Initiate burn
GET  /v1/cctp/burns/{id}               # Get burn status
GET  /v1/cctp/attestations/{txHash}    # Get attestation
POST /v1/cctp/mints                    # Execute mint
```

### **Webhook Events:**

```
payments.succeeded
payments.failed
transfers.created
transfers.completed
transfers.failed
payouts.created
payouts.completed
payouts.failed
```

## 🔒 **Security & Compliance**

### **API Key Management:**

- Store in secure environment variables
- Rotate keys regularly
- Use different keys for sandbox/production
- Implement proper error handling for auth failures

### **Transaction Security:**

- Verify all webhook signatures
- Use HTTPS only
- Implement idempotency keys
- Add transaction limits and monitoring

### **Compliance Features:**

- KYC/AML integration via Circle Mint
- Transaction reporting and audit trails
- Regulatory compliance monitoring
- Geographic restrictions handling

## ✅ **Implementation Checklist**

### **Phase 1 - Core USDC (Immediate):**

- [ ] Multi-chain USDC contract integration
- [ ] CCTP V2 Fast Transfer implementation
- [ ] Real-time rate fetching with Redis caching
- [ ] Comprehensive error handling
- [ ] Transaction status monitoring

### **Phase 2 - Gateway (Next):**

- [ ] Circle Gateway wallet integration
- [ ] Unified balance management
- [ ] Cross-chain instant transfers
- [ ] Multi-chain settlement routing

### **Phase 3 - Enterprise (Future):**

- [ ] Circle Mint business account setup
- [ ] Direct USD conversion integration
- [ ] Bank account management
- [ ] Compliance reporting features

---

**This document serves as the complete blueprint for our Circle API integration that will make our sBTC gateway the most production-ready submission in the hackathon!** 🚀
