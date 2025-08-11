# Development Workflow & Setup Guide

**Project**: sBTC Payment Gateway  
**Environment**: Next.js 14 + MongoDB + sBTC Protocol  
**Last Updated**: August 11, 2025

## Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.17+ or 20+
- **npm** 9+ or **yarn** 1.22+
- **MongoDB** 6.0+ (local or MongoDB Atlas)
- **Git** for version control

### 1. Environment Setup

**Clone and Install:**

```bash
# Clone the repository
git clone https://github.com/your-username/sbtc-payment-gateway.git
cd sbtc-payment-gateway

# Install dependencies
npm install

# Install additional sBTC dependencies
npm install sbtc @stacks/transactions @stacks/network @stacks/connect
npm install bitcoin-core axios bcryptjs jsonwebtoken
npm install @types/bcryptjs @types/jsonwebtoken --save-dev
```

**Environment Configuration:**

Create `.env.local` file in the root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/sbtc_gateway_dev
MONGODB_DB_NAME=sbtc_gateway_dev

# sBTC Configuration
SBTC_NETWORK=testnet
EMILY_API_URL=https://api.testnet.sbtc.tech
STACKS_API_URL=https://stacks-node-api.testnet.stacks.co

# Bitcoin Configuration
BITCOIN_NETWORK=testnet
MEMPOOL_API_URL=https://mempool.space/testnet/api

# Stacks Configuration
STACKS_NETWORK=testnet
STACKS_CONTRACT_ADDRESS=ST000000000000000000002AMW42H
STACKS_CONTRACT_NAME=sbtc-token

# Security Keys
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
API_KEY_SECRET=your-api-key-secret-here-min-32-chars
WEBHOOK_SECRET=your-webhook-secret-here-min-32-chars

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: MongoDB Atlas (Production)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sbtc_gateway?retryWrites=true&w=majority
```

### 2. Database Setup

**Start Local MongoDB:**

```bash
# Using Homebrew (macOS)
brew services start mongodb-community

# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6.0

# Verify MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

**Initialize Database:**

```bash
# Run database setup script
npm run setup:db

# Or manually seed test data
node scripts/seed-data.js
```

### 3. Development Server

**Start Development Environment:**

```bash
# Start Next.js development server
npm run dev

# Server will be available at http://localhost:3000
```

**Verify Setup:**

1. Open http://localhost:3000
2. Check database connection: http://localhost:3000/api/health
3. Test API endpoints using provided test scripts

## Project Structure Deep Dive

