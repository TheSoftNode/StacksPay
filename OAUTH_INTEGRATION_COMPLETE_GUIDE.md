# 🔐 Complete OAuth Integration Guide for StacksPay

## 🎯 Overview
This guide shows you how to add GitHub and Google OAuth authentication to your existing StacksPay system without breaking anything.

---

## 📋 **Step 1: Install Required Dependencies**

### Backend Dependencies:
```bash
cd backend
npm install passport passport-google-oauth20 passport-github2 express-session
npm install --save-dev @types/passport @types/passport-google-oauth20 @types/passport-github2
```

### Frontend Dependencies:
```bash
cd frontend  
npm install @next-auth/prisma-adapter next-auth
```

---

## 🔑 **Step 2: Get OAuth Credentials**

### For Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Set authorized redirect URLs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `https://yourdomain.com/api/auth/google/callback` (production)

### For GitHub OAuth:
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL:
   - `http://localhost:3001/api/auth/github/callback` (development)
   - `https://yourdomain.com/api/auth/github/callback` (production)

---

## 🌐 **Step 3: Environment Variables**

### Backend (.env):
```bash
# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Session Secret (generate a random string)
SESSION_SECRET=your_very_secure_random_session_secret_here

# Frontend URL for redirects
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local):
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_very_secure_random_secret_here

# Same OAuth credentials as backend
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

---

## ⚙️ **Step 4: Files Already Created/Modified**

✅ **Backend Files:**
- `/backend/src/services/oauth-service.ts` - OAuth configuration
- `/backend/src/routes/oauth.routes.ts` - OAuth endpoints  
- `/backend/src/models/Merchant.ts` - Updated with OAuth fields
- `/backend/src/index.ts` - Added session & passport middleware

✅ **Frontend Files:**
- `/frontend/app/(auth)/login/page.tsx` - Added Google & GitHub buttons
- `/frontend/app/(auth)/register/page.tsx` - Added Google & GitHub buttons

---

## 🔄 **Step 5: How OAuth Flow Works**

### **Simple User Journey:**
1. **User clicks "Continue with Google"** on login page
2. **Redirected to Google** → User authorizes your app
3. **Google sends user back** with authorization code
4. **Your backend exchanges code** for user profile info
5. **Check if user exists:**
   - **Exists:** Update their info, log them in
   - **New:** Create merchant account, log them in
6. **Redirect to dashboard** with session cookie set

### **Technical Flow:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │   Google    │
│   (Login)   │    │   (OAuth)   │    │    API      │
└─────┬───────┘    └─────┬───────┘    └─────┬───────┘
      │                  │                  │
      │ 1. Click Google  │                  │
      ├─────────────────►│                  │
      │                  │ 2. Redirect      │
      │                  ├─────────────────►│
      │                  │                  │
      │                  │ 3. Auth Code     │
      │                  │◄─────────────────┤
      │                  │                  │
      │ 4. Session Set   │                  │
      │◄─────────────────┤                  │
      │                  │                  │
      │ 5. Redirect /dashboard              │
      ├─────────────────────────────────────┘
```

---

## 🛡️ **Step 6: Security Features**

✅ **Built-in Security:**
- **CSRF Protection:** Session-based authentication
- **Secure Cookies:** HttpOnly, Secure flags in production  
- **Rate Limiting:** Prevent OAuth abuse
- **Data Validation:** Email, profile verification
- **Session Management:** Proper login/logout handling

---

## 🧪 **Step 7: Testing the Integration**

### **Test Google OAuth:**
1. Start your backend: `cd backend && npm run dev`
2. Start your frontend: `cd frontend && npm run dev`
3. Go to `http://localhost:3000/login`
4. Click "Google" button
5. Authorize with your Google account
6. Should redirect to dashboard

### **Test GitHub OAuth:**
1. Same steps as Google
2. Click "GitHub" button instead
3. Authorize with your GitHub account
4. Should redirect to dashboard

### **Troubleshooting:**
- **"Invalid redirect URI"** → Check OAuth app settings
- **"Client ID not found"** → Check environment variables
- **"Session error"** → Check session secret is set
- **"Database error"** → Check MongoDB connection

---

## 📊 **Step 8: Database Changes**

The merchant schema now supports OAuth with these new fields:
```typescript
interface IMerchant {
  // ... existing fields
  authMethod: 'email' | 'wallet' | 'google' | 'github';
  googleId?: string;
  githubId?: string;  
  avatar?: string;
  loginMethod?: 'email' | 'wallet' | 'google' | 'github';
}
```

**Migration:** No migration needed! New fields are optional and won't break existing merchants.

---

## 🎯 **Payment Process Documentation**

## **Simple Payment Journey for High School Understanding:**

### **🏪 For Store Owners (Merchants):**
1. **Sign up** → Create business account (now with Google/GitHub!)
2. **Get API keys** → Like secret passwords for your website
3. **Add payment code** → Copy-paste our code into your website  
4. **Receive money** → Get real USD in your bank account

