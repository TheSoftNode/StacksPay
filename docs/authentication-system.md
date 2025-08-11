# Authentication System Documentation

## 🎯 **Overview**

Our sBTC Payment Gateway implements a **comprehensive three-layer authentication system** designed to handle different types of users and use cases in the hackathon-winning solution.

## 🏗️ **Three-Layer Authentication Architecture**

### **Layer 1: API Key Authentication (Merchants → API)**

- **Purpose**: Secure merchant-to-API communication
- **Use Case**: Payment processing, merchant operations
- **Pattern**: `Authorization: Bearer sk_test_...` or `Authorization: Bearer sk_live_...`
- **Scope**: All `/api/v1/*` endpoints

### **Layer 2: JWT Session Authentication (Dashboard Users)**

- **Purpose**: Merchant dashboard web interface
- **Use Case**: Dashboard login, account management
- **Pattern**: HTTP-only cookies with JWT tokens
- **Scope**: All `/dashboard/*` pages and dashboard API calls

### **Layer 3: Wallet Authentication (Customers → Payments)**

- **Purpose**: Customer wallet signature verification
- **Use Case**: Payment authorization, wallet connection
- **Pattern**: Message signing with Stacks wallet
- **Scope**: Payment confirmation, customer verification

---

## 🔐 **Layer 1: API Key Authentication**

### **Implementation**

```typescript
// Generate API Key
const apiKey = await authService.generateApiKey(merchantId, ['read', 'write'], 'test');

// Use in API calls
fetch('/api/v1/payments', {
  headers: {
    Authorization: `Bearer ${apiKey.apiKey}`,
    'Content-Type': 'application/json',
  },
});
```

### **Features**

- ✅ **Environment-specific keys**: `sk_test_*` and `sk_live_*`
- ✅ **Granular permissions**: `read`, `write`, `webhooks`
- ✅ **Rate limiting**: Different limits for test/live keys
- ✅ **Usage tracking**: Last used timestamps and activity logs
- ✅ **IP restrictions**: Optional IP whitelisting
- ✅ **Automatic expiration**: Configurable key expiry

### **Security Features**

- Keys are bcrypt hashed in database
- Only key preview shown after creation
- Automatic usage logging and monitoring
- Failed authentication attempt tracking

---

## 🍪 **Layer 2: JWT Session Authentication**

### **Implementation**

```typescript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password, rememberMe: true }),
});

// Automatic cookie handling for dashboard pages
// Middleware validates JWT and adds merchant context
```

### **Features**

- ✅ **Secure HTTP-only cookies**: Prevents XSS attacks
- ✅ **Session management**: Multiple sessions per merchant
- ✅ **Remember me**: 30-day sessions vs 24-hour default
- ✅ **Session invalidation**: Logout revokes specific session
- ✅ **Progressive lockout**: Account locking after failed attempts
- ✅ **Activity tracking**: IP, user agent, last activity

### **Security Features**

- JWT tokens with refresh mechanism
- Session rotation on login
- Account lockout: 5 attempts = 15 min, 10 attempts = 1 hour
- Comprehensive audit logging

---

## 👛 **Layer 3: Wallet Authentication**

### **Implementation**

```typescript
// Generate challenge
const challenge = await fetch(
  '/api/auth/wallet?type=payment&address=ST...&paymentId=123&amount=50000'
);

// Sign with wallet (customer side)
const signature = await wallet.signMessage(challenge.message);

// Verify signature
const verification = await fetch('/api/auth/wallet', {
  method: 'POST',
  body: JSON.stringify({
    address,
    signature,
    message: challenge.message,
    publicKey,
    type: 'payment',
  }),
});
```

### **Features**

- ✅ **Message signing**: Cryptographic proof of wallet ownership
- ✅ **Payment authorization**: Specific payment context validation
- ✅ **Connection verification**: General wallet connection auth
- ✅ **Replay protection**: Time-limited challenge messages
- ✅ **Multi-wallet support**: Works with Xverse, Hiro, Leather
- ✅ **Address validation**: Ensures signature matches claimed address

### **Security Features**

- Challenge-response pattern prevents replay attacks
- Message format validation
- Timestamp verification (5-10 minute expiry)
- Address-signature matching verification

---

## 🛡️ **Security Architecture**

### **Comprehensive Protection**

```typescript
// Rate Limiting
- IP-based: 100 req/hour for unauthenticated
- API Key: 100-1000 req/hour based on tier
- Session: Standard web app rate limits

// Input Validation
- Zod schema validation on all endpoints
- Address format validation (Stacks addresses)
- Email and password complexity requirements

// Audit Logging
- All authentication events logged
- Failed attempts tracked with IP
- API key usage monitoring
- Wallet authentication events

// Account Security
- Progressive account lockout
- Password hashing with bcrypt (12 rounds)
- JWT secret rotation capability
- Session cleanup and management
```

