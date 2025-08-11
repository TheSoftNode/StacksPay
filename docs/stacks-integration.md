# Stacks Ecosystem Integration Guide

**Building the ultimate Bitcoin payment gateway with Stacks wallets and STX support**

## 🚀 Why Stacks for Hackathon?

### The Perfect Combination

**Traditional Bitcoin payments**:

- ⏰ Slow (10+ minutes)
- 💰 Expensive ($1-5 fees)
- 🔒 Limited functionality

**STX payments with sBTC conversion**:

- ⚡ Fast (6 seconds)
- 💸 Cheap ($0.01 fees)
- 🧠 Smart contracts enabled
- 🔄 Automatic sBTC conversion

### Hackathon Advantages

✅ **Demo-friendly**: Fast transactions for live demos  
✅ **Multi-currency**: Support Bitcoin AND STX  
✅ **Modern UX**: Web3 wallet connections  
✅ **Innovation**: First STX payment gateway  
✅ **Ecosystem**: Leverage existing Stacks DeFi

## 🎯 Architecture Overview

```
Customer Payment Flow:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │  Payment Gateway │    │   Merchant      │
│                 │    │                 │    │                 │
│ 1. Choose STX   │───▶│ 2. Connect Wallet│───▶│ 3. Receive sBTC │
│ 2. Connect Wallet│    │ 3. STX → sBTC   │    │ 4. Fulfill Order│
│ 3. Confirm Pay  │    │ 4. Notify Success│    │ 5. Happy Customer│
└─────────────────┘    └─────────────────┘    └─────────────────┘

Technical Flow:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Stacks Wallet  │    │  Smart Contract  │    │  sBTC Protocol  │
│                 │    │                 │    │                 │
│ 1. Sign STX TX  │───▶│ 2. Execute Swap  │───▶│ 3. Mint sBTC    │
│ 2. Broadcast    │    │ 3. Emit Events   │    │ 4. Transfer     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💼 Supported Wallets

### 1. Xverse Wallet (Recommended)

**Best for**: Mobile users and general consumers  
**Platforms**: iOS, Android, Browser Extension  
**Features**:

- Native Bitcoin + STX support
- Built-in sBTC support
- Easy onboarding
- Mobile-first design

```javascript
// Xverse integration
import { getXverseProvider } from '@xverse/wallet-sdk';

async function connectXverse() {
  const provider = await getXverseProvider();
  const response = await provider.request({
    method: 'stx_requestAccounts',
  });
  return response.accounts[0];
}
```

### 2. Hiro Wallet

**Best for**: Developers and power users  
**Platforms**: Browser Extension, Web  
**Features**:

- Developer-friendly
- Advanced features
- Great for dApp integration
- Extensive documentation

```javascript
// Hiro integration
import { connect } from '@stacks/connect';

async function connectHiro() {
  const userData = await connect({
    appDetails: {
      name: 'sBTC Payment Gateway',
      icon: '/icon.png',
    },
    userSession: new UserSession(),
  });
  return userData;
}
```

### 3. Leather Wallet

**Best for**: Privacy-focused users  
**Platforms**: Browser Extension  
**Features**:

- Privacy-focused
- Clean interface
- Good for web integration
- Formerly Hiro Wallet

```javascript
// Leather integration
async function connectLeather() {
  if (window.LeatherProvider) {
    const response = await window.LeatherProvider.request({
      method: 'stx_requestAccounts',
    });
    return response.result;
  }
}
```

## 🔄 STX to sBTC Conversion Flow

### 1. Smart Contract Architecture

```clarity
;; sBTC Payment Processor Contract
(define-public (process-stx-payment
  (amount uint)
  (merchant-address principal)
  (payment-id (string-ascii 64)))

  (let ((sbtc-amount (calculate-sbtc-amount amount)))
    ;; Transfer STX from customer
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    ;; Convert STX to sBTC via protocol
    (try! (contract-call? .sbtc-protocol convert-stx-to-sbtc amount))

    ;; Transfer sBTC to merchant
    (try! (contract-call? .sbtc-token transfer
      sbtc-amount (as-contract tx-sender) merchant-address none))

    ;; Emit success event
    (print {
      event: "payment-completed",
      payment-id: payment-id,
      stx-amount: amount,
      sbtc-amount: sbtc-amount,
      merchant: merchant-address
    })

    (ok sbtc-amount)))
```

### 2. Real-time Rate Calculation

```javascript
// Get real-time STX/BTC rate
async function getStxToBtcRate() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=stacks&vs_currencies=btc'
  );
  const data = await response.json();
  return data.stacks.btc;
}

