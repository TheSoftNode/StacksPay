import { NextRequest, NextResponse } from 'next/server';
import { Payment } from '@/models/payment';
import { Merchant } from '@/models/merchant';
import { sbtcService } from '@/lib/services/sbtc-service';
import { walletService } from '@/lib/services/wallet-service';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';
import { connectDatabase } from '@/lib/database/connection';

interface Props {
  params: {
    id: string;
  };
}

/**
 * GET - Get payment status by ID
 * Public endpoint for checking payment status
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;
    await connectDatabase();

    // Find payment
    const payment = await Payment.findById(id)
      .populate('merchantId', 'businessName email')
      .select('-paymentDetails.privateKey'); // Don't expose private keys

    if (!payment) {
      return NextResponse.json(
        { 
          error: 'Payment Not Found',
          message: 'Invalid payment ID',
          code: 'PAYMENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Check if payment has expired
    const now = new Date();
    const isExpired = payment.expiresAt && payment.expiresAt < now;
    
    if (isExpired && payment.status === 'pending') {
      payment.status = 'expired';
      await payment.save();
    }

    // Check payment status on blockchain if still pending
    let blockchainStatus = null;
    if (payment.status === 'pending' && !isExpired) {
      blockchainStatus = await checkBlockchainStatus(payment);
      
      if (blockchainStatus.confirmed) {
        payment.status = 'confirmed';
        payment.confirmedAt = new Date();
        
        // Update with blockchain transaction details
        if (blockchainStatus.txId) {
          payment.paymentDetails = {
            ...payment.paymentDetails,
            confirmedTxId: blockchainStatus.txId,
            blockHeight: blockchainStatus.blockHeight,
            confirmations: blockchainStatus.confirmations,
          };
        }
        
        await payment.save();
        
        // TODO: Trigger webhook notification
        await triggerWebhook(payment, 'payment.confirmed');
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        paymentAmount: payment.paymentAmount,
        paymentCurrency: payment.paymentCurrency,
        paymentAddress: payment.paymentAddress,
        description: payment.description,
        createdAt: payment.createdAt,
        confirmedAt: payment.confirmedAt,
        expiresAt: payment.expiresAt,
        isExpired,
        merchant: {
          businessName: payment.merchantId?.businessName,
          email: payment.merchantId?.email,
        },
        ...(blockchainStatus && {
          blockchain: {
            txId: blockchainStatus.txId,
            confirmations: blockchainStatus.confirmations,
            required: blockchainStatus.requiredConfirmations,
            blockHeight: blockchainStatus.blockHeight,
          },
        }),
      },
      statusDetails: getStatusDetails(payment.status, isExpired, blockchainStatus),
    });

  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Payment status service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update payment status (for merchant use)
 */
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    // Authenticate with API key
    const authResult = await apiKeyAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { 
          error: 'Authentication Failed',
          message: authResult.error,
          code: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const merchantId = authResult.merchantId;
    await connectDatabase();

    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'failed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid Status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Find payment and ensure it belongs to the merchant
    const payment = await Payment.findOne({ _id: id, merchantId });
    if (!payment) {
      return NextResponse.json(
        { 
          error: 'Payment Not Found',
          message: 'Payment not found or access denied',
          code: 'PAYMENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Update payment status
    const oldStatus = payment.status;
    payment.status = status;
    
    if (status === 'confirmed' && oldStatus !== 'confirmed') {
      payment.confirmedAt = new Date();
    }
    
    if (notes) {
      payment.notes = payment.notes || [];
      payment.notes.push({
        content: notes,
        timestamp: new Date(),
        updatedBy: 'merchant',
      });
    }

    await payment.save();

    // Trigger webhook if status changed
    if (oldStatus !== status) {
      await triggerWebhook(payment, `payment.${status}`);
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        status: payment.status,
        oldStatus,
        updatedAt: new Date(),
      },
      message: `Payment status updated to ${status}`,
    });

  } catch (error) {
    console.error('Payment update error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        message: 'Payment update service temporarily unavailable',
        code: 'SERVICE_ERROR'
      }, 
      { status: 500 }
    );
  }
}

// Helper functions

async function checkBlockchainStatus(payment: any) {
  try {
    switch (payment.paymentMethod) {
      case 'sbtc':
        return await checkSbtcPaymentStatus(payment);
      case 'btc':
        return await checkBtcPaymentStatus(payment);
      case 'stx':
        return await checkStxPaymentStatus(payment);
      default:
        return { confirmed: false, error: 'Unknown payment method' };
    }
  } catch (error) {
    console.error(`Blockchain status check error for ${payment.paymentMethod}:`, error);
    return { confirmed: false, error: error.message };
  }
}

