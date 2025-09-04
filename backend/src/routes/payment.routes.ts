import express from 'express';
import { PaymentController } from '@/controllers/PaymentController';
import { apiKeyMiddleware } from '@/middleware/auth.middleware';
import { rateLimitMiddleware } from '@/middleware/rate-limit.middleware';
import { asyncHandler } from '@/middleware/error.middleware';

const router = express.Router();
const paymentController = new PaymentController();

/**
 * Payment routes for StacksPay API
 * All routes require API key authentication
 */

// Apply API key middleware and rate limiting to all payment routes
router.use(apiKeyMiddleware);
router.use(rateLimitMiddleware);

/**
 * @swagger
 * /api/v1/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create a new payment
 *     description: Create a payment request for BTC, STX, or sBTC
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in smallest unit (satoshis for BTC, microSTX for STX)
 *               currency:
 *                 type: string
 *                 enum: [BTC, STX, sBTC, USD]
 *               paymentMethod:
 *                 type: string
 *                 enum: [bitcoin, stx, sbtc]
 *               description:
 *                 type: string
 *               successUrl:
 *                 type: string
 *               cancelUrl:
 *                 type: string
 *               webhookUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
router.post('/', asyncHandler(paymentController.createPayment.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments/{paymentId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment details
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 */
router.get('/:paymentId', asyncHandler(paymentController.getPayment.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     tags: [Payments]
 *     summary: List payments
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, failed, expired]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 */
router.get('/', asyncHandler(paymentController.listPayments.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments/{paymentId}/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify payment with blockchain transaction
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - signature
 *             properties:
 *               signature:
 *                 type: string
 *               blockchainData:
 *                 type: object
 *                 properties:
 *                   txId:
 *                     type: string
 *                   txHash:
 *                     type: string
 *                   blockHeight:
 *                     type: number
 *                   confirmations:
 *                     type: number
 *               customerWalletAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 */
router.post('/:paymentId/verify', asyncHandler(paymentController.verifyPayment.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments/{paymentId}/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Confirm payment with blockchain transaction
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - txHash
 *             properties:
 *               txHash:
 *                 type: string
 *               signature:
 *                 type: string
 *               publicKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 */
router.post('/:paymentId/confirm', asyncHandler(paymentController.verifyPayment.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments/{paymentId}/cancel:
 *   post:
 *     tags: [Payments]
 *     summary: Cancel a payment
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
 */
router.post('/:paymentId/cancel', asyncHandler(paymentController.cancelPayment.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments/{paymentId}/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Process a payment refund
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Partial refund amount (optional)
 *               reason:
 *                 type: string
 *               blockchainRefundData:
 *                 type: object
 *                 required:
 *                   - transactionId
 *                 properties:
 *                   transactionId:
 *                     type: string
 *                   blockHeight:
 *                     type: number
 *                   status:
 *                     type: string
 *                     enum: [pending, confirmed]
 *                   feesPaid:
 *                     type: number
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 */
router.post('/:paymentId/refund', asyncHandler(paymentController.refundPayment.bind(paymentController)));

export default router;