// Calculate STX amount needed for USD purchase
async function calculateStxAmount(usdAmount) {
  const stxRate = await getStxToBtcRate();
  const btcRate = await getBtcToUsdRate();

  const btcAmount = usdAmount / btcRate;
  const stxAmount = btcAmount / stxRate;

  return Math.ceil(stxAmount * 1000000); // Convert to microSTX
}
```

### 3. Payment Processing

```javascript
// Process STX payment
async function processStxPayment(paymentDetails) {
  const { amount, merchantAddress, paymentId, customerWallet } = paymentDetails;

  try {
    // 1. Initiate wallet connection
    const wallet = await connectWallet(customerWallet);

    // 2. Prepare transaction
    const txOptions = {
      contractAddress: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
      contractName: 'sbtc-payment-processor',
      functionName: 'process-stx-payment',
      functionArgs: [uintCV(amount), principalCV(merchantAddress), stringAsciiCV(paymentId)],
      network: STACKS_NETWORK,
    };

    // 3. Execute transaction
    const transaction = await makeContractCall(txOptions);
    const txResult = await broadcastTransaction(transaction);

    // 4. Monitor transaction
    const confirmation = await waitForConfirmation(txResult.txid);

    // 5. Return success
    return {
      success: true,
      txid: txResult.txid,
      stxAmount: amount,
      conversionTime: confirmation.time,
    };
  } catch (error) {
    console.error('STX payment failed:', error);
    throw error;
  }
}
```

## 🎨 Frontend Integration

### 1. Wallet Connection Component

```jsx
// WalletConnector.jsx
import React, { useState } from 'react';

