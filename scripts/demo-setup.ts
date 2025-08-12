#!/usr/bin/env ts-node

/**
 * Demo Setup Script for Hackathon Judges
 * Creates test merchant, generates demo payment, shows live flow
 */

import { authService } from '@/lib/services/auth-service';
import { paymentService } from '@/lib/services/payment-service';

async function setupDemo() {
  console.log('🚀 Setting up sBTC Payment Gateway Demo...\n');

  try {
    // 1. Create demo merchant
    console.log('1. Creating demo merchant...');
    const merchant = await authService.register({
      name: 'Demo Store',
      email: 'demo@sbtcgateway.com',
      password: 'demo123456',
      businessType: 'E-commerce',
      stacksAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Testnet address
      website: 'https://demo-store.com'
    }, '127.0.0.1');

    console.log('✅ Demo merchant created');
    console.log(`   API Key: ${merchant.apiKey?.apiKey}`);

    // 2. Create demo payment
    console.log('\n2. Creating demo payment...');
    const payment = await paymentService.createPayment({
      merchantId: merchant.merchant!.id,
      amount: 10, // $10 USD
      currency: 'USD',
      paymentMethod: 'stx', // STX for fast demo
      payoutMethod: 'sbtc',
      description: 'Demo Product Purchase',
      metadata: { demo: true }
    });

    console.log('✅ Demo payment created');
    console.log(`   Payment ID: ${payment.payment?.id}`);
    console.log(`   Checkout URL: ${payment.payment?.checkoutUrl}`);

    console.log('\n🎯 Demo Ready!');
    console.log('='.repeat(50));
    console.log('Merchant Dashboard: http://localhost:3000/dashboard');
    console.log('Payment Demo: http://localhost:3000/checkout/' + payment.payment?.id);
    console.log('API Documentation: http://localhost:3000/docs');
    console.log('='.repeat(50));

    // 3. Show supported wallets
    console.log('\n📱 Supported Wallets:');
    const wallets = paymentService.getSupportedWallets();
    Object.entries(wallets).forEach(([type, list]) => {
      console.log(`${type.toUpperCase()}:`);
      list.forEach((wallet: any) => console.log(`  - ${wallet.name} (${wallet.type})`));
    });

  } catch (error) {
    console.error('❌ Demo setup failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  setupDemo();
}

export { setupDemo };
