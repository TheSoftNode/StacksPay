# Merchant Guide - Accept Bitcoin Payments Like Stripe

**Audience**: Business Owners and Store Managers  
**Goal**: Start accepting Bitcoin payments in under 30 minutes  
**No Technical Knowledge Required**

## 🚀 Why Choose sBTC Payment Gateway?

### Compare to Traditional Payment Processors

| Feature              | sBTC Gateway      | Stripe      | PayPal         | Square      |
| -------------------- | ----------------- | ----------- | -------------- | ----------- |
| **Transaction Fees** | 1-2%              | 2.9% + 30¢  | 3.5% + 15¢     | 2.9% + 30¢  |
| **Chargebacks**      | ❌ None           | ✅ Possible | ✅ Possible    | ✅ Possible |
| **Settlement Time**  | ⚡ Instant        | 2-7 days    | 1-3 days       | 1-2 days    |
| **Global Access**    | 🌍 Worldwide      | Limited     | Limited        | Limited     |
| **Account Holds**    | ❌ Never          | ✅ Possible | ✅ Common      | ✅ Possible |
| **Monthly Fees**     | ❌ None           | ❌ None     | ✅ $30/month   | ❌ None     |
| **Payment Types**    | Bitcoin + **STX** | Cards only  | Cards + PayPal | Cards only  |

### Key Benefits for Your Business

✅ **Lower Costs**: Save 50%+ on payment processing fees  
✅ **No Chargebacks**: Bitcoin/STX payments are final and irreversible  
✅ **Instant Settlement**: Receive sBTC immediately, no waiting days  
✅ **Global Customers**: Accept payments from anywhere in the world  
✅ **No Account Freezes**: Your funds are always accessible  
✅ **Multi-Currency**: Accept both Bitcoin AND STX (Stacks tokens)  
✅ **Modern Wallets**: Support for Xverse, Hiro, Leather wallets  
✅ **Fast Payments**: STX payments settle in 6 seconds vs 10+ minutes for Bitcoin

## 🏪 Getting Started - 3 Simple Steps

### Step 1: Create Your Merchant Account (5 minutes)

