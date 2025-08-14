import { NextRequest, NextResponse } from 'next/server';
import { webhookService } from '@/lib/services/webhook-service';
import { paymentService } from '@/lib/services/payment-service';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-bitcoin-signature') || '';
    
    // Verify webhook signature (in production, implement proper verification)
    const isValidSignature = await verifyBitcoinWebhookSignature(body, signature);
    
    if (!isValidSignature) {
      return NextResponse.json(
        { 
          error: 'Invalid Signature',
          message: 'Webhook signature verification failed',
          code: 'INVALID_SIGNATURE'
        },
        { status: 401 }
      );
    }
    
    // Process Bitcoin webhook event
    const {
      event_type,
      transaction_hash,
      confirmation_count,
      value,
      address,
      block_height,
    } = body;

    // Handle different Bitcoin events
    switch (event_type) {
      case 'transaction_confirmed':
        await handleTransactionConfirmed({
          transactionHash: transaction_hash,
          confirmations: confirmation_count,
          value,
          address,
          blockHeight: block_height,
        });
        break;
      
      case 'address_received':
        await handleAddressReceived({
          transactionHash: transaction_hash,
          value,
          address,
        });
        break;
        
      default:
        console.log(`Unknown Bitcoin webhook event: ${event_type}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bitcoin webhook processed successfully',
      event_type,
      transaction_hash,
    });
  } catch (error) {
    console.error('Bitcoin webhook processing error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Failed to process Bitcoin webhook',
        code: 'WEBHOOK_ERROR'
      },
      { status: 500 }
    );
  }
}

async function verifyBitcoinWebhookSignature(body: any, signature: string): Promise<boolean> {
  try {
    const secret = process.env.BITCOIN_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('Bitcoin webhook secret not configured');
      return true; // Allow in development
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
      
    return signature === expectedSignature;
  } catch (error) {
    console.error('Bitcoin webhook signature verification error:', error);
    return false;
  }
}

async function handleTransactionConfirmed(data: {
  transactionHash: string;
  confirmations: number;
  value: number;
  address: string;
  blockHeight: number;
}): Promise<void> {
  try {
    // Find payment by Bitcoin address or transaction hash
    const result = await paymentService.updatePaymentByBitcoinTx(data.transactionHash, {
      status: 'completed',
      confirmations: data.confirmations,
      blockHeight: data.blockHeight,
      confirmedAt: new Date(),
    });

    if (result.success) {
      // Trigger our own webhook to notify merchants
      await webhookService.triggerWebhook({
        urls: { webhook: `https://api.system.com/bitcoin` },
        _id: `btc_confirm_${data.transactionHash}`,
        type: 'bitcoin_transaction',
        data: {
          transactionHash: data.transactionHash,
          confirmations: data.confirmations,
          value: data.value,
          address: data.address,
          blockHeight: data.blockHeight,
          paymentId: result.payment?.id,
        },
        metadata: { source: 'bitcoin_network' }
      }, 'bitcoin.transaction.confirmed');
    }
  } catch (error) {
    console.error('Error handling Bitcoin transaction confirmation:', error);
  }
}

async function handleAddressReceived(data: {
  transactionHash: string;
  value: number;
  address: string;
}): Promise<void> {
  try {
    // Find payment by Bitcoin address
    const result = await paymentService.updatePaymentByBitcoinAddress(data.address, {
      status: 'pending',
      bitcoinTxHash: data.transactionHash,
      receivedAmount: data.value,
      receivedAt: new Date(),
    });

    if (result.success) {
      // Trigger webhook to notify merchants
      await webhookService.triggerWebhook({
        urls: { webhook: `https://api.system.com/bitcoin` },
        _id: `btc_received_${data.transactionHash}`,
        type: 'bitcoin_payment',
        data: {
          transactionHash: data.transactionHash,
          value: data.value,
          address: data.address,
          paymentId: result.payment?.id,
        },
        metadata: { source: 'bitcoin_network' }
      }, 'bitcoin.payment.received');
    }
  } catch (error) {
    console.error('Error handling Bitcoin address received:', error);
  }
}