async function checkSbtcPaymentStatus(payment: any) {
  // Check if Bitcoin has been sent to the deposit address
  const utxos = await sbtcService.getUTXOs(payment.paymentAddress);
  const targetAmount = payment.paymentAmount * 100000000; // Convert to satoshis
  
  let totalReceived = 0;
  let confirmedAmount = 0;
  let latestTxId = null;
  let blockHeight = null;
  let confirmations = 0;

  for (const utxo of utxos) {
    totalReceived += utxo.value;
    
    if (utxo.confirmations >= 1) {
      confirmedAmount += utxo.value;
      
      if (!latestTxId || utxo.height > blockHeight) {
        latestTxId = utxo.txid;
        blockHeight = utxo.height;
        confirmations = utxo.confirmations;
      }
    }
  }

  const confirmed = confirmedAmount >= targetAmount;

  if (confirmed) {
    // Check if sBTC has been minted
    const sbtcStatus = await sbtcService.checkMintStatus(latestTxId);
    return {
      confirmed: sbtcStatus.minted,
      txId: latestTxId,
      sbtcTxId: sbtcStatus.sbtcTxId,
      blockHeight,
      confirmations,
      requiredConfirmations: 1,
      amountReceived: confirmedAmount,
      targetAmount,
    };
  }

  return {
    confirmed: false,
    txId: latestTxId,
    blockHeight,
    confirmations,
    requiredConfirmations: 1,
    amountReceived: confirmedAmount,
    targetAmount,
  };
}

async function checkBtcPaymentStatus(payment: any) {
  const utxos = await sbtcService.getUTXOs(payment.paymentAddress);
  const targetAmount = payment.paymentAmount * 100000000; // Convert to satoshis
  
  let confirmedAmount = 0;
  let latestTxId = null;
  let blockHeight = null;
  let confirmations = 0;

  for (const utxo of utxos) {
    if (utxo.confirmations >= 1) {
      confirmedAmount += utxo.value;
      
      if (!latestTxId || utxo.height > blockHeight) {
        latestTxId = utxo.txid;
        blockHeight = utxo.height;
        confirmations = utxo.confirmations;
      }
    }
  }

  return {
    confirmed: confirmedAmount >= targetAmount,
    txId: latestTxId,
    blockHeight,
    confirmations,
    requiredConfirmations: 1,
    amountReceived: confirmedAmount,
    targetAmount,
  };
}

async function checkStxPaymentStatus(payment: any) {
  try {
    // Check STX transactions to the payment address
    const transactions = await walletService.getAddressTransactions(payment.paymentAddress);
    const targetAmount = payment.paymentAmount * 1000000; // Convert to microSTX
    
    let confirmedAmount = 0;
    let latestTxId = null;
    let blockHeight = null;
    let confirmations = 0;

    for (const tx of transactions) {
      if (tx.tx_status === 'success' && tx.tx_type === 'token_transfer') {
        const amount = parseInt(tx.token_transfer.amount);
        confirmedAmount += amount;
        
        if (!latestTxId || tx.block_height > blockHeight) {
          latestTxId = tx.tx_id;
          blockHeight = tx.block_height;
          confirmations = tx.confirmations || 0;
        }
      }
    }

    return {
      confirmed: confirmedAmount >= targetAmount,
      txId: latestTxId,
      blockHeight,
      confirmations,
      requiredConfirmations: 1,
      amountReceived: confirmedAmount,
      targetAmount,
    };
  } catch (error) {
    console.error('STX payment check error:', error);
    return { confirmed: false, error: error.message };
  }
}

async function triggerWebhook(payment: any, event: string) {
  if (!payment.urls?.webhook) {
    return;
  }

  try {
    const webhookPayload = {
      event,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        confirmedAt: payment.confirmedAt,
        metadata: payment.metadata,
      },
      timestamp: new Date().toISOString(),
    };

    await fetch(payment.urls.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'sBTC-Payment-Gateway/1.0',
      },
      body: JSON.stringify(webhookPayload),
    });
  } catch (error) {
    console.error('Webhook error:', error);
    // TODO: Implement webhook retry logic
  }
}

function getStatusDetails(status: string, isExpired: boolean, blockchainStatus: any) {
  const details = {
    pending: {
      title: 'Payment Pending',
      description: 'Waiting for payment to be sent',
      action: 'Send payment to the provided address',
      color: 'yellow',
    },
    confirmed: {
      title: 'Payment Confirmed',
      description: 'Payment has been confirmed on the blockchain',
      action: 'Payment processing complete',
      color: 'green',
    },
    failed: {
      title: 'Payment Failed',
      description: 'Payment could not be processed',
      action: 'Please try again or contact support',
      color: 'red',
    },
    cancelled: {
      title: 'Payment Cancelled',
      description: 'Payment was cancelled',
      action: 'No further action required',
      color: 'gray',
    },
    expired: {
      title: 'Payment Expired',
      description: 'Payment window has expired',
      action: 'Create a new payment request',
      color: 'orange',
    },
    refunded: {
      title: 'Payment Refunded',
      description: 'Payment has been refunded',
      action: 'Refund processed',
      color: 'blue',
    },
  };

  const baseDetails = details[status as keyof typeof details] || details.pending;

  if (isExpired) {
    return details.expired;
  }

  if (status === 'pending' && blockchainStatus) {
    return {
      ...baseDetails,
      description: `Waiting for ${blockchainStatus.requiredConfirmations} confirmation(s). Current: ${blockchainStatus.confirmations || 0}`,
      blockchain: blockchainStatus,
    };
  }

  return baseDetails;
}
