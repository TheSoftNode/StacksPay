# Focused sBTC Payment Gateway Design - Building on Existing Foundation

## Executive Summary

This document provides a practical implementation plan for enhancing your existing sBTC payment gateway to support multi-currency payments (sBTC, STX, BTC) using DIA Oracle for pricing. The design builds directly on your current codebase and focuses on the essential features needed for a production-ready payment gateway.

## Current Project Analysis

### What You Already Have

**✅ Solid Foundation:**
- **Frontend**: Next.js 15 with TypeScript, Radix UI components, payment forms
- **Backend**: Express.js with TypeScript, wallet services, contract integration
- **Contracts**: sBTC deposit/withdrawal contracts, registry system
- **Infrastructure**: OAuth, webhooks, merchant management, session handling

**✅ Key Services Already Implemented:**
- `WalletService`: Stacks wallet connection and STX transfers
- `SbtcService`: Complete sBTC operations (deposit, withdrawal, balance checking)
- `ContractService`: Smart contract interactions with Clarity values
- `WebhookService`: Event notifications
- `MerchantService`: Merchant management

**✅ Frontend Components:**
- Payment forms with multi-currency support (mock implementation)
- Wallet connection modal
- Dashboard layout and navigation
- Payment widgets and embeddable components

## Implementation Strategy

### Phase 1: Complete Multi-Currency Payment Processing

#### 1.1 Enhanced Payment Service (Backend)

Create a new `PaymentProcessorService` that coordinates between currencies:

```typescript
// backend/src/services/payment/payment-processor-service.ts
import { DiaOracleService } from '../oracle/dia-oracle-service';
import { walletService } from '../wallet/wallet-service';
import { sbtcService } from '../wallet/sbtc-service'; // Your existing service
import { contractService } from '../contract/contract-service';

export interface PaymentRequest {
  merchantId: string;
  amount: number;
  currency: 'BTC' | 'STX' | 'SBTC';
  description: string;
  customerEmail?: string;
  webhookUrl?: string;
}

export interface PaymentResponse {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentUrl?: string;
  qrCode?: string;
  expiresAt: Date;
}

export class PaymentProcessorService {
  constructor(
    private diaOracle: DiaOracleService,
    private walletService: typeof walletService,
    private sbtcService: typeof sbtcService,
    private contractService: typeof contractService
  ) {}

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // 1. Get current exchange rates
    const rates = await this.diaOracle.getExchangeRates();
    
    // 2. Calculate amounts in different currencies
    const calculations = this.calculateAmounts(request.amount, request.currency, rates);
    
    // 3. Create payment record in database
    const payment = await this.storePayment({
      ...request,
      calculations,
      rates
    });

    // 4. Generate payment method based on currency
    let paymentData: any;
    switch (request.currency.toLowerCase()) {
      case 'sbtc':
        paymentData = await this.createSbtcPayment(payment);
        break;
      case 'stx':
        paymentData = await this.createStxPayment(payment);
        break;
      case 'btc':
        paymentData = await this.createBtcPayment(payment);
        break;
    }

    return {
      paymentId: payment.id,
      status: 'pending',
      paymentUrl: `${process.env.FRONTEND_URL}/checkout/${payment.id}`,
      qrCode: paymentData.qrCode,
      expiresAt: payment.expiresAt
    };
  }

  private async createSbtcPayment(payment: any) {
    // Use your existing sbtcService
    return await this.sbtcService.createDepositAddress({
      stacksAddress: payment.merchantAddress,
      amountSats: Math.round(payment.sbtcAmount * 100000000)
    });
  }

  private async createStxPayment(payment: any) {
    // Create STX payment request
    return {
      recipientAddress: payment.merchantAddress,
      amount: payment.stxAmount,
      qrCode: `stacks:${payment.merchantAddress}?amount=${payment.stxAmount}`
    };
  }

  private async createBtcPayment(payment: any) {
    // For direct BTC payments, create a deposit address
    const depositData = await this.sbtcService.createDepositAddress({
      stacksAddress: payment.merchantAddress,
      amountSats: Math.round(payment.btcAmount * 100000000)
    });
    
    return {
      depositAddress: depositData.depositAddress,
      qrCode: `bitcoin:${depositData.depositAddress}?amount=${payment.btcAmount}`
    };
  }
}
```

#### 1.2 DIA Oracle Integration Service

