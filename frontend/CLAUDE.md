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
- **Type checking**: `npx tsc --noEmit`

### Testing Commands

- **Unit tests**: `npm test` (Jest + React Testing Library with custom config)
- **E2E tests**: `npx playwright test` (runs on Chrome, Firefox, Safari)
- **Test setup file**: `tests/setup.ts` configures Jest environment
- **Coverage collection**: Automatically includes components/, lib/, and app/ directories

### Database & Setup Commands

- **Database setup**: `npm run setup-db` (initializes MongoDB collections)
- **Seed demo data**: Run `scripts/seed-data.ts` for development data
- **Demo environment**: Run `scripts/demo-setup.ts` for hackathon demos

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
- **`dashboard/`**: Merchant management interface (stats-cards.tsx, transaction-table.tsx)
- **`charts/`**: Analytics and reporting visualization (revenue-chart.tsx, payment-trends.tsx)
- **`forms/`**: Reusable form components (merchant-registration.tsx, api-key-form.tsx)
- **`landing/`**: Marketing components with hero, features, and demo sections
- **`providers/`**: React context providers (auth, Stacks, theme, toast)
- **`ui/`**: Shadcn/ui components with Radix UI primitives

### Configuration & Utilities (`config/`, `lib/utils/`)

- **`config/`**: Environment-specific settings (development.ts, production.ts, staging.ts)
- **`lib/utils/`**: Shared utilities (validation.ts, formatters.ts, crypto.ts, constants.ts)
- **`hooks/`**: Custom React hooks (use-auth.ts, use-payments.ts, use-wallet.ts, use-websocket.ts)

### Data Models (`models/` & `types/`)

- **`models/`**: Mongoose schemas (merchant.ts, payment.ts, transaction.ts, user.ts, api-key.ts, webhook.ts)
- **`types/`**: TypeScript definitions (api.ts, auth.ts, blockchain.ts, payment.ts, merchant.ts)
- **`store/`**: Client-side state management (auth-store.ts, payment-store.ts, merchant-store.ts)

### Testing Structure (`tests/`)

- **`unit/`**: Component and service unit tests with Jest
- **`integration/`**: API endpoint testing with supertest
- **`e2e/`**: End-to-end user flows with Playwright
- **`__mocks__/`**: Mock implementations for external services (mongodb.ts, stacks.ts)

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

### Key Dependencies & Technologies

- **UI Framework**: Next.js 14 with App Router, React 18, TypeScript 5
- **Styling**: Tailwind CSS with Shadcn/ui components, Radix UI primitives
- **Database**: MongoDB with Mongoose ODM, Redis for caching
- **Blockchain**: Stacks.js SDK, bitcoinjs-lib, sBTC SDK, Emily API integration
- **Authentication**: NextAuth.js with JWT and session management
- **Testing**: Jest + React Testing Library + Playwright
- **Real-time**: WebSocket support for live payment updates

### Business Context

This is positioned for the **$3,000 Stacks Builder Challenge** with clear post-hackathon growth strategy:
- **Immediate**: Win hackathon, onboard 100+ merchants for beta
- **6 months**: $1M+ transaction volume, seed funding
- **2 years**: Series A, international expansion, enterprise features

The codebase should reflect **production-ready quality** from day one, not a typical hackathon prototype, as the goal is building the actual "Stripe for Bitcoin" that could scale to $95B valuation.