**Visit** [dashboard.sbtc-gateway.com](https://dashboard.sbtc-gateway.com)

**Fill out the form:**

```
Business Name: [Your Store Name]
Email: [your-email@domain.com]
Business Type: [E-commerce / SaaS / Marketplace / etc.]
Website: [https://yourstore.com]
```

**Provide your addresses** (where you'll receive payments):

- **Stacks Address**: For receiving sBTC (both Bitcoin and STX payments end up here)
- **Bitcoin Address**: Optional, for direct Bitcoin handling
- If you don't have addresses, we'll help you create them

### Step 2: Configure Payment Settings (10 minutes)

**Set your payment limits:**

```
Minimum Payment: $1.00 (10,000 satoshis)
Maximum Payment: $1,000.00 (0.1 BTC)
```

**Choose your currency preferences:**

```
Accept Bitcoin: ✅ Yes (traditional, secure)
Accept STX: ✅ Yes (fast, cheap)
Auto-convert to USD: Yes/No
Email notifications: Yes
Webhook URL: [your-website.com/webhooks] (optional)
```

**Get your API keys:**

```
Test Key: sk_test_[your-test-key]
Live Key: sk_live_[your-live-key]
```

### Step 3: Add to Your Website (15 minutes)

Choose your integration method:

#### Option A: No-Code Solutions

**Shopify Store:**

1. Install "sBTC Payment Gateway" app from Shopify App Store
1. Install "sBTC Payment Gateway" app from Shopify App Store
1. Enter your API key in app settings
1. Enable Bitcoin and STX payments in checkout
1. Customers can choose their preferred payment method

**WooCommerce (WordPress):**

1. Download sBTC Gateway plugin
2. Upload to your WordPress plugins folder
3. Configure with your API key
4. Enable both Bitcoin and STX in payment settings

**Squarespace/Wix:**

1. Use our payment link generator
2. Create payment buttons for products
3. Customers can choose Bitcoin or STX
4. Embed on your product pages

#### Option B: Simple HTML Integration

**For any website, add this to your checkout page:**

```html
<!-- Payment Button -->
<button id="pay-with-crypto" onclick="createPayment()">Pay with Bitcoin or STX</button>

<script>
  async function createPayment() {
    // Call your server to create payment
    const response = await fetch('/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 50000, // $5.00 in satoshis
        payment_methods: ['bitcoin', 'stx'], // Enable both options
        customer_email: 'customer@example.com',
        order_id: 'order_123',
      }),
    });

    const payment = await response.json();

    // Redirect to payment page with currency options
    window.location.href = payment.payment_url;
  }
</script>
```

## 📊 Managing Your Payments

### Dashboard Overview

**Real-time Statistics:**

- Today's revenue
- Number of payments
- Success rate
- Top countries

**Recent Transactions:**

- Payment amount and status
- Customer information
- Bitcoin transaction details
- Time stamps

### Payment Statuses Explained

| Status         | What it Means                    | What to Do                       | Time Frame |
| -------------- | -------------------------------- | -------------------------------- | ---------- |
| **Pending**    | Waiting for customer payment     | Nothing - payment window is open | 15-30 min  |
| **Processing** | Bitcoin/STX received, confirming | Nothing - automatic processing   | 1-10 min   |
| **Converting** | STX converting to sBTC           | Nothing - automatic conversion   | 30 seconds |
| **Completed**  | sBTC received in your wallet     | Fulfill the order                | Instant    |
| **Failed**     | Payment failed or expired        | Contact customer if needed       | -          |
| **Refunded**   | Payment returned to customer     | Update your records              | 1-2 days   |

### Handling Customer Questions

**Common Customer Questions:**

**Q: "Is this safe?"**  
A: "Yes! Bitcoin and STX payments are cryptographically secure and widely used. You're just paying with digital currency instead of a credit card."

**Q: "I don't have Bitcoin or STX."**  
A: "You can buy Bitcoin on apps like Cash App, Coinbase, or buy STX on Binance, OKX. Or use a Stacks wallet like Xverse that has built-in purchasing."

**Q: "What's STX and why should I use it?"**  
A: "STX is faster (6 seconds vs 10+ minutes) and cheaper ($0.01 vs $1-5) than Bitcoin. It automatically converts to sBTC for your purchase."

**Q: "How long does it take?"**  
A: "STX payments: 6 seconds. Bitcoin payments: 10-30 minutes. You'll get email confirmation when complete."

**Q: "Can I get a refund?"**  
A: "Yes, we can process refunds in either STX or sBTC, though crypto payments are typically final."

## 💰 Understanding Pricing

### Transaction Fees

**Our Fee Structure:**

- **1.5%** per successful transaction
- **No setup fees**
- **No monthly fees**
- **No hidden costs**

**Example Cost Comparison:**

| Sale Amount | sBTC Gateway | Stripe | PayPal | You Save |
| ----------- | ------------ | ------ | ------ | -------- |
| $100        | $1.50        | $3.20  | $3.65  | $1.70+   |
| $500        | $7.50        | $14.80 | $17.75 | $7.30+   |
| $1,000      | $15.00       | $29.30 | $35.15 | $14.30+  |

### What You Receive

**You get sBTC (Stacks Bitcoin):**

- 1 sBTC = 1 Bitcoin
- Can be used in DeFi applications
- Easily converted to USD through exchanges
- Held in your own wallet (you control it)

**Converting to USD:**

- Use exchanges like Coinbase, Kraken, or Binance
- Typically takes 1-2 business days
- Standard exchange fees apply (usually 0.5-1%)

## 🔧 Platform Integrations

### E-commerce Platforms

#### Shopify

```
1. Go to Apps → Visit Shopify App Store
2. Search "sBTC Payment Gateway"
3. Click "Add app" and install
4. Enter your API key in settings
5. Bitcoin payments now available at checkout
```

#### WooCommerce

```
1. Download plugin from our website
2. Upload to WordPress: Plugins → Add New → Upload
3. Activate plugin
4. Go to WooCommerce → Settings → Payments
5. Enable sBTC Gateway and enter API key
```

#### Magento

```
1. Download our Magento extension
2. Install via Magento Connect
3. Configure in System → Configuration → Payment Methods
4. Enter API credentials and test
```

### Custom Websites

**PHP Example:**

```php
<?php
// Create payment
$payment_data = [
    'amount' => 50000, // $5 in satoshis
    'customer_email' => $_POST['email'],
    'metadata' => ['order_id' => $order_id]
];

$response = wp_remote_post('https://api.sbtc-gateway.com/v1/payments', [
    'headers' => ['Authorization' => 'Bearer ' . $api_key],
    'body' => json_encode($payment_data)
]);

$payment = json_decode($response['body']);
header('Location: ' . $payment->payment_url);
?>
```

## 📱 Mobile Experience

### Customer Mobile Flow

**Step 1: Customer checks out**

- Selects "Pay with Bitcoin"
- Gets redirected to payment page

**Step 2: Payment page loads**

- Large QR code displayed
- Bitcoin address shown
- Amount clearly visible
- Timer showing time remaining

**Step 3: Customer pays**

- Opens Bitcoin wallet app
- Scans QR code or copies address
- Confirms payment in wallet
- Returns to your website

**Step 4: Confirmation**

- Payment detected automatically
- Customer gets success message
- Order confirmation email sent
- You get payment notification

### Mobile Optimization Features

✅ **Large QR codes** for easy scanning  
✅ **One-tap address copying**  
✅ **Real-time payment status**  
✅ **Mobile wallet deep linking**  
✅ **Progress indicators**  
✅ **Clear instructions**

## 🛠️ Testing Your Integration

### Test Mode

**Use test API keys** for safe testing:

```
Test Key: sk_test_[your-test-key]
Test Environment: https://dashboard-test.sbtc-gateway.com
```

**Test with these amounts:**

- $5 (50,000 sats) → Successful payment
- $10 (100,000 sats) → Payment timeout
- $15 (150,000 sats) → Payment failure

### Going Live

**Checklist before launching:**

- [ ] Test payments work correctly
- [ ] Orders are fulfilled automatically
- [ ] Email notifications are working
- [ ] Customer support process is ready
- [ ] Switched to live API keys
- [ ] Informed your team about Bitcoin payments

## 📞 Support & Help

### Getting Help

**Documentation:** [docs.sbtc-gateway.com](https://docs.sbtc-gateway.com)  
**Merchant Support:** [merchant-support@sbtc-gateway.com](mailto:merchant-support@sbtc-gateway.com)  
**Phone Support:** 1-800-SBTC-PAY (business hours)  
**Live Chat:** Available in merchant dashboard

### Common Issues & Solutions

**Issue: Payments not appearing in dashboard**

- Check that you're using the correct API key
- Verify webhook URL is configured correctly
- Contact support with payment ID

**Issue: Customer says payment failed**

- Check payment status in dashboard
- Verify Bitcoin transaction on blockchain
- May need up to 6 confirmations (1 hour)

**Issue: How to process refunds**

- Go to payment in dashboard
- Click "Refund" button
- Enter refund amount
- Customer receives Bitcoin back

## 🎯 Best Practices

### Optimizing Conversions

**Make Bitcoin payments prominent:**

- Add Bitcoin logo to payment options
- Mention "lower fees" and "instant processing"
- Show Bitcoin acceptance on homepage

**Educate your customers:**

- Add "What is Bitcoin?" FAQ
- Provide step-by-step payment guide
- Offer customer support for Bitcoin questions

**Monitor and optimize:**

- Track Bitcoin payment conversion rates
- Survey customers about payment experience
- Adjust payment flow based on feedback

### Security Best Practices

**Protect your API keys:**

- Never share API keys publicly
- Use environment variables in code
- Rotate keys regularly

**Monitor your account:**

- Set up email alerts for large payments
- Review transactions daily
- Report suspicious activity immediately

**Backup your wallet:**

- Backup your Stacks wallet private key
- Store backup in multiple secure locations
- Test wallet recovery process

---

**Ready to start accepting Bitcoin payments?**  
[Sign up now](https://dashboard.sbtc-gateway.com) and be processing payments in 30 minutes!
