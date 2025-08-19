# Balance & Conversion Dashboard - Complete User Guide

**Project**: sBTC Payment Gateway  
**Feature**: Balance & Conversion Management Dashboard  
**Target Users**: Merchants, Developers, Business Owners  
**Last Updated**: August 18, 2025

## Table of Contents

1. [Overview](#overview)
2. [Merchant User Guide](#merchant-user-guide)
3. [Developer Integration Guide](#developer-integration-guide)
4. [Website Integration](#website-integration)
5. [API Reference](#api-reference)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

The Balance & Conversion Dashboard is the financial control center of your sBTC Payment Gateway. It provides merchants with complete visibility and control over their multi-currency funds, enabling seamless conversion between cryptocurrencies and fiat currencies, withdrawal management, and comprehensive transaction tracking.

### Key Features

- **Multi-Currency Balance Management**: View and manage balances in sBTC, BTC, USD, USDC, USDT, and STX
- **Real-Time Currency Conversion**: Convert between supported currencies using our multi-provider network (Circle API, Coinbase Commerce, Internal Swaps)
- **Flexible Withdrawal Options**: Withdraw to bank accounts, crypto wallets, or stablecoin addresses
- **Advanced Settings**: Configure auto-conversion, payment preferences, and notification settings
- **Transaction History**: Complete audit trail of all conversions, deposits, and withdrawals
- **Privacy Controls**: Hide/show balance amounts for security

---

## Merchant User Guide

### Getting Started

1. **Access the Dashboard**

   - Navigate to `/dashboard/conversion` in your merchant portal
   - Or click "Balance & Conversion" in the main navigation sidebar

2. **Understanding Your Balance Overview**
   ```
   Total Balance: $3,108.70 USD equivalent
   ├── sBTC: 0.00125 (~$56.25)
   ├── USD: $1,234.56
   ├── USDC: $567.89
   └── STX: 2,500 (~$1,250.00)
   ```

### Core Merchant Workflows

#### 1. **Viewing and Managing Balances**

**What you see:**

- Individual currency balances with USD equivalent values
- 24-hour change indicators (🔼 green for gains, 🔽 red for losses)
- Available vs. pending vs. reserved fund breakdown
- Total portfolio value with percentage change

**Actions you can take:**

- Toggle balance visibility for privacy (👁️ Show/Hide button)
- Refresh real-time balance data
- View detailed breakdown of each currency

**Business Value:**

- Real-time financial visibility
- Risk management through change indicators
- Privacy protection during meetings/presentations

#### 2. **Converting Between Currencies**

**Step-by-Step Process:**

1. **Select Source Currency**

   - Choose from your available balances (only currencies with funds > 0)
   - See your available amount clearly displayed

2. **Choose Target Currency**

   - Select from supported conversion pairs
   - System automatically shows best available provider

3. **Enter Amount**

   - Type amount or click "Max" for full balance conversion
   - See real-time conversion rate and fees

4. **Review Conversion Details**

   ```
   Converting: 100 STX → 0.001111 sBTC
   Rate: 1 STX = 0.00001111 sBTC
   Provider: Internal (Stacks DeFi)
   Estimated Time: 5-10 minutes
   Fees:
   ├── Conversion Fee: 0.000006 sBTC (0.5%)
   ├── Network Fee: 0.000001 sBTC
   └── Total Fee: 0.000007 sBTC
   ```

5. **Execute Conversion**
   - Click "Convert" to initiate
   - Monitor status in Recent Activity section

**Supported Conversion Pairs:**

- **sBTC ↔ BTC**: 1:1 ratio, atomic swaps (10-20 min)
- **STX ↔ sBTC**: Market rate via Stacks DeFi (5-10 min)
- **USD ↔ USDC**: Circle API, institutional grade (Instant)
- **BTC ↔ USDC**: Coinbase Commerce (10-30 min)
- **STX ↔ USDC**: Internal routing (15 min)
- **sBTC ↔ USDC**: Circle API integration (5-15 min)

**Best Practices:**

- Convert during low volatility periods for better rates
- Use Circle provider for USD/USDC (lowest fees, fastest)
- Set up auto-conversion for consistent currency preferences
- Monitor conversion status in transaction history

#### 3. **Withdrawing Funds**

**Available Withdrawal Methods:**

1. **Bank Transfer (USD)**

   ```
   Method: ACH Direct Deposit
   Fee: $5 fixed
   Minimum: $50
   Maximum: $50,000
   Time: 1-3 business days
   ```

2. **Wire Transfer (USD)**

   ```
   Method: International Wire
   Fee: $25 fixed
   Minimum: $500
   Maximum: $100,000
   Time: 1-2 business days
   ```

3. **Crypto Wallets**

   ```
   sBTC Wallet:
   ├── Fee: 0.0001 BTC
   ├── Minimum: 0.001 sBTC
   └── Time: 10-30 minutes

   USDC Wallet (Ethereum/Polygon):
   ├── Fee: $1 USDC
   ├── Minimum: $10 USDC
   └── Time: 5-15 minutes

   STX Wallet:
   ├── Fee: 0.1 STX
   ├── Minimum: 1 STX
   └── Time: 5-10 minutes
   ```

**Withdrawal Process:**

1. **Select Currency & Method**

   - Choose currency to withdraw
   - Select preferred withdrawal method
   - System shows fees and timeframes

2. **Enter Details**

   - Bank withdrawals: Automatically use saved account info
   - Crypto withdrawals: Enter recipient wallet address
   - Add optional note for your records

3. **Review & Confirm**

   ```
   Withdrawing: $1,000.00 USD
   Method: Bank Transfer (ACH)
   Fee: $5.00
   You'll receive: $995.00
   Estimated arrival: 1-3 business days
   ```

4. **Track Status**
   - Monitor in Recent Activity
   - Receive email notifications
   - Get webhook updates (if configured)

#### 4. **Configuring Settings**

**Auto-Conversion Settings:**

```
✅ Enable Auto-Conversion
└── Convert To: USD
└── Minimum Amount: $100
└── Applies to: All incoming payments > $100
```

**Payment Preferences:**

```
✅ Enable Multi-Currency Payments
└── Preferred Receive Currency: sBTC
└── Allow customers to pay in: BTC, STX, USD, USDC
```

**Wallet Configuration:**

```
Bitcoin Address: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
Stacks Address: SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
Ethereum Address: 0x742d35Cc6464C532d6B8E1b4a4f6c0E4C4
```

**Bank Account Setup:**

```
Bank Name: Wells Fargo
Account: ****1234 (encrypted)
Routing: 121000248
```

**Notification Preferences:**

```
✅ Email Notifications
✅ Webhook Notifications
└── Webhook URL: https://api.yourstore.com/webhooks/payments
```

### Business Impact Scenarios

#### Scenario 1: E-commerce Store Owner

**Problem**: Receiving mixed currency payments, need USD for operations
**Solution**:

1. Set auto-conversion to USD for amounts > $50
2. Configure bank withdrawals for weekly payouts
3. Keep small sBTC reserve for network fees

**Result**: Simplified cash flow, automatic currency management

#### Scenario 2: Crypto-Native Business

**Problem**: Wants to hold crypto but needs flexibility
**Solution**:

1. Receive payments in sBTC (appreciating asset)
2. Convert only operational expenses to USD
3. Set up USDC wallet for quick liquidity

**Result**: Crypto exposure while maintaining operational flexibility

#### Scenario 3: International Business

**Problem**: Serving global customers, managing currency risk
**Solution**:

1. Accept payments in customer's preferred currency
2. Use USDC as intermediate stable currency
3. Convert to local fiat monthly via wire transfers

**Result**: Global payment acceptance, controlled currency exposure

---

## Developer Integration Guide

### Prerequisites

```bash
# Required dependencies
npm install @stacks/transactions @stacks/network
npm install axios date-fns
npm install recharts framer-motion lucide-react
```

### API Integration

#### 1. **Balance Retrieval**

```typescript
// Get merchant balances
async function getBalance(merchantId: string) {
  const response = await fetch(`/api/v1/merchants/${merchantId}/balance`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

// Response format
interface BalanceResponse {
  balances: Array<{
    currency: string;
    amount: number;
    usdValue: number;
    available: number;
    pending: number;
    reserved: number;
    change24h: number;
  }>;
  totalUsdValue: number;
  lastUpdated: string;
}
```

#### 2. **Currency Conversion**

```typescript
// Create conversion
async function createConversion(conversionData: {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  merchantId: string;
}) {
  const response = await fetch('/api/v1/conversions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(conversionData),
  });

  return response.json();
}

// Get conversion rates
async function getConversionRates() {
  const response = await fetch('/api/v1/conversions/rates', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  return response.json();
}
```

#### 3. **Withdrawal Processing**

```typescript
// Create withdrawal request
async function createWithdrawal(withdrawalData: {
  currency: string;
  amount: number;
  method: 'bank' | 'crypto';
  recipientAddress?: string;
  merchantId: string;
}) {
  const response = await fetch('/api/v1/withdrawals', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(withdrawalData),
  });

  return response.json();
}
```

### React Component Integration

#### 1. **Balance Display Component**

```typescript
import { BalanceCard } from '@/components/dashboard/conversion/BalanceCard';

function MyBalanceView() {
  const [balances, setBalances] = useState([]);

  useEffect(() => {
    fetchBalances().then(setBalances);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {balances.map((balance) => (
        <BalanceCard key={balance.currency} balance={balance} hideAmount={false} />
      ))}
    </div>
  );
}
```

#### 2. **Conversion Widget Integration**

```typescript
import { ConversionWidget } from '@/components/dashboard/conversion/ConversionWidget';

function MyConversionInterface() {
  const handleConversionComplete = (transaction) => {
    // Update your state
    console.log('Conversion completed:', transaction);

    // Trigger webhook or update UI
    updateTransactionHistory(transaction);
  };

  return (
    <ConversionWidget balances={merchantBalances} onConversionComplete={handleConversionComplete} />
  );
}
```

### Webhook Integration

#### 1. **Setting Up Webhooks**

```typescript
// Configure webhook endpoint in settings
const webhookConfig = {
  url: 'https://yourdomain.com/webhooks/sbtc',
  events: ['conversion.completed', 'conversion.failed', 'withdrawal.processed', 'balance.updated'],
  secret: 'your-webhook-secret',
};

// Webhook handler example
app.post('/webhooks/sbtc', (req, res) => {
  const signature = req.headers['x-sbtc-signature'];
  const payload = req.body;

  // Verify webhook signature
  if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
    return res.status(401).send('Unauthorized');
  }

  // Handle different event types
  switch (payload.event) {
    case 'conversion.completed':
      handleConversionCompleted(payload.data);
      break;
    case 'withdrawal.processed':
      handleWithdrawalProcessed(payload.data);
      break;
    case 'balance.updated':
      handleBalanceUpdated(payload.data);
      break;
  }

  res.status(200).send('OK');
});
```

#### 2. **Real-time Updates**

```typescript
// WebSocket integration for real-time balance updates
import { useWebSocket } from '@/hooks/use-websocket';

function RealTimeBalanceComponent() {
  const { data, connected } = useWebSocket('/ws/merchant/balance', {
    onMessage: (balanceUpdate) => {
      setBalances(balanceUpdate.balances);
    },
  });

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm">{connected ? 'Live' : 'Disconnected'}</span>
    </div>
  );
}
```

---

## Website Integration

### 1. **Checkout Integration**

```html
<!-- Add to your checkout page -->
<script src="https://js.sbtcpay.com/v1/checkout.js"></script>

<script>
  const checkout = SBTCPay.create({
    merchantId: 'your-merchant-id',
    apiKey: 'pk_live_...',
    currency: 'USD', // Customer display currency
    receiveCurrency: 'sBTC', // What you receive
    autoConvert: true, // Auto-convert to your preferred currency
    theme: {
      primaryColor: '#6366f1',
      borderRadius: '8px',
    },
  });

  // Handle successful payment
  checkout.on('payment.success', (payment) => {
    // Payment received in sBTC
    // Will auto-convert based on your dashboard settings
    window.location.href = '/success';
  });
</script>
```

### 2. **Payment Status Widget**

```javascript
// Embed payment status in your admin panel
const paymentStatus = SBTCPay.createStatusWidget({
  containerId: 'payment-status',
  merchantId: 'your-merchant-id',
  showConversions: true,
  showWithdrawals: true,
  refreshInterval: 30000, // 30 seconds
});

// Widget will display:
// - Recent payments
// - Conversion status
// - Pending withdrawals
// - Balance overview
```

### 3. **Balance Display Integration**

```html
<!-- Embed balance widget on your dashboard -->
<div id="sbtc-balance-widget"></div>

<script>
  SBTCPay.createBalanceWidget({
    containerId: 'sbtc-balance-widget',
    merchantId: 'your-merchant-id',
    currencies: ['sBTC', 'USD', 'USDC'],
    hideAmounts: false,
    showConvertButton: true,
    showWithdrawButton: true,
  });
</script>
```

### 4. **WordPress Plugin Integration**

```php
// Install sBTC Payment Gateway WordPress Plugin
// wp-content/plugins/sbtc-payment-gateway/

// Configure in WordPress admin
$sbtc_config = [
    'merchant_id' => 'your-merchant-id',
    'api_key' => 'sk_live_...',
    'auto_convert' => true,
    'preferred_currency' => 'USD',
    'webhook_url' => home_url('/wp-json/sbtc/v1/webhook')
];

// Add shortcode for balance display
add_shortcode('sbtc_balance', function($atts) {
    return '<div id="sbtc-balance" data-merchant="' . $atts['merchant_id'] . '"></div>';
});
```

### 5. **Shopify Integration**

```liquid
<!-- Add to your Shopify theme -->
<!-- In checkout.liquid -->
{% if shop.enabled_payment_types contains 'sbtc' %}
<script>
window.sbtcConfig = {
  merchantId: '{{ shop.metafields.sbtc.merchant_id }}',
  autoConvert: {{ shop.metafields.sbtc.auto_convert }},
  preferredCurrency: '{{ shop.metafields.sbtc.preferred_currency }}'
};
</script>
<script src="https://js.sbtcpay.com/shopify/v1/integration.js"></script>
{% endif %}
```

---

## API Reference

### Authentication

```http
Authorization: Bearer sk_live_your_secret_key
Content-Type: application/json
```

### Endpoints

#### Get Balance

```http
GET /api/v1/merchants/{merchantId}/balance
```

Response:

```json
{
  "balances": [
    {
      "currency": "sBTC",
      "amount": 0.00125,
      "usdValue": 56.25,
      "available": 0.00125,
      "pending": 0,
      "reserved": 0,
      "change24h": 2.5
    }
  ],
  "totalUsdValue": 3108.7,
  "lastUpdated": "2025-08-18T10:30:00Z"
}
```

#### Create Conversion

```http
POST /api/v1/conversions
```

Request:

```json
{
  "merchantId": "merchant_123",
  "fromCurrency": "STX",
  "toCurrency": "sBTC",
  "amount": 100,
  "slippageTolerance": 0.5,
  "preferredProvider": "internal"
}
```

Response:

```json
{
  "id": "conv_456",
  "status": "processing",
  "fromAmount": 100,
  "fromCurrency": "STX",
  "toAmount": 0.001111,
  "toCurrency": "sBTC",
  "rate": 0.00001111,
  "fees": {
    "conversion": 0.000006,
    "network": 0.000001,
    "total": 0.000007
  },
  "provider": "internal",
  "estimatedCompletion": "2025-08-18T10:40:00Z"
}
```

#### Create Withdrawal

```http
POST /api/v1/withdrawals
```

Request:

```json
{
  "merchantId": "merchant_123",
  "currency": "USD",
  "amount": 1000,
  "method": "bank",
  "note": "Weekly payout"
}
```

Response:

```json
{
  "id": "with_789",
  "status": "processing",
  "amount": 1000,
  "currency": "USD",
  "fees": {
    "processing": 5,
    "total": 5
  },
  "netAmount": 995,
  "method": "Bank Transfer (ACH)",
  "estimatedCompletion": "2025-08-21T10:30:00Z"
}
```

---

## Troubleshooting

### Common Issues

#### 1. **Conversion Failed**

```
Error: "Conversion failed: Insufficient balance"
```

**Solution**: Check available balance vs. requested amount + fees

#### 2. **Withdrawal Rejected**

```
Error: "Withdrawal rejected: Minimum amount not met"
```

**Solution**: Verify minimum withdrawal amounts for each method

#### 3. **Rate Expired**

```
Error: "Conversion rate expired"
```

**Solution**: Refresh rates or enable auto-refresh in widget

#### 4. **Webhook Not Received**

```
Error: "Webhook delivery failed"
```

**Solution**:

- Verify webhook URL is accessible
- Check webhook signature validation
- Review webhook endpoint logs

### Debugging Tools

#### 1. **API Testing**

```bash
# Test balance endpoint
curl -X GET "https://api.sbtcpay.com/v1/merchants/merchant_123/balance" \
  -H "Authorization: Bearer sk_live_..."

# Test conversion
curl -X POST "https://api.sbtcpay.com/v1/conversions" \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "merchant_123",
    "fromCurrency": "STX",
    "toCurrency": "sBTC",
    "amount": 100
  }'
```

#### 2. **Rate Monitoring**

```javascript
// Monitor conversion rates
const rateMonitor = setInterval(async () => {
  const rates = await fetch('/api/v1/conversions/rates');
  console.log('Current rates:', await rates.json());
}, 60000); // Every minute
```

---

## Best Practices

### For Merchants

1. **Balance Management**

   - Keep 5-10% buffer for network fees
   - Set up auto-conversion for operational currencies
   - Monitor volatility before large conversions
   - Use dollar-cost averaging for regular conversions

2. **Security**

   - Enable 2FA on merchant account
   - Use IP restrictions for API keys
   - Regularly rotate API keys
   - Monitor withdrawal addresses

3. **Operational Efficiency**
   - Set up automated weekly withdrawals
   - Configure webhook notifications
   - Use batch conversions for better rates
   - Plan conversions during low-fee periods

### For Developers

1. **Integration**

   - Implement proper error handling
   - Use exponential backoff for API retries
   - Cache conversion rates appropriately
   - Validate webhook signatures

2. **Performance**

   - Use WebSocket for real-time updates
   - Implement client-side caching
   - Batch API requests when possible
   - Monitor API rate limits

3. **User Experience**
   - Show loading states during operations
   - Provide clear error messages
   - Display estimated completion times
   - Implement progress indicators

---

## Conclusion

The Balance & Conversion Dashboard provides merchants with complete financial control over their multi-currency payment operations. By combining real-time visibility, flexible conversion options, and comprehensive withdrawal management, it enables businesses to optimize their cash flow while maintaining exposure to cryptocurrency appreciation.

For developers, the extensive API and webhook system provides the flexibility to create custom integrations that fit any business model, from simple e-commerce stores to complex multi-currency trading platforms.

### Support Resources

- **Documentation**: https://docs.sbtcpay.com
- **API Reference**: https://api.sbtcpay.com/docs
- **Developer Discord**: https://discord.gg/sbtcpay
- **Support Email**: support@sbtcpay.com

---

_This guide is regularly updated. For the latest version, visit our documentation portal._