### **💰 For Customers:**
1. **Shop online** → Add items to cart on merchant's website
2. **Click "Pay with Bitcoin"** → Goes to our payment page
3. **Connect wallet** → Use Leather, Xverse, or other Bitcoin wallet
4. **Send payment** → Bitcoin gets converted to USD automatically
5. **Get receipt** → Confirmation email and receipt

---

## ⚡ **Technical Services Needed:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Your Website  │    │   StacksPay     │    │   Bitcoin       │
│   (Store)       │────│   (Gateway)     │────│   Network       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Product Catalog │    │ Payment Pages   │    │ Transaction     │
│ Shopping Cart   │    │ Currency Convert│    │ Confirmation    │
│ Checkout Button │    │ Fraud Detection │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **External Services You Need:**
1. **Bitcoin Node** - Connect to blockchain
2. **Price Feed** - Get current Bitcoin/USD rates (CoinGecko API)
3. **Exchange** - Convert Bitcoin to USD (Coinbase, Kraken)
4. **Bank API** - Send USD to merchants (Stripe Connect, Plaid)
5. **Email Service** - Send receipts (SendGrid, Mailgun)

---

## 🔄 **Step-by-Step Payment Process:**

### **1. Merchant Creates Payment:**
```javascript
// Your website calls StacksPay API
POST /api/payments
{
  "amount": 99.99,           // Price in USD
  "currency": "USD",
  "description": "Cool T-shirt",
  "customer_email": "customer@email.com"
}

// StacksPay responds with payment link
{
  "payment_id": "pay_123456",
  "payment_url": "https://pay.stackspay.com/pay_123456",
  "expires_at": "2024-01-15T11:30:00Z"
}
```

### **2. Customer Pays:**
```javascript
// Payment page shows:
- Product: Cool T-shirt ($99.99)
- Bitcoin amount needed: 0.0022 BTC (calculated from current price)
- QR code for mobile wallets
- "Connect Wallet" button for desktop

// Customer's wallet sends:
{
  "from": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "to": "bc1qstackspay_payment_address_here",
  "amount": 0.0022,  // BTC amount
  "memo": "pay_123456"  // Links transaction to your payment
}
```

### **3. StacksPay Processes:**
```javascript
// 1. Detect payment on blockchain
const transaction = await bitcoinNode.getTransaction(txHash);

// 2. Verify it matches our payment
if (transaction.memo === "pay_123456" && transaction.amount >= requiredAmount) {
  
  // 3. Wait for confirmation (usually 10-30 minutes)
  if (transaction.confirmations >= 1) {
    
    // 4. Convert Bitcoin to USD
    const usdAmount = await exchange.sell(transaction.amount, 'BTC', 'USD');
    
    // 5. Send USD to merchant's bank account
    await bank.transfer(usdAmount, merchant.bankAccount);
    
    // 6. Notify everyone
    await webhook.send(merchant.webhookUrl, {
      event: 'payment.completed',
      payment_id: 'pay_123456',
      amount: 99.99,
      status: 'completed'
    });
  }
}
```

### **4. Confirmations & Webhooks:**
```javascript
// Webhook sent to merchant's website
POST https://merchant-website.com/webhook
{
  "event": "payment.completed",
  "payment_id": "pay_123456", 
  "amount": 99.99,
  "currency": "USD",
  "customer_email": "customer@email.com",
  "bitcoin_amount": 0.0022,
  "transaction_hash": "abc123def456...",
  "timestamp": "2024-01-15T10:35:00Z"
}

// Merchant website updates order status
await database.orders.update(orderId, { 
  status: 'paid',
  payment_confirmed: true 
});

// Send confirmation emails
await email.send(customer.email, 'Payment Confirmed');
await email.send(merchant.email, 'Payment Received');
```

---

## ✅ **Step 9: Production Checklist**

Before going live:

**🔐 Security:**
- [ ] Use HTTPS in production
- [ ] Set secure environment variables
- [ ] Enable rate limiting
- [ ] Configure CORS properly

**🌐 URLs:**
- [ ] Update OAuth redirect URLs to production domain
- [ ] Update FRONTEND_URL environment variable
- [ ] Update webhook URLs

**📊 Monitoring:**
- [ ] Set up logging
- [ ] Monitor OAuth login rates
- [ ] Set up alerts for failed logins

**🧪 Testing:**
- [ ] Test OAuth on production domain
- [ ] Test email notifications
- [ ] Test session persistence
- [ ] Test logout functionality

---

## 🎉 **Congratulations!**

Your StacksPay system now supports:
- ✅ **Email/Password Login** (existing)
- ✅ **Stacks Wallet Login** (existing)  
- ✅ **Google OAuth Login** (new!)
- ✅ **GitHub OAuth Login** (new!)

Users can now sign up and log in using their preferred method, and all accounts work seamlessly together in your merchant dashboard!

---

## 🆘 **Need Help?**

**Common Issues:**
1. **OAuth redirect errors** → Check callback URLs in OAuth app settings
2. **Session not persisting** → Verify SESSION_SECRET is set
3. **Database errors** → Check MongoDB connection and schema
4. **Frontend OAuth buttons not working** → Check API endpoints are running

**Support:**
- Check the browser console for error messages
- Check backend logs for detailed error information
- Verify all environment variables are set correctly