---

## 📚 **API Reference**

### **Authentication Endpoints**

#### **POST /api/auth/register**

Register new merchant account

```json
{
  "name": "My Store",
  "email": "store@example.com",
  "password": "SecurePass123!",
  "businessType": "E-commerce",
  "stacksAddress": "ST000000000000000000002AMW42H",
  "website": "https://mystore.com"
}
```

#### **POST /api/auth/login**

Login to merchant dashboard

```json
{
  "email": "store@example.com",
  "password": "SecurePass123!",
  "rememberMe": false
}
```

#### **POST /api/auth/logout**

Logout and invalidate session

```json
{}
```

#### **GET /api/auth/api-keys**

List merchant's API keys (requires session)

#### **POST /api/auth/api-keys**

Generate new API key (requires session)

```json
{
  "environment": "test",
  "permissions": ["read", "write"]
}
```

#### **DELETE /api/auth/api-keys?keyId=xxx**

Revoke API key (requires session)

#### **GET /api/auth/wallet**

Generate wallet challenge

```
?type=payment&address=ST...&paymentId=123&amount=50000
```

#### **POST /api/auth/wallet**

Verify wallet signature

```json
{
  "address": "ST000000000000000000002AMW42H",
  "signature": "signature_from_wallet",
  "message": "challenge_message",
  "publicKey": "03797dd653...",
  "type": "payment",
  "paymentId": "123",
  "amount": 50000
}
```

---

## 🔧 **Middleware System**

### **Request Flow**

```
Request → Rate Limiting → Authentication → Authorization → Business Logic
```

### **Middleware Functions**

- `apiKeyMiddleware`: Validates API keys for `/api/v1/*`
- `sessionMiddleware`: Validates JWT sessions for `/dashboard/*`
- `rateLimitMiddleware`: Implements rate limiting
- `authAndRateLimitMiddleware`: Combined auth + rate limiting

### **Request Context Injection**

Middleware adds authentication context to request headers:

```typescript
// Available in downstream handlers
const merchant = getMerchantFromRequest(request);
const session = getSessionFromRequest(request);
```

---

## 🧪 **Testing**

### **Comprehensive Test Suite**

Run the authentication test suite:

```bash
node scripts/test-authentication.js
```

### **Test Coverage**

- ✅ Merchant registration flow
- ✅ API key generation and validation
- ✅ JWT session management
- ✅ Wallet signature verification
- ✅ Rate limiting enforcement
- ✅ Security features validation
- ✅ Error handling and edge cases

### **Manual Testing**

1. **API Key Testing**:

   ```bash
   curl -H "Authorization: Bearer sk_test_xxx" \
        http://localhost:3000/api/v1/payments
   ```

2. **Session Testing**:

   - Register account via `/api/auth/register`
   - Access dashboard pages
   - Generate API keys via dashboard

3. **Wallet Testing**:
   - Generate challenge for wallet address
   - Sign message with Stacks wallet
   - Submit signature for verification

---

## 🚀 **Production Deployment**

### **Environment Variables**

```bash
# Security (REQUIRED - change defaults!)
JWT_SECRET=your-secure-jwt-secret-here
JWT_REFRESH_SECRET=different-refresh-secret
API_KEY_SECRET=api-key-encryption-secret

# Database
MONGODB_URI=mongodb://your-production-db

# Stacks Network
STACKS_NETWORK=mainnet  # or testnet
STACKS_API_URL=https://api.hiro.so

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=3600000

# Session Configuration
SESSION_EXPIRY_HOURS=24
MAX_LOGIN_ATTEMPTS=5
```

### **Security Checklist**

- [ ] Change all default secrets
- [ ] Enable HTTPS in production
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting with Redis
- [ ] Enable audit log monitoring
- [ ] Configure backup for auth events
- [ ] Set up intrusion detection

---

## 🎯 **Hackathon Integration**

### **Perfect for the Three Customer Types**

1. **Merchants (API Key + Session Auth)**:

   - Register and get instant API access
   - Dashboard for payment management
   - Secure API key system for integrations

2. **Developers (API Key Auth)**:

   - Clean REST API with Bearer token auth
   - Comprehensive documentation
   - Test/live environment separation

3. **Customers (Wallet Auth)**:
   - Simple wallet signature verification
   - Works with all major Stacks wallets
   - No account creation required

### **Bonus Features Implemented**

- ✅ **Multi-layer security**: Three authentication methods
- ✅ **Enterprise-grade**: Audit logs, rate limiting, session management
- ✅ **Developer-friendly**: Clear API, good docs, test tools
- ✅ **Production-ready**: Scalable architecture, security best practices

This authentication system provides the solid foundation needed for our hackathon-winning sBTC payment gateway! 🏆
