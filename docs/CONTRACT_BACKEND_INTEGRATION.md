# 🔄 **Contract + Backend Integration - Complete Flow Documentation**

## Overview

This document explains exactly how the STX Payment Gateway contract works together with the backend to process payments using unique addresses per payment.

---

## 🔄 **How Contract + Backend Work Together**

### **🤔 The Problem We're Solving:**
```
Customer pays to unique address → How does money get to merchant?
```

### **💡 The Solution - Contract as Payment Coordinator:**

## **1. Contract's Role (The Coordinator)**

#### **What Contract Does:**
- **Tracks payments** (who should pay what, where)
- **Validates payments** (right amount, right address)
- **Records settlements** (fee calculations, payment completion)
- **Emits events** for monitoring
- **Authorizes actions** (only backend can trigger settlements)

#### **What Contract CANNOT Do:**
- ❌ Cannot generate unique addresses (no private keys)
- ❌ Cannot move STX from unique addresses (no private keys)
- ❌ Cannot detect payments automatically (no monitoring capability)

## **2. Backend's Role (The Executor)**

#### **What Backend Does:**
- **Generates unique addresses** + stores private keys
- **Monitors blockchain** via Chainhook
- **Moves actual STX** using stored private keys  
- **Calls contract functions** to coordinate state

## **3. The Complete Flow:**

### **Step 1: Payment Setup**
```typescript
// Backend generates unique address
const { address, privateKey } = generateUniqueAddress();

// Backend calls contract to register the payment
await contractCall('register-payment', [
    'pay_123',           // payment-id
    merchantAddress,     // merchant
    address,            // unique address
    1000000,            // expected amount
    'Coffee order',     // metadata
    144                 // expiry
]);

// Contract stores: "payment pay_123 expects 1 STX at address ST456..."
```

### **Step 2: Customer Payment**
```typescript
// Customer sends 1 STX to unique address ST456...
// Chainhook detects payment and notifies backend

// Backend receives webhook:
{
    recipient: "ST456...", // the unique address
    amount: 1000000,       // 1 STX
    txId: "0xabc..."
}
```

### **Step 3: Backend Processes Payment**
```typescript
// Backend confirms with contract
await contractCall('confirm-payment-received', [
    'pay_123',      // payment-id  
    1000000,        // received amount
    '0xabc...'      // tx-id
]);

// Contract validates and updates status: "pay_123 is confirmed"
```

### **Step 4: Backend Settles Payment**
```typescript
// Backend calls contract to calculate settlement
const settlement = await contractCall('settle-payment', ['pay_123']);
// Returns: { fee: 25000, netAmount: 975000 }

// Backend uses stored private key to transfer funds
await transferSTX({
    from: uniqueAddress,        // ST456...
    to: merchantAddress,        // ST789...
    amount: 975000,            // net amount
    privateKey: storedPrivateKey
});

// Backend updates contract with actual tx
await contractCall('update-settlement-tx', [
    settlement.settlementId,
    '0xdef...'  // settlement transaction ID
]);
```

## **🎯 Why Both Are Needed:**

### **Contract Provides:**
- ✅ **Trust & Transparency**: All payments recorded on-chain
- ✅ **Fee Calculation**: Automatic merchant fee calculation
- ✅ **Authorization**: Only authorized actions allowed
- ✅ **Event Logging**: Real-time payment tracking
- ✅ **State Management**: Clear payment status tracking

### **Backend Provides:**
- ✅ **Private Key Management**: Secure key storage
- ✅ **Address Generation**: Creates unique addresses
- ✅ **Blockchain Monitoring**: Watches for payments
- ✅ **Fund Movement**: Actually transfers STX
- ✅ **Business Logic**: Complex processing workflows

## **🔍 Detailed Example:**

### **Contract State After Registration:**
```clarity
;; payments map
{
    payment-id: "pay_123",
    merchant: ST789...,
    unique-address: ST456...,
    expected-amount: 1000000,
    status: "pending"
}

;; payment-addresses map  
{
    address: ST456...,
    payment-id: "pay_123",
    merchant: ST789...,
    expected-amount: 1000000,
    status: "pending"
}
```