```
sbtc-payment-gateway/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/                   # Auth route group
│   │   ├── 📁 login/                # Login page
│   │   └── 📁 register/             # Registration page
│   ├── 📁 (dashboard)/              # Dashboard route group
│   │   ├── 📁 analytics/            # Analytics pages
│   │   ├── 📁 dashboard/            # Main dashboard
│   │   ├── 📁 payments/             # Payment management
│   │   └── 📁 settings/             # Settings pages
│   ├── 📁 (public)/                 # Public route group
│   │   ├── 📁 checkout/             # Public checkout pages
│   │   ├── 📁 docs/                 # Documentation
│   │   └── 📁 status/               # Status pages
│   ├── 📁 api/                      # API routes
│   │   ├── 📁 auth/                 # Authentication endpoints
│   │   ├── 📁 v1/                   # API version 1
│   │   │   ├── 📁 analytics/        # Analytics endpoints
│   │   │   ├── 📁 merchants/        # Merchant management
│   │   │   ├── 📁 payments/         # Payment processing
│   │   │   ├── 📁 sbtc/            # sBTC operations
│   │   │   └── 📁 system/          # System endpoints
│   │   └── 📁 webhooks/            # Webhook handlers
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
├── 📁 components/                   # React components
│   ├── 📁 charts/                   # Chart components
│   ├── 📁 dashboard/                # Dashboard components
│   ├── 📁 forms/                    # Form components
│   ├── 📁 layout/                   # Layout components
│   ├── 📁 payment/                  # Payment components
│   ├── 📁 providers/                # Context providers
│   ├── 📁 shared/                   # Shared components
│   └── 📁 ui/                       # Base UI components
├── 📁 config/                       # Configuration files
│   ├── api.ts                       # API configuration
│   ├── blockchain.ts                # Blockchain configuration
│   └── database.ts                  # Database configuration
├── 📁 docs/                         # Project documentation
│   ├── 📁 api/                      # API documentation
│   ├── 📁 integration/              # Integration guides
│   ├── project-analysis.md          # Project analysis
│   ├── backend-implementation.md    # Backend guide
│   ├── sbtc-integration.md         # sBTC integration
│   └── database-schema.md          # Database documentation
├── 📁 hooks/                        # Custom React hooks
│   ├── use-api.ts                   # API hook
│   ├── use-auth.ts                  # Authentication hook
│   ├── use-payments.ts              # Payment hooks
│   └── use-wallet.ts                # Wallet hooks
├── 📁 lib/                          # Core libraries
│   ├── 📁 auth/                     # Authentication utilities
│   ├── 📁 blockchain/               # Blockchain utilities
│   ├── 📁 database/                 # Database connections
│   ├── 📁 middleware/               # API middleware
│   ├── 📁 services/                 # Business logic services
│   ├── 📁 utils/                    # Utility functions
│   ├── 📁 validators/               # Schema validators
│   └── utils.ts                     # Common utilities
├── 📁 models/                       # Database models
│   ├── api-key.ts                   # API key model
│   ├── merchant.ts                  # Merchant model
│   ├── payment.ts                   # Payment model
│   ├── transaction.ts               # Transaction model
│   ├── user.ts                      # User model
│   └── webhook.ts                   # Webhook model
├── 📁 public/                       # Static assets
│   ├── 📁 icons/                    # Icon files
│   └── 📁 images/                   # Image assets
├── 📁 scripts/                      # Utility scripts
│   ├── deploy.sh                    # Deployment script
│   ├── seed-data.ts                 # Database seeding
│   ├── setup-db.ts                  # Database setup
│   └── test-api.js                  # API testing
├── 📁 store/                        # State management
│   ├── auth-store.ts                # Authentication store
│   ├── merchant-store.ts            # Merchant store
│   ├── payment-store.ts             # Payment store
│   └── ui-store.ts                  # UI state store
├── 📁 styles/                       # CSS files
│   ├── components.css               # Component styles
│   └── dashboard.css                # Dashboard styles
├── 📁 tests/                        # Test files
│   ├── 📁 e2e/                      # End-to-end tests
│   ├── 📁 integration/              # Integration tests
│   ├── 📁 unit/                     # Unit tests
│   └── setup.ts                     # Test setup
├── 📁 types/                        # TypeScript types
│   ├── api.ts                       # API types
│   ├── auth.ts                      # Authentication types
│   ├── blockchain.ts                # Blockchain types
│   ├── database.ts                  # Database types
│   ├── merchant.ts                  # Merchant types
│   └── payment.ts                   # Payment types
├── .env.local                       # Environment variables
├── .gitignore                       # Git ignore rules
├── next.config.mjs                  # Next.js configuration
├── package.json                     # Dependencies
├── tailwind.config.ts               # Tailwind configuration
└── tsconfig.json                    # TypeScript configuration
```

## Development Workflow

### 1. Backend Development Priority

**Phase 1: Core Infrastructure (Week 1)**

```bash
# Day 1-2: Database & Models
- Complete MongoDB connection
- Implement all database models
- Create migration scripts
- Test database operations

# Day 3-4: Core Services
- Implement PaymentService
- Implement MerchantService
- Create authentication middleware
- Add input validation

# Day 5-7: API Routes
- Create payment endpoints
- Implement merchant endpoints
- Add error handling
- Test API functionality
```

**Phase 2: sBTC Integration (Week 2)**

```bash
# Day 1-3: sBTC Service
- Implement SbtcService
- Create Bitcoin monitoring
- Add Emily API integration
- Test deposit flow

# Day 4-5: Advanced Features
- Implement webhook system
- Add transaction monitoring
- Create analytics service
- Test complete payment flow

# Day 6-7: Testing & Documentation
- Write comprehensive tests
- Update API documentation
- Performance optimization
- Security review
```

### 2. Key Development Commands

**Database Operations:**

```bash
# Setup database and seed test data
npm run db:setup
npm run db:seed

# Run migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset
```

**Development:**

```bash
# Start development server
npm run dev

# Run tests
npm run test
npm run test:watch
npm run test:e2e

# Build for production
npm run build
npm run start
```

**sBTC Testing:**

```bash
# Test sBTC integration
npm run test:sbtc

# Test Bitcoin monitoring
npm run test:bitcoin

# Test webhook delivery
npm run test:webhooks
```

### 3. Code Quality & Standards

**ESLint Configuration:**

```json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error"
  }
}
```

