/**
 * Test Payment Script
 *
 * Run this to test creating a payment without starting the server
 * Usage: npm run test
 */

const fetch = require('node-fetch');
require('dotenv').config();

const STACKSPAY_API_KEY = process.env.STACKSPAY_API_KEY;
const STACKSPAY_API_URL = process.env.STACKSPAY_API_URL || 'http://localhost:4000';

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function testCreatePayment() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  🧪 Testing StacksPay Payment Creation            ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════╝${colors.reset}\n`);

  console.log(`${colors.blue}API URL:${colors.reset} ${STACKSPAY_API_URL}`);
  console.log(`${colors.blue}API Key:${colors.reset} ${STACKSPAY_API_KEY.substring(0, 30)}...`);
  console.log(`\n${colors.yellow}🔄 Creating test payment...${colors.reset}\n`);

  try {
    const response = await fetch(`${STACKSPAY_API_URL}/api/payments/stx`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STACKSPAY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expectedAmount: 1000000, // 1 STX
        metadata: 'Test Payment from Script',
        expiresInMinutes: 30,
        customerEmail: 'test@example.com',
        successUrl: 'http://localhost:3001/success',
        cancelUrl: 'http://localhost:3001/cancel'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log(`${colors.green}✅ SUCCESS! Payment created${colors.reset}\n`);

      console.log(`${colors.magenta}Payment Details:${colors.reset}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`${colors.cyan}Payment ID:${colors.reset}       ${data.payment.paymentId}`);
      console.log(`${colors.cyan}Status:${colors.reset}           ${data.payment.status}`);
      console.log(`${colors.cyan}Expected Amount:${colors.reset}  ${data.payment.expectedAmount} microSTX (${data.payment.expectedAmount / 1000000} STX)`);
      console.log(`${colors.cyan}Unique Address:${colors.reset}   ${data.payment.uniqueAddress}`);
      console.log(`${colors.cyan}Payment Link:${colors.reset}     ${data.payment.paymentLink}`);
      console.log(`${colors.cyan}QR Code:${colors.reset}          ${data.payment.qrCode ? 'Generated ✓' : 'N/A'}`);
      console.log(`${colors.cyan}Expires At:${colors.reset}       ${new Date(data.payment.expiresAt).toLocaleString()}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

      console.log(`${colors.yellow}📱 Next Steps:${colors.reset}`);
      console.log(`   1. Open the payment link: ${colors.blue}${data.payment.paymentLink}${colors.reset}`);
      console.log(`   2. Scan the QR code with a Stacks wallet`);
      console.log(`   3. Send ${colors.green}1 STX${colors.reset} to: ${colors.cyan}${data.payment.uniqueAddress}${colors.reset}`);
      console.log(`   4. Wait for Chainhook to detect the payment`);
      console.log(`   5. Your webhook will be triggered!\n`);

      return data.payment;
    } else {
      console.error(`${colors.red}❌ FAILED: ${data.error}${colors.reset}\n`);

      if (response.status === 401) {
        console.log(`${colors.yellow}💡 Tip:${colors.reset} Check your API key in .env file`);
      }

      return null;
    }

  } catch (error) {
    console.error(`${colors.red}❌ ERROR: ${error.message}${colors.reset}\n`);

    if (error.message.includes('ECONNREFUSED')) {
      console.log(`${colors.yellow}💡 Tip:${colors.reset} Make sure the StacksPay backend is running:`);
      console.log(`   cd backend && npm run dev\n`);
    }

    return null;
  }
}

async function testGetPayment(paymentId) {
  console.log(`\n${colors.yellow}🔍 Checking payment status...${colors.reset}\n`);

  try {
    const response = await fetch(`${STACKSPAY_API_URL}/api/payments/stx/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${STACKSPAY_API_KEY}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log(`${colors.green}✅ Payment Status:${colors.reset} ${data.payment.status}`);
      console.log(`${colors.cyan}Amount:${colors.reset} ${data.payment.expectedAmount} microSTX`);
      console.log(`${colors.cyan}Created:${colors.reset} ${new Date(data.payment.createdAt).toLocaleString()}\n`);
    } else {
      console.error(`${colors.red}❌ Could not fetch payment${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
  }
}

async function testListPayments() {
  console.log(`\n${colors.yellow}📋 Listing all payments...${colors.reset}\n`);

  try {
    const response = await fetch(`${STACKSPAY_API_URL}/api/payments/stx`, {
      headers: {
        'Authorization': `Bearer ${STACKSPAY_API_KEY}`
      }
    });

    const data = await response.json();

    if (data.success && data.payments) {
      console.log(`${colors.green}✅ Found ${data.payments.length} payment(s)${colors.reset}\n`);

      data.payments.slice(0, 5).forEach((payment, index) => {
        console.log(`${colors.cyan}${index + 1}. ${payment.paymentId}${colors.reset}`);
        console.log(`   Status: ${payment.status}`);
        console.log(`   Amount: ${payment.expectedAmount} microSTX`);
        console.log(`   Created: ${new Date(payment.createdAt).toLocaleString()}\n`);
      });

      if (data.payments.length > 5) {
        console.log(`   ... and ${data.payments.length - 5} more\n`);
      }
    } else {
      console.log(`${colors.yellow}No payments found${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
  }
}

// Run tests
async function runTests() {
  console.log(`\n${colors.magenta}${'='.repeat(50)}${colors.reset}`);

  // Test 1: Create payment
  const payment = await testCreatePayment();

  if (payment) {
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Get payment status
    await testGetPayment(payment.paymentId);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: List payments
    await testListPayments();
  }

  console.log(`${colors.magenta}${'='.repeat(50)}${colors.reset}\n`);
  console.log(`${colors.green}✨ Test complete!${colors.reset}\n`);
}

// Run it
runTests();
