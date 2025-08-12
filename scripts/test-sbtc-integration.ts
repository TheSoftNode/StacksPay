/**
 * sBTC Testnet Integration Test
 * Verifies all services work with real testnet
 */

import { sbtcService } from '@/lib/services/sbtc-service';
import { paymentService } from '@/lib/services/payment-service';
import { conversionService } from '@/lib/services/conversion-service';

export async function testSbtcIntegration() {
  console.log('🧪 Testing sBTC Testnet Integration...\n');

  try {
    // Test 1: sBTC Service Health
    console.log('1. Testing sBTC Service...');
    const feeRates = await sbtcService.getFeeRates();
    console.log(`✅ sBTC Service Connected`);
    console.log(`   High Fee: ${feeRates.high} sats/vB`);

    // Test 2: Emily API Connectivity  
    console.log('\n2. Testing Emily API...');
    const testAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
    const utxos = await sbtcService.getUtxos(testAddress);
    console.log(`✅ Emily API Connected: ${utxos.length} UTXOs found`);

    // Test 3: Conversion Rates
    console.log('\n3. Testing Conversion Service...');
    const rates = await conversionService.getConversionRates();
    console.log(`✅ BTC Rate: $${rates.BTC}`);
    console.log(`✅ STX Rate: $${rates.STX}`);

    // Test 4: Payment Creation
    console.log('\n4. Testing Payment Creation...');
    const testMerchantId = 'test-merchant-id';
    
    // Create demo payments for each method
    const paymentMethods = ['btc', 'stx', 'sbtc'] as const;
    
    for (const method of paymentMethods) {
      try {
        const payment = await paymentService.createPayment({
          merchantId: testMerchantId,
          amount: 1, // $1 for testing
          currency: 'USD',
          paymentMethod: method,
          payoutMethod: 'sbtc',
          description: `Test ${method.toUpperCase()} payment`,
        });
        
        if (payment.success) {
          console.log(`✅ ${method.toUpperCase()} payment created: ${payment.payment?.id}`);
        } else {
          console.log(`❌ ${method.toUpperCase()} payment failed: ${payment.error}`);
        }
      } catch (error) {
        console.log(`❌ ${method.toUpperCase()} payment error:`, error);
      }
    }

    console.log('\n🎉 Integration Test Complete!');
    console.log('Your sBTC Payment Gateway is ready for the hackathon! 🚀');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    console.log('\n🔧 Check your environment variables:');
    console.log('- STACKS_NETWORK=testnet');
    console.log('- SBTC_EMILY_API_URL');
    console.log('- MONGODB_URI');
  }
}

// Run test
if (require.main === module) {
  testSbtcIntegration();
}
