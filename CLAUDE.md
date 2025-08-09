# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **sBTC Payment Gateway** - "The Stripe Experience for Bitcoin Payments." The project aims to build the world's first "Stripe for Bitcoin" by providing the exact same developer experience as Stripe but for Bitcoin payments through sBTC, combining Bitcoin's security with the simplicity that made Stripe worth $95 billion.

**Vision**: Make Bitcoin payments as easy as credit card payments with 3-line integration (vs Stripe's 7 lines), 0.5% fees (vs Stripe's 2.9%), no chargebacks, global instant settlement, and programmable money.

## Common Development Commands

- **Development server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`
- **Unit tests**: `npm test` (Jest + React Testing Library)
- **E2E tests**: `npx playwright test`
- **Type checking**: `npx tsc --noEmit`

## Architecture Overview

### Application Structure (Next.js 14 App Router)

The project follows a strict route organization with three main route groups:

- **`app/(auth)/`**: Authentication routes (login, register)
- **`app/(dashboard)/`**: Protected merchant dashboard (payments, analytics, settings)
- **`app/(public)/`**: Public-facing checkout and documentation

### Core API Architecture (`app/api/`)

RESTful API organized by version and feature:
- **`api/v1/payments/`**: Complete payment lifecycle (create, retrieve, update, cancel, refund)
- **`api/v1/merchants/`**: Merchant account management and API keys  
- **`api/v1/sbtc/`**: sBTC blockchain operations (deposit, withdraw, balance, status)
- **`api/v1/analytics/`**: Transaction and revenue analytics
- **`api/webhooks/`**: Bitcoin and Stacks blockchain event handling

### Key Business Logic Directories

- **`lib/blockchain/`**: Multi-chain integration layer
  - `bitcoin.ts`: Direct Bitcoin transaction handling
  - `stacks.ts`: Stacks blockchain interactions
  - `sbtc.ts`: sBTC protocol integration
  - `clarity-contracts.ts`: Smart contract interactions
  
- **`lib/services/`**: Core business services following domain-driven design
  - `payment-service.ts`: Payment state machine and processing
  - `merchant-service.ts`: Merchant onboarding and management
  - `analytics-service.ts`: Transaction analytics and reporting
  - `webhook-service.ts`: Event-driven architecture for blockchain events
  - `notification-service.ts`: Real-time updates to merchants

- **`lib/database/`**: Data persistence layer
  - `mongodb.ts`: Primary data store for merchants, payments, transactions
  - `redis.ts`: Caching, session management, and real-time features
  - `migrations/`: Database schema evolution

### Component Architecture (`components/`)

Organized by domain expertise:
- **`payment/`**: Core payment widgets (payment-form.tsx, wallet-connect.tsx, qr-code.tsx)
- **`dashboard/`**: Merchant management interface  
- **`charts/`**: Analytics and reporting visualization
- **`providers/`**: React context providers (auth, Stacks, theme, toast)

### Data Models (`models/` & `types/`)

- Type-safe data models for core entities: Payment, Merchant, Transaction, User, API Key, Webhook
- Comprehensive TypeScript definitions in `types/` for API contracts, blockchain interactions

## Key Technical Features

### Stripe Feature Parity

The implementation mirrors Stripe's API patterns exactly:
- **Payment Intents**: `sbtc.payments.create()` matches `stripe.paymentIntents.create()`
- **Webhooks**: HMAC-signed, reliable delivery system
- **Dashboard**: Transaction history, analytics, settings management
- **Test Mode**: Full testnet environment with same API patterns

### Bitcoin Integration Advantages

- **No Chargebacks**: Bitcoin finality protects merchants (vs 0.6% chargeback rate)
- **83% Lower Fees**: 0.5% vs Stripe's 2.9% + 30¢
- **Global by Default**: No country restrictions or currency conversion
- **Instant Settlement**: No 2-7 day banking delays

### Security Implementation

- **Multi-sig wallets** for merchant funds  
- **Hardware Security Modules (HSMs)** for key management
- **AES-256 encryption** at rest, **TLS 1.3** in transit
- **HMAC-SHA256** API request signing
- **SOC 2 Type II** compliant infrastructure

## Development Guidelines

### API Design Philosophy

**Mirror Stripe exactly** so developers already know the syntax:
```javascript
// Stripe pattern
stripe.paymentIntents.create({amount: 2000, currency: 'usd'})

// Our identical pattern  
sbtc.payments.create({amount: 100000, currency: 'btc'})
```

### Integration Target

**3-line integration** (simpler than Stripe's 7 lines):
```jsx
import { SbtcPayment } from '@sbtc-gateway/react';

<SbtcPayment 
  amount={0.001} 
  apiKey="pk_test_..." 
  onSuccess={handleSuccess} 
/>
```

### Testing Strategy

- **Unit Tests**: 70% coverage target with Jest + React Testing Library
- **Integration Tests**: 20% coverage for API endpoints and services  
- **E2E Tests**: 10% coverage with Playwright for complete payment flows
- **Real Bitcoin Testing**: Use testnet for complete transaction validation

### Business Context

This is positioned for the **$3,000 Stacks Builder Challenge** with clear post-hackathon growth strategy:
- **Immediate**: Win hackathon, onboard 100+ merchants for beta
- **6 months**: $1M+ transaction volume, seed funding
- **2 years**: Series A, international expansion, enterprise features

The codebase should reflect **production-ready quality** from day one, not a typical hackathon prototype, as the goal is building the actual "Stripe for Bitcoin" that could scale to $95B valuation.