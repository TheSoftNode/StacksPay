# 📋 **STX Payment Gateway - Complete Documentation**

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Analysis](#architecture-analysis)
3. [Unique Address Pattern](#unique-address-pattern)
4. [Implementation Options](#implementation-options)
5. [Security Considerations](#security-considerations)
6. [Final Implementation Strategy](#final-implementation-strategy)
7. [Technical Findings](#technical-findings)

---

## 🎯 **Project Overview**

### **Goal:**
Build an STX payment gateway that integrates with the existing backend/frontend system, with plans to add sBTC support later.

### **Key Requirements:**
- Start with STX payments only (sBTC comes later)
- Integrate with existing merchant management backend
- Use Chainhook for real-time event monitoring
- Support unique addresses per payment (from StacksPay docs)
- Frontend handles price fetching via DIA Oracle
- Well-organized, professional contract structure

### **Technology Stack:**
- **Contracts**: Clarity smart contracts on Stacks blockchain
- **Backend**: Existing Node.js/TypeScript system with MongoDB
- **Frontend**: React/Next.js with wallet integration
- **Event Monitoring**: Chainhook for real-time blockchain events
- **Price Feeds**: DIA Oracle via frontend

---

## 🏗️ **Architecture Analysis**

### **Separation of Concerns:**

#### **✅ Smart Contracts Should Handle:**
- STX payment processing with escrow
- Merchant validation and authorization
- Fee collection and distribution
- Payment state tracking (pending/confirmed/refunded/failed)
- Event emission via `print` statements for Chainhook

#### **✅ Backend Should Handle:**
- Merchant registration and KYC
- API key management
- Business logic and workflows
- Database operations
- Webhook delivery
- External API integrations

#### **✅ Frontend Should Handle:**
- Price fetching via DIA Oracle
- USD→STX conversion calculations
- Wallet connections and transactions
- Real-time UI updates
- User experience flows

### **Event Emission Pattern:**
```clarity
;; Standard Clarity event emission using print
(print {
    topic: "payment-created",
    payment-id: payment-id,
    merchant: merchant,
    payer: tx-sender,
    amount: amount,
    block-height: stacks-block-height
})
```

**Key Finding**: `print` is the standard and correct way to emit events in Clarity contracts. This is confirmed by:
- Official sBTC contracts use this pattern
- Chainhook has specific `"print_event"` scope for monitoring
- No alternative event system exists in Clarity

---

## 🔐 **Unique Address Pattern**

### **Pattern Discovery:**
From StacksPay documentation analysis, we discovered the requirement for **unique addresses per payment** instead of static merchant addresses.

### **Traditional vs. Unique Address Approach:**

#### **❌ Traditional Approach:**
```
Customer A → Merchant Address (ST123...)
Customer B → Merchant Address (ST123...) // Same address!
Customer C → Merchant Address (ST123...)
```
**Problems**: Payment confusion, no isolation, tracking difficulties

#### **✅ Unique Address Approach:**
```
Customer A → Unique Address A (ST456...)
Customer B → Unique Address B (ST789...)
Customer C → Unique Address C (ST012...)
```
**Benefits**: Payment isolation, better tracking, merchant privacy

### **How Money Flows:**
```
Customer → Unique Generated Address → Backend Detection → Contract Processing → Merchant Address
```

---

## ⚖️ **Implementation Options**

We analyzed two main approaches for implementing unique addresses:

### **Option 1: Contract-Based Address Generation**

#### **How It Works:**
```clarity
;; Contract derives unique addresses using deterministic functions
(define-private (generate-payment-address (payment-id (string-ascii 64)) (salt uint))
    ;; Uses contract's principal + payment-id + salt to create unique address
)
```

#### **Money Flow:**
```
Customer → Contract-Derived Address → Contract Logic → Merchant Address
```

#### **❌ Cons of Option 1:**
1. **Complex Address Derivation**: Clarity lacks built-in address derivation functions
2. **Private Key Management**: Contract needs to securely control multiple addresses
3. **Higher Gas Costs**: Every payment requires additional contract calls
4. **Limited Flexibility**: Hard to modify address generation logic post-deployment
5. **Technical Complexity**: Much harder to implement and debug
6. **Wallet Support Issues**: Some wallets may not recognize derived addresses
7. **Security Risks**: Complex key management within contract

### **Option 2: Off-Chain Address Generation (Recommended)**

#### **How It Works:**
```typescript
// Backend generates unique Stacks addresses
const generatePaymentAddress = (paymentId: string, merchantId: string) => {
    const privateKey = generateNewPrivateKey();
    const address = getAddressFromPrivateKey(privateKey);
    
    // Store securely (encrypted)
    await storePaymentKeys(paymentId, privateKey, address);
    return address;
}
```

#### **Money Flow:**
```
Customer → Unique Generated Address → Backend Detection → Contract Processing → Merchant Address
```

#### **✅ Pros of Option 2:**
1. **Simpler Implementation**: Standard address generation in backend
2. **Better Security**: Private keys managed by secure backend systems
3. **Lower Gas Costs**: Fewer on-chain operations required
4. **High Flexibility**: Easy to change address generation logic
5. **Better Monitoring**: Easier tracking with existing tools
6. **Proven Pattern**: How most payment gateways actually work
7. **Wallet Compatibility**: Standard Stacks addresses work everywhere

---

## 🛡️ **Security Considerations**

### **Address Generation Reality:**

#### **Key Finding: Anyone Can Generate Valid Addresses**
```typescript
// This is completely valid and by design:
const privateKey = generateRandomPrivateKey(); // Random 256-bit number
const publicKey = getPublicKeyFromPrivate(privateKey);
const address = getAddressFromPublicKey(publicKey); // Valid Stacks address
```

#### **Why This is Secure:**
- **Address Generation ≠ Address Control**
- **Only private key holder can spend from address**
- **Deterministic process**: Private Key → Public Key → Address

#### **Security Model:**
```
Having an address ≠ Controlling an address
You need the private key to sign transactions
```

### **Payment Security Flow:**
1. **Backend generates** unique address + private key
2. **Customer sends** STX to unique address
3. **Only backend** can move funds (has private key)
4. **Quick settlement** to merchant minimizes risk
5. **Private key discarded** after settlement

### **Risk Mitigation:**
- **Secure private key storage** (encrypted in database)
- **Quick settlement** (minimize exposure time)
- **No key reuse** (fresh address per payment)
- **Backend security** (proper access controls)

---

## 🚀 **Final Implementation Strategy**

### **Contract Architecture:**
```clarity
;; Core STX Payment Gateway Contract
contracts/
├── stx-payment-gateway.clar    // Main payment processing
├── payment-escrow.clar         // Escrow and settlement logic
├── fee-manager.clar           // Fee calculation and distribution
└── payment-registry.clar      // Payment tracking and analytics
```

### **Payment Flow:**

#### **Step 1: Payment Initiation**
```typescript
// Frontend: User wants to pay $25
// Frontend: Fetches STX/USD rate via DIA Oracle
// Frontend: Calculates STX amount needed
// Frontend: Calls backend to create payment
```

#### **Step 2: Address Generation**
```typescript
// Backend generates unique address
const paymentAddress = generateUniqueStacksAddress();
const privateKey = getPrivateKeyForAddress(paymentAddress);

// Store in database
await db.payments.create({
    paymentId: "pay_123",
    merchantId: "merchant_abc",
    uniqueAddress: paymentAddress,
    amount: calculatedSTXAmount,
    status: "pending"
});
```

#### **Step 3: Contract Registration**
```clarity
;; Contract tracks unique addresses
(define-map payment-addresses
    { address: principal }
    {
        payment-id: (string-ascii 64),
        merchant: principal,
        amount: uint,
        status: (string-ascii 20)
    }
)
```

#### **Step 4: Customer Payment**
```typescript
// Customer pays to unique address
// Chainhook monitors for payment
const chainhookPredicate = {
    scope: "stx_event",
    actions: ["transfer"],
    recipient: paymentAddress
}
```

#### **Step 5: Settlement**
```clarity
;; Contract processes settlement
(define-public (settle-payment (payment-address principal))
    ;; Validate payment received
    ;; Transfer to merchant
    ;; Emit completion events
)
```

### **Event Monitoring:**
```json
{
    "scope": "print_event",
    "contract_identifier": "ST123...stx-payment-gateway",
    "contains": "payment-"
}
```

---

## 🔍 **Technical Findings**

### **Clarity Event Emission:**
- **✅ Confirmed**: `print` is the standard way to emit events
- **✅ Chainhook Support**: Specific `print_event` scope exists
- **✅ Production Usage**: All sBTC contracts use this pattern

### **Address Generation:**
- **✅ Valid**: Anyone can generate valid blockchain addresses
- **✅ Secure**: Only private key holder controls the address
- **✅ Standard**: This is how all payment processors work

### **Architecture Decisions:**
- **✅ Off-chain address generation** (Option 2) is superior
- **✅ Frontend price fetching** via DIA Oracle
- **✅ Backend handles** business logic and key management
- **✅ Contracts handle** core payment processing only

### **Integration Points:**
- **Chainhook** for real-time event monitoring
- **DIA Oracle** for accurate price feeds
- **Existing backend** for merchant management
- **Stacks blockchain** for secure payment processing

---

## 📋 **Implementation Checklist**

### **Phase 1: Core STX Payment Contract**
- [x] Create `stx-payment-gateway.clar` with escrow functionality
- [ ] Implement unique address tracking
- [ ] Add comprehensive event emission
- [ ] Write comprehensive tests

### **Phase 2: Backend Integration**
- [ ] Implement unique address generation
- [ ] Set up secure private key storage
- [ ] Configure Chainhook event monitoring
- [ ] Update existing merchant management

### **Phase 3: Frontend Integration**
- [ ] Integrate DIA Oracle price fetching
- [ ] Update payment flows for unique addresses
- [ ] Add real-time payment status updates

### **Phase 4: Testing & Deployment**
- [ ] Comprehensive testing on testnet
- [ ] Security audit of private key management
- [ ] Performance testing with Chainhook
- [ ] Mainnet deployment

### **Phase 5: sBTC Integration (Future)**
- [ ] Add sBTC contract support
- [ ] Implement cross-chain swaps
- [ ] Extend Chainhook predicates

---

## 🎯 **Key Code Examples**

### **Contract Event Emission:**
```clarity
;; Payment created event
(print {
    topic: "payment-created",
    payment-id: payment-id,
    merchant: merchant,
    payer: tx-sender,
    amount: amount,
    unique-address: payment-address,
    expires-at: expiry-block,
    block-height: stacks-block-height
})

;; Payment confirmed event
(print {
    topic: "payment-confirmed",
    payment-id: payment-id,
    merchant: merchant,
    payer: payer,
    amount: total-amount,
    fee-amount: fee-amount,
    net-amount: net-amount,
    confirmed-by: tx-sender,
    block-height: stacks-block-height
})
```

### **Backend Address Generation:**
```typescript
import { generateNewPrivateKey, getAddressFromPrivateKey } from '@stacks/wallet-sdk';
import { encrypt } from './crypto-utils';

export const generatePaymentAddress = async (paymentId: string): Promise<{
    address: string;
    encryptedPrivateKey: string;
}> => {
    // Generate new keypair
    const privateKey = generateNewPrivateKey();
    const address = getAddressFromPrivateKey(privateKey);
    
    // Encrypt private key for storage
    const encryptedPrivateKey = encrypt(privateKey, process.env.ENCRYPTION_KEY);
    
    return {
        address,
        encryptedPrivateKey
    };
};
```

### **Chainhook Predicate:**
```json
{
    "chain": "stacks",
    "uuid": "payment-monitor-12345",
    "name": "Monitor STX payments to unique addresses",
    "version": 1,
    "networks": {
        "testnet": {
            "if_this": {
                "scope": "stx_event",
                "actions": ["transfer"]
            },
            "then_that": {
                "http_post": {
                    "url": "https://your-gateway.com/webhooks/payment-received",
                    "authorization_header": "Bearer your-webhook-secret"
                }
            }
        }
    }
}
```

### **Settlement Flow:**
```typescript
// Backend settlement after receiving Chainhook notification
export const settlePayment = async (paymentId: string, txId: string) => {
    const payment = await db.payments.findOne({ paymentId });
    if (!payment) throw new Error('Payment not found');
    
    // Decrypt private key
    const privateKey = decrypt(payment.encryptedPrivateKey, process.env.ENCRYPTION_KEY);
    
    // Create settlement transaction
    const settlementTx = await makeSTXTokenTransfer({
        recipient: payment.merchantAddress,
        amount: payment.amount,
        senderKey: privateKey,
        network: stacksNetwork,
        memo: `Settlement for payment ${paymentId}`
    });
    
    // Broadcast settlement
    const result = await broadcastTransaction(settlementTx, stacksNetwork);
    
    // Update payment status
    await db.payments.updateOne(
        { paymentId },
        { 
            status: 'settled',
            settlementTxId: result.txid,
            settledAt: new Date()
        }
    );
    
    // Clean up private key
    await db.payments.updateOne(
        { paymentId },
        { $unset: { encryptedPrivateKey: 1 } }
    );
};
```

---

## 🎯 **Conclusion**

This documentation captures our complete analysis and decision-making process for building a professional STX payment gateway. The chosen architecture provides:

- **Security**: Proper private key management and payment isolation
- **Scalability**: Clean separation of concerns and modular design  
- **Flexibility**: Easy to extend for sBTC and additional features
- **Reliability**: Real-time monitoring with Chainhook integration
- **Compliance**: Unique addresses per payment for proper tracking

The implementation follows industry best practices while leveraging the unique capabilities of the Stacks blockchain and existing project infrastructure.

---

*Generated: 2025-01-27*  
*Version: 1.0*  
*Status: Implementation Ready*