const WalletConnector = ({ onConnect }) => {
  const [connecting, setConnecting] = useState(false);

  const wallets = [
    { name: 'Xverse', icon: '/xverse.png', id: 'xverse' },
    { name: 'Hiro', icon: '/hiro.png', id: 'hiro' },
    { name: 'Leather', icon: '/leather.png', id: 'leather' },
  ];

  const handleConnect = async (walletId) => {
    setConnecting(true);
    try {
      let address;

      switch (walletId) {
        case 'xverse':
          address = await connectXverse();
          break;
        case 'hiro':
          address = await connectHiro();
          break;
        case 'leather':
          address = await connectLeather();
          break;
      }

      onConnect({ walletId, address });
    } catch (error) {
      console.error('Wallet connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="wallet-connector">
      <h3>Connect Your Stacks Wallet</h3>
      <div className="wallet-grid">
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            onClick={() => handleConnect(wallet.id)}
            disabled={connecting}
            className="wallet-button"
          >
            <img src={wallet.icon} alt={wallet.name} />
            <span>{wallet.name}</span>
            {connecting && <span>Connecting...</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WalletConnector;
```

### 2. Payment Flow Component

```jsx
// StxPaymentFlow.jsx
import React, { useState, useEffect } from 'react';

const StxPaymentFlow = ({ paymentDetails }) => {
  const [step, setStep] = useState('connect'); // connect, confirm, processing, success
  const [wallet, setWallet] = useState(null);
  const [stxAmount, setStxAmount] = useState(0);

  useEffect(() => {
    // Calculate STX amount needed
    calculateStxAmount(paymentDetails.usdAmount).then(setStxAmount);
  }, [paymentDetails]);

  const handleWalletConnect = (walletInfo) => {
    setWallet(walletInfo);
    setStep('confirm');
  };

  const handlePayment = async () => {
    setStep('processing');

    try {
      const result = await processStxPayment({
        amount: stxAmount,
        merchantAddress: paymentDetails.merchantAddress,
        paymentId: paymentDetails.id,
        customerWallet: wallet.walletId,
      });

      setStep('success');
    } catch (error) {
      console.error('Payment failed:', error);
      setStep('confirm');
    }
  };

  return (
    <div className="stx-payment-flow">
      {step === 'connect' && <WalletConnector onConnect={handleWalletConnect} />}

      {step === 'confirm' && (
        <div className="payment-confirmation">
          <h3>Confirm Payment</h3>
          <div className="payment-details">
            <p>Amount: ${paymentDetails.usdAmount}</p>
            <p>STX Required: {stxAmount / 1000000} STX</p>
            <p>Wallet: {wallet.walletId}</p>
            <p>Address: {wallet.address}</p>
          </div>
          <button onClick={handlePayment}>Pay with STX</button>
        </div>
      )}

      {step === 'processing' && (
        <div className="processing">
          <div className="spinner"></div>
          <p>Processing STX payment...</p>
          <p>Converting to sBTC...</p>
        </div>
      )}

      {step === 'success' && (
        <div className="success">
          <h3>Payment Successful!</h3>
          <p>Your STX has been converted to sBTC</p>
          <p>Order confirmation will be sent shortly</p>
        </div>
      )}
    </div>
  );
};

export default StxPaymentFlow;
```

## 📊 Demo Features for Hackathon

### 1. Real-time Conversion Dashboard

```jsx
// ConversionDashboard.jsx
const ConversionDashboard = () => {
  const [conversions, setConversions] = useState([]);

  useEffect(() => {
    // WebSocket connection for real-time updates
    const ws = new WebSocket('wss://api.sbtc-gateway.com/live');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'stx.conversion.completed') {
        setConversions((prev) => [data.conversion, ...prev.slice(0, 9)]);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="conversion-dashboard">
      <h2>Live STX → sBTC Conversions</h2>
      <div className="conversions-list">
        {conversions.map((conversion) => (
          <div key={conversion.id} className="conversion-item">
            <span className="amount">
              {conversion.stx_amount} STX → {conversion.sbtc_amount} sBTC
            </span>
            <span className="time">{conversion.conversion_time}s</span>
            <span className="wallet">{conversion.wallet_type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 2. Multi-Currency Price Display

```jsx
// PriceDisplay.jsx
const PriceDisplay = ({ usdAmount }) => {
  const [prices, setPrices] = useState({
    btc: 0,
    stx: 0,
    sbtc: 0,
  });

  useEffect(() => {
    const updatePrices = async () => {
      const btcAmount = await calculateBtcAmount(usdAmount);
      const stxAmount = await calculateStxAmount(usdAmount);

      setPrices({
        btc: btcAmount,
        stx: stxAmount / 1000000, // Convert from microSTX
        sbtc: btcAmount, // sBTC = BTC
      });
    };

    updatePrices();
    const interval = setInterval(updatePrices, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [usdAmount]);

  return (
    <div className="price-display">
      <h3>Payment Options</h3>
      <div className="price-options">
        <div className="price-option recommended">
          <span className="currency">STX</span>
          <span className="amount">{prices.stx.toFixed(2)} STX</span>
          <span className="badge">Recommended</span>
          <span className="benefits">⚡ Fast • 💸 Cheap</span>
        </div>
        <div className="price-option">
          <span className="currency">Bitcoin</span>
          <span className="amount">{prices.btc.toFixed(8)} BTC</span>
          <span className="benefits">🔒 Secure • 🌍 Universal</span>
        </div>
      </div>
    </div>
  );
};
```

## 🚀 Hackathon Deployment Tips

### 1. Quick Demo Setup

```bash
# Clone and setup
git clone https://github.com/your-username/sbtc-payment-gateway.git
cd sbtc-payment-gateway

# Install dependencies
npm install

# Add Stacks dependencies
npm install @stacks/connect @stacks/transactions @stacks/network

# Setup environment
cp .env.example .env.local
# Add your Stacks testnet configuration

# Start development
npm run dev
```

### 2. Environment Configuration

```bash
# .env.local
NEXT_PUBLIC_STACKS_NETWORK=testnet
NEXT_PUBLIC_STACKS_API_URL=https://api.testnet.hiro.so

# Contract addresses (deploy your own for demo)
NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
NEXT_PUBLIC_SBTC_CONTRACT_ADDRESS=ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7

# Demo merchant keys
DEMO_MERCHANT_STX_ADDRESS=ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
DEMO_MERCHANT_BTC_ADDRESS=tb1qxy2kgdygjrsqtzq2n0c3kqjx5c5fcjsxwqj5q3
```

### 3. Demo Script

```javascript
// demo-script.js - For live presentations
const demoFlow = {
  step1: () => console.log('🛒 Customer adds $50 headphones to cart'),
  step2: () => console.log('💳 Customer chooses "Pay with STX"'),
  step3: () => console.log('🔗 Xverse wallet connects automatically'),
  step4: () => console.log('⚡ Payment completes in 6 seconds'),
  step5: () => console.log('🎉 Merchant receives sBTC instantly'),
  step6: () => console.log('📧 Customer gets confirmation email'),
};

// Run demo
Object.values(demoFlow).forEach((step, i) => {
  setTimeout(step, i * 2000);
});
```

This Stacks ecosystem integration gives you the perfect hackathon project: **fast STX payments with automatic sBTC conversion**, supporting all major Stacks wallets for maximum flexibility and user experience! 🚀