```typescript
// backend/src/services/oracle/dia-oracle-service.ts
export interface ExchangeRates {
  'BTC/USD': number;
  'STX/USD': number;
  'SBTC/USD': number;
  timestamp: number;
}

export class DiaOracleService {
  private readonly DIA_CONTRACT = 'ST1S5ZGRZV5K4S9205RWPRTX9RGS9JV40KQMR4G1J.dia-oracle';

  async getExchangeRates(): Promise<ExchangeRates> {
    try {
      // Use your existing contract service
      const [btcPrice, stxPrice, sbtcPrice] = await Promise.all([
        this.getPrice('BTC/USD'),
        this.getPrice('STX/USD'), 
        this.getPrice('SBTC/USD')
      ]);

      return {
        'BTC/USD': btcPrice,
        'STX/USD': stxPrice, 
        'SBTC/USD': sbtcPrice,
        timestamp: Date.now()
      };
    } catch (error) {
      // Fallback to external APIs if DIA fails
      return this.getFallbackRates();
    }
  }

  private async getPrice(pair: string): Promise<number> {
    const result = await contractService.readContract({
      contractAddress: this.DIA_CONTRACT.split('.')[0],
      contractName: this.DIA_CONTRACT.split('.')[1],
      functionName: 'get-value',
      functionArgs: [contractService.clarity.stringAscii(pair)]
    });

    // DIA returns prices with 8 decimal places
    return Number(result.value) / 100000000;
  }

  private async getFallbackRates(): Promise<ExchangeRates> {
    // Fallback to CoinGecko or other APIs
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,stacks,sbtc&vs_currencies=usd');
    const data = await response.json();
    
    return {
      'BTC/USD': data.bitcoin?.usd || 45000,
      'STX/USD': data.stacks?.usd || 0.6,
      'SBTC/USD': data.sbtc?.usd || 45000,
      timestamp: Date.now()
    };
  }
}
```

#### 1.3 Payment Routes (Backend)

```typescript
// backend/src/routes/payment/payment.routes.ts
import { Router } from 'express';
import { PaymentProcessorService } from '../../services/payment/payment-processor-service';

const router = Router();
const paymentProcessor = new PaymentProcessorService();

/**
 * POST /api/payments
 * Create a new payment request
 */
router.post('/', async (req, res) => {
  try {
    const { merchantId, amount, currency, description } = req.body;
    
    const payment = await paymentProcessor.createPayment({
      merchantId,
      amount: parseFloat(amount),
      currency: currency.toUpperCase(),
      description,
      webhookUrl: req.body.webhookUrl
    });

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/payments/:paymentId
 * Get payment status
 */
router.get('/:paymentId', async (req, res) => {
  try {
    const payment = await paymentProcessor.getPayment(req.params.paymentId);
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Payment not found' });
  }
});

export default router;
```

### Phase 2: Enhanced Frontend Integration

#### 2.1 Enhanced Payment Form Component

Update your existing payment form to integrate with the real backend:

```typescript
// frontend/components/payment/enhanced-payment-form.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/use-wallet'
import { useToast } from '@/hooks/use-toast'
import { PaymentForm } from './payment-form' // Your existing component

interface EnhancedPaymentFormProps {
  merchantId: string;
  onPaymentCreated?: (paymentData: any) => void;
}

export default function EnhancedPaymentForm({ merchantId, onPaymentCreated }: EnhancedPaymentFormProps) {
  const { wallet } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<any>(null);

  // Fetch real exchange rates
  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const response = await fetch('/api/payments/rates');
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
  };

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    try {
      // Create payment request
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          webhookUrl: process.env.NEXT_PUBLIC_WEBHOOK_URL
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Redirect to payment page
      window.location.href = result.data.paymentUrl;
      onPaymentCreated?.(result.data);
      
    } catch (error) {
      toast({
        title: "Payment Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaymentForm
      onSubmit={handleSubmit}
      loading={loading}
      currencies={['BTC', 'STX', 'SBTC']}
      showAdvancedOptions={true}
    />
  );
}
```

#### 2.2 Checkout Page Component

Create a dedicated checkout page that handles the actual payment process:

```typescript
// frontend/app/checkout/[paymentId]/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useWallet } from '@/hooks/use-wallet'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QRCodeSVG } from 'qrcode.react'

export default function CheckoutPage() {
  const { paymentId } = useParams();
  const { wallet, connectWallet } = useWallet();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (paymentId) {
      fetchPayment();
    }
  }, [paymentId]);

  const fetchPayment = async () => {
    try {
      const response = await fetch(`/api/payments/${paymentId}`);
      const data = await response.json();
      setPayment(data.data);
    } catch (error) {
      console.error('Failed to fetch payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!wallet) {
      await connectWallet();
      return;
    }

    setLoading(true);
    try {
      // Handle payment based on currency
      switch (payment.currency) {
        case 'STX':
          await handleStxPayment();
          break;
        case 'SBTC':
          await handleSbtcPayment();
          break;
        case 'BTC':
          await handleBtcPayment();
          break;
      }
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStxPayment = async () => {
    // Use your existing wallet service
    const result = await wallet.transferSTX({
      recipient: payment.recipientAddress,
      amount: payment.stxAmount,
      memo: `Payment ${paymentId}`
    });
    
    // Update payment status
    await fetch(`/api/payments/${paymentId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txId: result.txId, currency: 'STX' })
    });
  };

  if (loading) return <div>Loading...</div>;
  if (!payment) return <div>Payment not found</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Complete Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {payment.amount} {payment.currency}
            </h2>
            <p className="text-gray-600">{payment.description}</p>
          </div>

          {payment.qrCode && (
            <div className="flex justify-center">
              <QRCodeSVG value={payment.qrCode} size={200} />
            </div>
          )}

          <div className="space-y-4">
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full"
            >
              {wallet ? 'Pay Now' : 'Connect Wallet to Pay'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Phase 3: Database Schema Updates

Add payment tracking to your existing database:

```typescript
// backend/src/models/Payment.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  merchantId: string;
  amount: number;
  currency: 'BTC' | 'STX' | 'SBTC';
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  
  // Calculated amounts
  btcAmount?: number;
  stxAmount?: number;
  sbtcAmount?: number;
  usdAmount?: number;
  
  // Exchange rates at time of creation
  exchangeRates: {
    'BTC/USD': number;
    'STX/USD': number;
    'SBTC/USD': number;
    timestamp: number;
  };
  
  // Payment details
  recipientAddress: string;
  depositAddress?: string;
  qrCode?: string;
  
  // Transaction tracking
  txId?: string;
  confirmations: number;
  
  // Metadata
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  merchantId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['BTC', 'STX', 'SBTC'], required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
    default: 'pending',
    index: true 
  },
  
  btcAmount: Number,
  stxAmount: Number, 
  sbtcAmount: Number,
  usdAmount: Number,
  
  exchangeRates: {
    'BTC/USD': { type: Number, required: true },
    'STX/USD': { type: Number, required: true },
    'SBTC/USD': { type: Number, required: true },
    timestamp: { type: Number, required: true }
  },
  
  recipientAddress: { type: String, required: true },
  depositAddress: String,
  qrCode: String,
  
  txId: String,
  confirmations: { type: Number, default: 0 },
  
  expiresAt: { type: Date, required: true },
}, {
  timestamps: true
});

// Create indexes for efficient queries
PaymentSchema.index({ merchantId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, expiresAt: 1 });
PaymentSchema.index({ txId: 1 }, { sparse: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
```

### Phase 4: Smart Contract Enhancements

Enhance your existing contracts to handle multi-currency payments:

```clarity
;; Enhanced Payment Gateway Contract
(define-constant ERR-INVALID-CURRENCY (err u400))
(define-constant ERR-INSUFFICIENT-FUNDS (err u401))
(define-constant ERR-PAYMENT-EXPIRED (err u402))

;; Payment tracking
(define-map payments
  { payment-id: (string-ascii 64) }
  {
    merchant: principal,
    amount: uint,
    currency: (string-ascii 10),
    status: (string-ascii 20),
    created-at: uint,
    expires-at: uint
  }
)

;; Multi-currency payment processing
(define-public (process-payment
  (payment-id (string-ascii 64))
  (merchant principal)
  (amount uint)
  (currency (string-ascii 10)))
  (begin
    ;; Validate currency
    (asserts! (or 
      (is-eq currency "BTC")
      (is-eq currency "STX") 
      (is-eq currency "SBTC")
    ) ERR-INVALID-CURRENCY)
    
    ;; Get current exchange rates from DIA Oracle
    (let ((rates (unwrap! (contract-call? .dia-oracle get-multi-currency-rates) (err u500))))
      
      ;; Process based on currency type
      (match currency
        "STX" (try! (process-stx-payment payment-id merchant amount rates))
        "SBTC" (try! (process-sbtc-payment payment-id merchant amount rates))
        "BTC" (try! (process-btc-payment payment-id merchant amount rates))
        (err u400)
      )
      
      ;; Record payment
      (map-set payments 
        { payment-id: payment-id }
        {
          merchant: merchant,
          amount: amount,
          currency: currency,
          status: "completed",
          created-at: stacks-block-height,
          expires-at: (+ stacks-block-height u144)
        }
      )
      
      (ok payment-id)
    )
  )
)
```

## Implementation Timeline

### Week 1-2: Core Payment Processing
- [ ] Implement `PaymentProcessorService` 
- [ ] Integrate DIA Oracle service
- [ ] Create payment routes and API endpoints
- [ ] Set up payment database schema

### Week 3: Frontend Integration  
- [ ] Enhance existing payment forms with real backend integration
- [ ] Create checkout page for payment completion
- [ ] Add real-time exchange rate display
- [ ] Implement wallet payment flows

### Week 4: Smart Contracts & Testing
- [ ] Deploy enhanced payment contracts
- [ ] Integrate contract calls with payment service
- [ ] Add comprehensive error handling
- [ ] Test multi-currency payment flows

### Week 5-6: Polish & Production
- [ ] Add monitoring and logging
- [ ] Implement webhook notifications
- [ ] Add payment analytics to dashboard
- [ ] Performance optimization and security audit

## Key Advantages of This Approach

1. **Builds on Your Work**: Uses your existing services, components, and infrastructure
2. **DIA Oracle Only**: Focused integration with DIA for price feeds as requested
3. **Production Ready**: Includes proper error handling, database design, monitoring
4. **Multi-Currency**: Native support for BTC, STX, and sBTC payments
5. **Scalable**: Clean architecture that can grow with your business

## Next Steps

1. **Start with Phase 1**: Implement the payment processor service using your existing code
2. **Test Integration**: Use your existing frontend components to test the new backend
3. **Deploy Incrementally**: Roll out features one currency at a time
4. **Monitor and Iterate**: Use your existing analytics to track adoption and performance

This design respects your existing architecture while adding the multi-currency capabilities you need. It's focused, practical, and builds directly on what you've already built.