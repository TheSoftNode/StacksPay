/**
 * Merchant Test Server
 *
 * This simulates a real merchant's backend server integrating with StacksPay
 * Use this to test payment creation with your API key from onboarding
 */

const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuration from .env
const STACKSPAY_API_KEY = process.env.STACKSPAY_API_KEY;
const STACKSPAY_API_URL = process.env.STACKSPAY_API_URL || 'http://localhost:4000';
const PORT = process.env.PORT || 3001;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Health check endpoint
 */
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Merchant Test Server is active',
    endpoints: {
      createPayment: 'POST /create-payment',
      listPayments: 'GET /payments',
      getPayment: 'GET /payment/:paymentId'
    }
  });
});

/**
 * Create a payment
 *
 * This is how a real merchant would create a payment from their server
 */
app.post('/create-payment', async (req, res) => {
  const { orderId, amount, customerEmail, description } = req.body;

  console.log(`\n${colors.cyan}🛒 Creating payment for order: ${orderId}${colors.reset}`);
  console.log(`   Amount: ${amount} STX`);
  console.log(`   Customer: ${customerEmail || 'Anonymous'}`);

  try {
    // Call StacksPay API
    const response = await fetch(`${STACKSPAY_API_URL}/api/payments/stx`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STACKSPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expectedAmount: Math.floor(amount * 1000000), // Convert STX to microSTX
        metadata: description || `Order #${orderId}`,
        expiresInMinutes: 30,
        customerEmail: customerEmail || 'test@example.com',
        successUrl: 'http://localhost:3001/success',
        cancelUrl: 'http://localhost:3001/cancel'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`${colors.green}✅ Payment created successfully!${colors.reset}`);
      console.log(`   Payment ID: ${data.payment.paymentId}`);
      console.log(`   Payment URL: ${data.payment.paymentLink}`);
      console.log(`   STX Address: ${data.payment.uniqueAddress}`);
      console.log(`   Status: ${data.payment.status}`);

      res.json({
        success: true,
        paymentId: data.payment.paymentId,
        paymentUrl: data.payment.paymentLink,
        qrCode: data.payment.qrCode,
        uniqueAddress: data.payment.uniqueAddress,
        expectedAmount: data.payment.expectedAmount,
        expiresAt: data.payment.expiresAt
      });
    } else {
      console.error(`${colors.red}❌ Payment creation failed: ${data.error}${colors.reset}`);
      res.status(400).json({
        success: false,
        error: data.error
      });
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get payment status
 */
app.get('/payment/:paymentId', async (req, res) => {
  const { paymentId } = req.params;

  console.log(`\n${colors.cyan}🔍 Checking payment status: ${paymentId}${colors.reset}`);

  try {
    const response = await fetch(`${STACKSPAY_API_URL}/api/payments/stx/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${STACKSPAY_API_KEY}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log(`${colors.green}✅ Payment found${colors.reset}`);
      console.log(`   Status: ${data.payment.status}`);
      console.log(`   Amount: ${data.payment.expectedAmount} microSTX`);

      res.json(data);
    } else {
      console.error(`${colors.red}❌ Payment not found${colors.reset}`);
      res.status(404).json(data);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * List all payments
 */
app.get('/payments', async (req, res) => {
  console.log(`\n${colors.cyan}📋 Fetching all payments...${colors.reset}`);

  try {
    const response = await fetch(`${STACKSPAY_API_URL}/api/payments/stx`, {
      headers: {
        'Authorization': `Bearer ${STACKSPAY_API_KEY}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log(`${colors.green}✅ Found ${data.payments?.length || 0} payments${colors.reset}`);
      res.json(data);
    } else {
      res.status(400).json(data);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Success page (where customer is redirected after payment)
 */
app.get('/success', (req, res) => {
  res.send(`
    <html>
      <head><title>Payment Successful</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: green;">✅ Payment Successful!</h1>
        <p>Thank you for your payment.</p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

/**
 * Cancel page
 */
app.get('/cancel', (req, res) => {
  res.send(`
    <html>
      <head><title>Payment Cancelled</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: orange;">Payment Cancelled</h1>
        <p>You cancelled the payment.</p>
        <a href="/">Back to Home</a>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${colors.green}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.green}║  🚀 Merchant Test Server Running                  ║${colors.reset}`);
  console.log(`${colors.green}╚════════════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\n${colors.cyan}Server:${colors.reset} http://localhost:${PORT}`);
  console.log(`${colors.cyan}StacksPay API:${colors.reset} ${STACKSPAY_API_URL}`);
  console.log(`${colors.cyan}API Key:${colors.reset} ${STACKSPAY_API_KEY.substring(0, 20)}...`);

  console.log(`\n${colors.yellow}📝 Test Commands:${colors.reset}`);
  console.log(`\n${colors.blue}1. Create a payment:${colors.reset}`);
  console.log(`   curl -X POST http://localhost:${PORT}/create-payment \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"orderId": "12345", "amount": 1, "customerEmail": "test@example.com"}'`);

  console.log(`\n${colors.blue}2. List all payments:${colors.reset}`);
  console.log(`   curl http://localhost:${PORT}/payments`);

  console.log(`\n${colors.blue}3. Or use the test script:${colors.reset}`);
  console.log(`   npm run test`);
  console.log(`\n`);
});