### **After Customer Payment:**
```typescript
// Chainhook detects: 1 STX sent to ST456...
// Backend looks up: "ST456... belongs to payment pay_123"
// Backend calls contract: confirm-payment-received
```

### **Contract State After Confirmation:**
```clarity
{
    payment-id: "pay_123",
    received-amount: 1000000,  // ✅ Updated
    status: "confirmed"        // ✅ Updated
}
```

### **Backend Settlement:**
```typescript
// Backend gets settlement details from contract
const { feeAmount, netAmount } = await settle-payment('pay_123');

// Backend transfers using private key
await stxTransfer({
    from: 'ST456...',     // unique address
    to: 'ST789...',       // merchant address  
    amount: netAmount,
    key: storedPrivateKey // Only backend has this!
});
```

## **🤝 The Partnership:**

**Contract = The Accountant**
- Keeps books
- Calculates fees  
- Validates everything
- Records all transactions

**Backend = The Bank Teller**
- Holds the keys
- Moves the money
- Watches for deposits
- Executes the transfers

**Together they create a secure, transparent payment system where:**
- Contract ensures trust and proper accounting
- Backend handles the actual money movement
- Neither can work alone - both are essential

---

## **🔧 Technical Implementation Details**

### **Contract Functions:**

#### **1. register-payment**
```clarity
(define-public (register-payment 
    (payment-id (string-ascii 64))
    (merchant principal)
    (unique-address principal)
    (expected-amount uint)
    (metadata (string-ascii 256))
    (expires-in-blocks uint))
```
**Purpose**: Register a new payment with unique address  
**Caller**: Only authorized backend  
**Effect**: Creates payment record and address mapping

#### **2. confirm-payment-received**
```clarity
(define-public (confirm-payment-received 
    (payment-id (string-ascii 64))
    (received-amount uint)
    (tx-id (buff 32)))
```
**Purpose**: Confirm payment received at unique address  
**Caller**: Only authorized backend  
**Effect**: Updates payment status to "confirmed"

#### **3. settle-payment**
```clarity
(define-public (settle-payment (payment-id (string-ascii 64)))
```
**Purpose**: Calculate fees and mark payment as settled  
**Caller**: Only authorized backend  
**Effect**: Records settlement and emits events

#### **4. update-settlement-tx**
```clarity
(define-public (update-settlement-tx (settlement-id uint) (tx-id (buff 32)))
```
**Purpose**: Record actual settlement transaction ID  
**Caller**: Only authorized backend  
**Effect**: Updates settlement record with tx ID

### **Backend Implementation:**

#### **1. Address Generation Service**
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

#### **2. Payment Registration Service**
```typescript
export const createPayment = async (
    merchantId: string,
    expectedAmount: number,
    metadata: string
): Promise<{
    paymentId: string;
    uniqueAddress: string;
}> => {
    // Generate payment ID
    const paymentId = `pay_${uuidv4()}`;
    
    // Generate unique address
    const { address, encryptedPrivateKey } = await generatePaymentAddress(paymentId);
    
    // Store in database
    await db.payments.create({
        paymentId,
        merchantId,
        uniqueAddress: address,
        encryptedPrivateKey,
        expectedAmount,
        status: 'pending',
        metadata,
        createdAt: new Date()
    });
    
    // Register with contract
    await contractCall('register-payment', [
        paymentId,
        merchantId,
        address,
        expectedAmount,
        metadata,
        144 // 24 hours expiry
    ]);
    
    return {
        paymentId,
        uniqueAddress: address
    };
};
```

