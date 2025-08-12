# sBTC Payment Gateway - Open Source Project

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Stacks](https://img.shields.io/badge/Built%20on-Stacks-5546FF)
![sBTC](https://img.shields.io/badge/Powered%20by-sBTC-FF6B1A)

## 🌟 **Built for the Stacks Builders Competition**

**"Stripe for sBTC"** - A complete payment gateway that makes accepting Bitcoin payments as easy as traditional payments, powered by sBTC on Stacks.

### 🎯 **Hackathon Requirements Met**

- ✅ **Working MVP**: Processes actual sBTC testnet transactions
- ✅ **Multi-currency**: Accept BTC, STX, or sBTC - settle in sBTC
- ✅ **Stripe-like DX**: Familiar API, easy integration
- ✅ **Complete ecosystem**: Payment → Settlement → USD cashout

## 🚀 **Quick Start (5 minutes)**

### 1. **For Developers (API Integration)**

```bash
# Clone and setup
git clone https://github.com/TheSoftNode/sbtc-payment-gateway
cd sbtc-payment-gateway
npm install

# Environment setup
cp .env.example .env.local
# Add your MongoDB and API keys

# Start development
npm run dev
```

### 2. **For Merchants (No Stacks Experience Required)**

1. **Sign up**: No Stacks wallet needed initially!
2. **Get API key**: Start accepting payments immediately
3. **Add wallet later**: Connect Stacks wallet when ready

### 3. **For Customers (Multiple Payment Options)**

- **Bitcoin**: Traditional, secure (10-30 min)
- **STX**: Fast (6 seconds), cheap ($0.01 fees) - perfect for demos!
- **sBTC**: Direct sBTC payment for advanced users

## 🏗️ **Architecture & Innovation**

### **Multi-Currency Flow**

```
Customer Pays → Auto-Convert → Merchant Gets → Easy Cashout
    ↓              ↓             ↓            ↓
BTC/STX/sBTC → Real-time rates → sBTC → USD/USDC/USDT
```

### **Tech Stack**

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: MongoDB, Redis, WebSocket real-time updates
- **Blockchain**: sBTC (Emily API), Stacks.js, Bitcoin integration
- **APIs**: RESTful design, Stripe-compatible developer experience

## 📱 **Live Demo**

### **Demo URLs**

- **Live App**: [https://sbtc-gateway.vercel.app](.) _(deploy for hackathon)_
- **Merchant Dashboard**: `/dashboard`
- **API Docs**: `/docs`
- **Payment Demo**: `/checkout/demo`

### **Demo Script (Perfect for 5-min video)**

1. **Show merchant signup** (no wallet required)
2. **Create payment via API**
3. **Customer pays with STX** (6-second confirmation! ⚡)
4. **Real-time updates**
5. **sBTC settlement shown**

## 🎖️ **Hackathon Competitive Advantages**

### **1. Newcomer-Friendly**

- ✅ No Stacks wallet required for merchant registration
- ✅ Progressive onboarding (add wallet later)
- ✅ Clear documentation for all experience levels

### **2. Demo Appeal**

- ✅ STX payments confirm in 6 seconds (live demo magic!)
- ✅ Real-time WebSocket updates
- ✅ Multi-currency selection

### **3. Production-Ready**

- ✅ Enterprise-grade architecture
- ✅ Comprehensive error handling
- ✅ Security best practices (API keys, JWT, rate limiting)

### **4. Complete Ecosystem**

- ✅ Payment processing
- ✅ Merchant dashboard
- ✅ Developer APIs
- ✅ Currency conversion
- ✅ Webhook notifications
- ✅ Analytics and reporting

## 🛠️ **Contributing**

This is an open-source project built for the Stacks community!

### **Development Setup**

```bash
# Install dependencies
npm install

# Setup database
npm run setup-db

# Run tests
npm test

# Start development server
npm run dev
```

### **Project Structure**

```
├── app/                 # Next.js 14 app router
├── components/          # React components
├── lib/services/        # Core business logic
├── models/             # Database models
├── docs/               # Comprehensive documentation
└── scripts/            # Utility scripts
```

### **Key Services**

- `sbtc-service.ts` - sBTC/Bitcoin operations
- `wallet-service.ts` - Stacks wallet integration
- `payment-service.ts` - Payment orchestration
- `conversion-service.ts` - Multi-currency conversion
- `auth-service.ts` - Authentication & API keys

## 📋 **Roadmap**

### **Phase 1: Hackathon MVP** ✅

- sBTC testnet transactions
- Multi-currency payment flow
- Basic merchant dashboard
- API documentation

### **Phase 2: Production** (Post-Hackathon)

- Mainnet deployment
- Advanced analytics
- Mobile app
- Plugin ecosystem (WooCommerce, Shopify, etc.)

### **Phase 3: Expansion**

- Lightning Network integration
- DeFi yield opportunities
- Global compliance features
- Enterprise partnerships

## 🤝 **Community**

### **Get Involved**

- **Discord**: [Stacks Builder Challenge](https://t.me/stacksbuilders)
- **Twitter**: Tweet your implementations with #BuildOnStacks #sBTC
- **GitHub**: Star ⭐, fork 🍴, contribute 💻

### **Support**

- **Documentation**: `/docs`
- **API Reference**: `/docs/api`
- **Community**: Discord #sbtc-payment-gateway
- **Issues**: GitHub Issues for bugs/features

## 📄 **License**

MIT License - feel free to use, modify, and distribute!

---

**Built with ❤️ for the Stacks ecosystem**  
_Making Bitcoin programmable, one payment at a time_ 🚀
