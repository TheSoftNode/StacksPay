import { NextRequest, NextResponse } from 'next/server';
import { Payment } from '@/models/payment';
import { Merchant } from '@/models/merchant';
import { sbtcService } from '@/lib/services/sbtc-service';
import { walletService } from '@/lib/services/wallet-service';
import { paymentService } from '@/lib/services/payment-service';
import { webhookService } from '@/lib/services/webhook-service';
import { connectToDatabase } from '@/lib/database/mongodb';
import { apiKeyAuth } from '@/lib/middleware/api-key-auth';

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
    await connectToDatabase();

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
      blockchainStatus = await paymentService.checkPaymentStatus(payment._id);
      
      if (blockchainStatus.confirmed) {
        await paymentService.updatePaymentStatus(payment._id, 'confirmed', {
          confirmedTxId: blockchainStatus.txId,
          blockHeight: blockchainStatus.blockHeight,
          confirmations: blockchainStatus.confirmations,
        });
        
        // Refresh payment data
        payment.status = 'confirmed';
        payment.confirmedAt = new Date();
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
    await connectToDatabase();

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
    const updateResult = await paymentService.updatePaymentStatus(id, status, notes ? { notes } : undefined);
    
    if (!updateResult.success) {
      return NextResponse.json(
        { 
          error: 'Update Failed',
          message: updateResult.error,
          code: 'UPDATE_FAILED'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: updateResult.payment._id,
        status: updateResult.payment.status,
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