#### **3. Chainhook Integration**
```typescript
// Chainhook predicate for monitoring STX transfers
const chainhookPredicate = {
    chain: "stacks",
    uuid: "stx-payment-monitor",
    name: "Monitor STX payments to unique addresses",
    version: 1,
    networks: {
        testnet: {
            if_this: {
                scope: "stx_event",
                actions: ["transfer"]
            },
            then_that: {
                http_post: {
                    url: "https://your-gateway.com/webhooks/payment-received",
                    authorization_header: "Bearer your-webhook-secret"
                }
            }
        }
    }
};

// Webhook handler
export const handlePaymentReceived = async (req: Request, res: Response) => {
    const { apply } = req.body; // Chainhook event format
    
    for (const block of apply) {
        for (const tx of block.transactions) {
            for (const event of tx.operations) {
                if (event.type === 'stx_transfer_event') {
                    const { recipient, amount, sender } = event.data;
                    
                    // Check if this is a payment to one of our unique addresses
                    const payment = await db.payments.findOne({ 
                        uniqueAddress: recipient,
                        status: 'pending'
                    });
                    
                    if (payment) {
                        await processPaymentReceived(payment.paymentId, amount, tx.tx_id);
                    }
                }
            }
        }
    }
    
    res.status(200).send('OK');
};
```

#### **4. Settlement Service**
```typescript
export const settlePayment = async (paymentId: string) => {
    const payment = await db.payments.findOne({ paymentId });
    if (!payment) throw new Error('Payment not found');
    
    // Confirm payment with contract
    await contractCall('confirm-payment-received', [
        paymentId,
        payment.receivedAmount,
        payment.receiveTxId
    ]);
    
    // Get settlement details from contract
    const settlement = await contractCall('settle-payment', [paymentId]);
    
    // Decrypt private key
    const privateKey = decrypt(payment.encryptedPrivateKey, process.env.ENCRYPTION_KEY);
    
    // Create settlement transaction
    const settlementTx = await makeSTXTokenTransfer({
        recipient: payment.merchantAddress,
        amount: settlement.netAmount,
        senderKey: privateKey,
        network: stacksNetwork,
        memo: `Settlement for payment ${paymentId}`
    });
    
    // Broadcast settlement
    const result = await broadcastTransaction(settlementTx, stacksNetwork);
    
    // Update contract with settlement TX
    await contractCall('update-settlement-tx', [
        settlement.settlementId,
        result.txid
    ]);
    
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

### **Event Flow:**

#### **Contract Events Emitted:**
```clarity
;; When payment is registered
{
    topic: "payment-registered",
    payment-id: "pay_123",
    merchant: "ST789...",
    unique-address: "ST456...",
    expected-amount: 1000000,
    block-height: 12345
}

;; When payment is confirmed
{
    topic: "payment-confirmed", 
    payment-id: "pay_123",
    received-amount: 1000000,
    tx-id: "0xabc...",
    block-height: 12350
}

;; When payment is settled
{
    topic: "payment-settled",
    payment-id: "pay_123",
    settlement-id: 1,
    fee-amount: 25000,
    net-amount: 975000,
    block-height: 12355
}
```

#### **Backend Event Processing:**
```typescript
// Monitor contract events via Chainhook
const contractEventPredicate = {
    scope: "print_event",
    contract_identifier: "ST123...stx-payment-gateway",
    contains: "payment-"
};

// Process contract events
export const handleContractEvent = async (event: any) => {
    const { topic, ...data } = event;
    
    switch (topic) {
        case 'payment-registered':
            await updatePaymentStatus(data.paymentId, 'registered');
            break;
            
        case 'payment-confirmed':
            await updatePaymentStatus(data.paymentId, 'confirmed');
            await triggerMerchantWebhook(data.paymentId, 'confirmed');
            break;
            
        case 'payment-settled':
            await updatePaymentStatus(data.paymentId, 'settled');
            await triggerMerchantWebhook(data.paymentId, 'completed');
            break;
    }
};
```

---

## **🎯 Key Benefits of This Architecture:**

### **Security:**
- Private keys managed securely by backend
- Contract validates all operations
- Only authorized backends can trigger settlements
- Transparent on-chain record keeping

### **Reliability:**
- Real-time monitoring via Chainhook
- Automatic settlement processing
- Clear error handling and status tracking
- Event-driven architecture

### **Scalability:**
- Unique addresses prevent payment confusion
- Parallel processing of multiple payments
- Efficient database and contract storage
- Modular component architecture

### **Compliance:**
- Full audit trail on-chain
- Proper fee calculation and collection
- Merchant authorization and validation
- Real-time reporting capabilities

---

*Generated: 2025-01-27*  
*Version: 1.0*  
*Status: Implementation Ready*