# Quick Start Integration Checklist

**Project**: sBTC Payment Gateway - Balance & Conversion Dashboard  
**Target**: Developers & Integrators  
**Time to Complete**: 30-60 minutes

## ✅ Pre-Integration Checklist

### Prerequisites

- [ ] Next.js 14+ project setup
- [ ] TypeScript configured
- [ ] Tailwind CSS installed
- [ ] Shadcn/ui components library
- [ ] MongoDB or preferred database
- [ ] Basic understanding of React hooks

### API Access

- [ ] sBTC Payment Gateway merchant account created
- [ ] API keys generated (test & live)
- [ ] Webhook endpoints configured
- [ ] Rate limiting understood (1000 req/hour default)

## 📦 Installation Steps

### 1. Install Required Dependencies

```bash
# Core dependencies
npm install framer-motion lucide-react date-fns

# UI components (if using shadcn/ui)
npx shadcn-ui@latest add card button input label badge alert select switch textarea

# Optional: State management
npm install zustand # or your preferred state management
```

### 2. Copy Dashboard Components

```bash
# Create directory structure
mkdir -p components/dashboard/conversion
mkdir -p app/(dashboard)/conversion

# Copy component files (provided in the codebase)
# - BalanceCard.tsx
# - ConversionWidget.tsx
# - TransactionHistory.tsx
# - WithdrawalForm.tsx
# - ConversionSettings.tsx
# - page.tsx (main dashboard)
```

### 3. Environment Configuration

```env
# .env.local
NEXT_PUBLIC_SBTC_API_URL=https://api.sbtcpay.com
SBTC_API_SECRET=sk_test_your_secret_key
CIRCLE_API_KEY=your_circle_key
COINBASE_COMMERCE_KEY=your_coinbase_key
WEBHOOK_SECRET=your_webhook_secret
MONGODB_URI=mongodb://localhost:27017/sbtc_gateway
```

## 🔧 Configuration Steps

### 1. Update Navigation (Sidebar)

```typescript
// Add to your navigation array
{
  name: 'Balance & Conversion',
  href: '/dashboard/conversion',
  icon: ArrowUpDown,
  isNew: true,
}
```

### 2. Create API Routes

```typescript
// app/api/v1/balance/route.ts
export async function GET(request: NextRequest) {
  const merchantId = getMerchantId(request);
  const balances = await getBalances(merchantId);
  return NextResponse.json({ balances });
}

// app/api/v1/conversions/route.ts
export async function POST(request: NextRequest) {
  const conversionData = await request.json();
  const result = await createConversion(conversionData);
  return NextResponse.json(result);
}

// app/api/v1/withdrawals/route.ts
export async function POST(request: NextRequest) {
  const withdrawalData = await request.json();
  const result = await createWithdrawal(withdrawalData);
  return NextResponse.json(result);
}
```

### 3. Database Setup (MongoDB Example)

```typescript
// models/balance.ts
const balanceSchema = new Schema({
  merchantId: { type: String, required: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  available: { type: Number, required: true },
  pending: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

// models/conversion.ts
const conversionSchema = new Schema({
  merchantId: { type: String, required: true },
  fromCurrency: { type: String, required: true },
  toCurrency: { type: String, required: true },
  fromAmount: { type: Number, required: true },
  toAmount: { type: Number, required: true },
  rate: { type: Number, required: true },
  provider: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'] },
  fees: { type: Object },
  createdAt: { type: Date, default: Date.now },
});
```

## 🚀 Integration Testing

### 1. Component Testing

```bash
# Test individual components
npm run test -- BalanceCard.test.tsx
npm run test -- ConversionWidget.test.tsx
```

### 2. API Testing

```bash
# Test balance endpoint
curl -X GET "http://localhost:3000/api/v1/balance" \
  -H "Authorization: Bearer sk_test_..."

# Test conversion endpoint
curl -X POST "http://localhost:3000/api/v1/conversions" \
  -H "Authorization: Bearer sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{"fromCurrency":"STX","toCurrency":"sBTC","amount":100}'
```

### 3. E2E Testing

```bash
# Run Playwright tests
npx playwright test conversion.e2e.ts
```

## 🎨 Customization Options

### 1. Theme Customization

```typescript
// Customize currency colors
const currencyThemes = {
  sBTC: { primary: '#f97316', background: 'bg-orange-50' },
  USD: { primary: '#22c55e', background: 'bg-green-50' },
  // Add your brand colors
};
```

### 2. Feature Flags

```typescript
// Control features for your use case
const features = {
  enableAutoConversion: true,
  enableCryptoWithdrawals: true,
  enableBankWithdrawals: false, // Disable if not needed
  enableAdvancedSettings: true,
};
```

