# Merchant Test Server

Test your StacksPay integration with real API keys from onboarding!

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd merchant-test-server
npm install
```

### 2. Configure API Key

Your API key is already in `.env`:
```
STACKSPAY_API_KEY=sk_test_a509930f3b2811bb5761d2195cf022ce3b3598e53ffa8fdf0500b9c85e9fbde6
```

### 3. Make Sure Backend is Running

In a separate terminal:
```bash
cd ../backend
npm run dev
```

Backend should be running on `http://localhost:4000`

---

## 🧪 Testing Methods

### **Option 1: Quick Test Script (Recommended)**

```bash
npm run test
```

This will:
- ✅ Create a test payment
- ✅ Show payment details
- ✅ Check payment status
- ✅ List all payments

**Expected Output:**
```
╔════════════════════════════════════════════════════╗
║  🧪 Testing StacksPay Payment Creation            ║
╚════════════════════════════════════════════════════╝

✅ SUCCESS! Payment created

Payment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Payment ID:       pay_abc123...
Status:           pending
Expected Amount:  1000000 microSTX (1 STX)
Unique Address:   ST1ABC...
Payment Link:     http://localhost:3000/pay/abc123
```

---

### **Option 2: Start the Merchant Server**

```bash
npm start
```

Server runs on `http://localhost:3001`

**Then test with cURL:**

```bash
# Create a payment
curl -X POST http://localhost:3001/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "12345",
    "amount": 1,
    "customerEmail": "test@example.com",
    "description": "Test Order"
  }'

# Get payment status
curl http://localhost:3001/payment/pay_abc123...

# List all payments
curl http://localhost:3001/payments
```

---

### **Option 3: cURL Script (Direct)**

```bash
npm run test-curl
```

This calls the StacksPay API directly with cURL.

---

### **Option 4: Manual cURL Test**

Test directly against StacksPay backend:

```bash
curl -X POST http://localhost:4000/api/payments/stx \
  -H "Authorization: Bearer sk_test_a509930f3b2811bb5761d2195cf022ce3b3598e53ffa8fdf0500b9c85e9fbde6" \
  -H "Content-Type: application/json" \
  -d '{
    "expectedAmount": 1000000,
    "metadata": "Test payment",
    "expiresInMinutes": 30,
    "customerEmail": "test@example.com"
  }'
```

---

## 📖 API Endpoints

### Merchant Server Endpoints (Port 3001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server health check |
| `/create-payment` | POST | Create a new payment |
| `/payment/:id` | GET | Get payment status |
| `/payments` | GET | List all payments |
| `/success` | GET | Payment success page |
| `/cancel` | GET | Payment cancel page |

### StacksPay API Endpoints (Port 4000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/stx` | POST | Create STX payment |
| `/api/payments/stx/:id` | GET | Get payment status |
| `/api/payments/stx` | GET | List payments |
| `/api/payments/stx/:id/cancel` | POST | Cancel payment |

---

## 🎯 Test Flow

1. **Create Payment**
   ```bash
   npm run test
   ```

2. **Copy Payment Link**
   ```
   Payment Link: http://localhost:3000/pay/abc123...
   ```

3. **Open in Browser**
   - See payment details
   - QR code for mobile wallets
   - Unique STX address

4. **Make Payment**
   - Send 1 STX to the unique address
   - Or scan QR code with wallet

5. **Watch Backend Logs**
   - Chainhook detects payment
   - Payment status updates to 'completed'
   - Webhook fires to merchant (if configured)

---

## 🔑 Your API Key

Your test API key from onboarding:
```
sk_test_a509930f3b2811bb5761d2195cf022ce3b3598e53ffa8fdf0500b9c85e9fbde6
```

**Security Notes:**
- ✅ This is a TEST key (starts with `sk_test_`)
- ✅ Safe for testing and development
- ❌ Don't use in production
- ❌ Don't commit to git
- ✅ Store in `.env` file

---

## 🐛 Troubleshooting

### "Connection Refused"
```
❌ Error: connect ECONNREFUSED 127.0.0.1:4000
```

**Solution:** Start the backend server
```bash
cd ../backend
npm run dev
```

### "Invalid API Key"
```
❌ FAILED: Invalid API key format
```

**Solution:** Check `.env` file has correct API key

### "Unauthorized"
```
❌ FAILED: 401 Unauthorized
```

**Solution:**
1. Check API key in `.env`
2. Make sure key starts with `sk_test_` or `sk_live_`
3. Verify backend is running

---

## 📝 Example Payment Creation

```javascript
const response = await fetch('http://localhost:4000/api/payments/stx', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_test_a509930f3b2811bb5761d2195cf022ce3b3598e53ffa8fdf0500b9c85e9fbde6',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    expectedAmount: 1000000,        // 1 STX in microSTX
    metadata: 'Order #12345',       // Your reference
    expiresInMinutes: 30,           // Payment expiry
    customerEmail: 'test@example.com'
  })
});

const { payment } = await response.json();

// Use payment.paymentLink to redirect customer
window.location.href = payment.paymentLink;
```

---

## 🎉 Success Criteria

After running tests, you should see:

✅ Payment created successfully
✅ Payment ID returned
✅ Payment link generated
✅ QR code created
✅ Unique STX address assigned
✅ Status is 'pending'
✅ Can fetch payment status
✅ Can list all payments

---

## 📚 Next Steps

1. **Test Webhooks**
   - Configure webhook URL in onboarding (step 6)
   - Test webhook delivery
   - Verify signature validation

2. **Test Real Payment**
   - Send actual STX to payment address
   - Watch Chainhook detect it
   - See webhook fire

3. **Integrate into Your App**
   - Use this test server as reference
   - Add payment creation to your backend
   - Handle webhooks in your server

---

## 🔗 Documentation

- [API Key & Webhook Usage](../API_KEY_WEBHOOK_USAGE.md)
- [Onboarding Implementation](../ONBOARDING_IMPLEMENTATION.md)
- [Backend API Docs](../backend/ONBOARDING_API.md)

---

**Happy Testing! 🚀**