**Prettier Configuration:**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80
}
```

**Git Hooks (Husky):**

```bash
# Install husky for pre-commit hooks
npm install --save-dev husky lint-staged

# Pre-commit hook runs:
- ESLint checks
- Prettier formatting
- TypeScript compilation
- Unit tests
```

### 4. API Development Pattern

**Service Layer Pattern:**

```typescript
// 1. Create service in lib/services/
export class PaymentService {
  async createPayment(data: CreatePaymentRequest) {
    // Business logic here
  }
}

// 2. Create API route in app/api/
export async function POST(request: NextRequest) {
  // Validation, authentication, error handling
  const result = await paymentService.createPayment(data);
  return NextResponse.json(result);
}

// 3. Create frontend hook in hooks/
export function usePayments() {
  // React hook for frontend integration
}
```

**Error Handling Pattern:**

```typescript
// Consistent error responses
try {
  const result = await service.operation();
  return NextResponse.json(result);
} catch (error) {
  console.error('Operation failed:', error);

  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

## Testing Strategy

### 1. Unit Tests

**Test Database Models:**

```bash
# Test file: tests/unit/models/payment.test.ts
describe('Payment Model', () => {
  test('should create payment with valid data', async () => {
    const payment = new Payment(validPaymentData);
    await payment.save();
    expect(payment._id).toBeDefined();
  });
});
```

**Test Services:**

```bash
# Test file: tests/unit/services/payment-service.test.ts
describe('PaymentService', () => {
  test('should create payment intent', async () => {
    const result = await paymentService.createPayment(testData);
    expect(result.status).toBe('pending');
  });
});
```

### 2. Integration Tests

**Test API Endpoints:**

```bash
# Test file: tests/integration/api/payments.test.ts
describe('POST /api/v1/payments', () => {
  test('should create payment with valid API key', async () => {
    const response = await request(app)
      .post('/api/v1/payments')
      .set('Authorization', `Bearer ${testApiKey}`)
      .send(validPaymentData);

    expect(response.status).toBe(200);
  });
});
```

### 3. E2E Tests

**Test Complete Payment Flow:**

```bash
# Test file: tests/e2e/payment-flow.test.ts
test('complete payment flow', async () => {
  // 1. Create payment intent
  // 2. Generate Bitcoin address
  // 3. Simulate Bitcoin payment
  // 4. Verify sBTC minting
  // 5. Check webhook delivery
});
```

## Debugging & Monitoring

### 1. Logging Strategy

**Structured Logging:**

```typescript
import { logger } from '@/lib/utils/logger';

logger.info('Payment created', {
  paymentId: payment.id,
  merchantId: payment.merchantId,
  amount: payment.amount,
  timestamp: new Date().toISOString(),
});

logger.error('Payment failed', {
  paymentId: payment.id,
  error: error.message,
  stack: error.stack,
});
```

### 2. Health Checks

**Database Health:**

```typescript
// app/api/health/route.ts
export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const sbtcHealth = await checkSbtcApiHealth();

  return NextResponse.json({
    status: 'healthy',
    database: dbHealth,
    sbtc: sbtcHealth,
    timestamp: new Date().toISOString(),
  });
}
```

### 3. Performance Monitoring

**API Response Times:**

```typescript
// Middleware to track response times
export function withTiming(handler: Function) {
  return async (req: NextRequest) => {
    const start = Date.now();
    const response = await handler(req);
    const duration = Date.now() - start;

    console.log(`API ${req.method} ${req.url} - ${duration}ms`);
    return response;
  };
}
```

## Deployment Preparation

### 1. Environment Variables for Production

```env
# Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# MongoDB Atlas
MONGODB_URI=mongodb+srv://...

# sBTC Mainnet
SBTC_NETWORK=mainnet
EMILY_API_URL=https://api.sbtc.tech

# Security (Use strong, unique values)
JWT_SECRET=your-production-jwt-secret-64-chars-minimum
API_KEY_SECRET=your-production-api-key-secret
WEBHOOK_SECRET=your-production-webhook-secret
```

### 2. Build Optimization

```bash
# Production build
npm run build

# Analyze bundle size
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build
```

### 3. Security Checklist

- [ ] All environment variables secured
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced
- [ ] Database connections encrypted
- [ ] API keys properly hashed
- [ ] Webhook signatures verified
- [ ] Error messages don't leak sensitive data

This development workflow ensures a systematic approach to building the sBTC payment gateway with proper testing, monitoring, and deployment practices.