### 3. Provider Configuration

```typescript
// Configure conversion providers
const providers = {
  circle: { enabled: true, priority: 1 },
  coinbase: { enabled: true, priority: 2 },
  internal: { enabled: true, priority: 3 },
};
```

## 📊 Monitoring Setup

### 1. Add Analytics

```typescript
// Track conversion events
const trackConversion = (data: ConversionData) => {
  analytics.track('Conversion Initiated', {
    fromCurrency: data.fromCurrency,
    toCurrency: data.toCurrency,
    amount: data.amount,
    provider: data.provider,
  });
};
```

### 2. Error Monitoring

```typescript
// Add Sentry or similar
import * as Sentry from '@sentry/nextjs';

const handleConversionError = (error: Error, context: any) => {
  Sentry.captureException(error, { extra: context });
  console.error('Conversion failed:', error);
};
```

### 3. Performance Monitoring

```typescript
// Monitor API response times
const monitorApiCall = async (endpoint: string, fn: Function) => {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    metrics.timing(`api.${endpoint}.duration`, duration);
    return result;
  } catch (error) {
    metrics.increment(`api.${endpoint}.error`);
    throw error;
  }
};
```

## 🔒 Security Checklist

### 1. API Security

- [ ] API keys are server-side only
- [ ] Request validation on all endpoints
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Input sanitization in place

### 2. Data Protection

- [ ] Sensitive data encrypted at rest
- [ ] PII handling compliance (GDPR/CCPA)
- [ ] Audit logs for financial operations
- [ ] Secure webhook signature validation

### 3. Frontend Security

- [ ] No sensitive data in client code
- [ ] CSP headers configured
- [ ] XSS protection enabled
- [ ] Session management secure

## 🚀 Go-Live Checklist

### Production Readiness

- [ ] Switch to production API keys
- [ ] Database optimized for scale
- [ ] CDN configured for assets
- [ ] Monitoring dashboards setup
- [ ] Error alerting configured
- [ ] Backup strategy implemented

### User Experience

- [ ] Loading states implemented
- [ ] Error messages user-friendly
- [ ] Mobile responsive design tested
- [ ] Accessibility guidelines followed
- [ ] Performance optimized (< 3s load time)

### Documentation

- [ ] API documentation updated
- [ ] User guides created
- [ ] Support documentation prepared
- [ ] Change logs maintained

## 📞 Support Resources

### Getting Help

- **Documentation**: `docs/balance-conversion-dashboard-guide.md`
- **Technical Guide**: `docs/technical-implementation-guide.md`
- **API Reference**: https://api.sbtcpay.com/docs
- **GitHub Issues**: Create issue with `[conversion-dashboard]` tag
- **Discord**: #integration-help channel

### Common Issues & Solutions

#### Issue: "Rate fetch failed"

```typescript
// Solution: Implement fallback rates
const getFallbackRates = () => ({
  'STX/sBTC': 0.00001111,
  'BTC/sBTC': 1.0,
  'USD/USDC': 1.001,
});
```

#### Issue: "Conversion timeout"

```typescript
// Solution: Add timeout handling
const convertWithTimeout = async (data: ConversionData) => {
  return Promise.race([
    convertCurrency(data),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000)),
  ]);
};
```

#### Issue: "Webhook not received"

```typescript
// Solution: Verify webhook signature
const verifyWebhook = (payload: string, signature: string) => {
  const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
};
```

## 🎯 Success Metrics

Track these KPIs to measure integration success:

### Technical Metrics

- API response time < 500ms (95th percentile)
- Error rate < 1%
- Uptime > 99.9%
- Conversion success rate > 98%

### Business Metrics

- User engagement with conversion features
- Average conversion frequency per merchant
- Withdrawal completion rate
- Customer satisfaction scores

### Performance Metrics

- Dashboard load time < 2 seconds
- Real-time rate update latency < 5 seconds
- Mobile performance score > 90 (Lighthouse)

---

## 🎉 You're Ready!

Once you've completed this checklist, your Balance & Conversion Dashboard integration should be fully functional. Your merchants will have:

✅ **Complete financial visibility** across all supported currencies  
✅ **Seamless conversion capabilities** with multiple provider options  
✅ **Flexible withdrawal management** to various destinations  
✅ **Professional-grade user experience** with real-time updates  
✅ **Enterprise-level security** and compliance features

Welcome to the sBTC Payment Gateway ecosystem! 🚀

---

_For additional support or advanced customization needs, reach out to our integration team._
