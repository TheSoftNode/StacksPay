import express from 'express';
import { PaymentController } from '@/controllers/PaymentController';
import { apiKeyMiddleware } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/middleware/error.middleware';

const router = express.Router();
const paymentController = new PaymentController();

/**
 * Payment routes for StacksPay API
 * All routes require API key authentication
 */

// Apply API key middleware to all payment routes
router.use(apiKeyMiddleware);

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
 * /api/v1/payments/{id}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment details
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 */
router.get('/:id', asyncHandler(paymentController.getPayment.bind(paymentController)));

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
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 */
router.get('/', asyncHandler(paymentController.listPayments.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments/{id}/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Confirm payment with blockchain transaction
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
router.post('/:id/confirm', asyncHandler(paymentController.confirmPayment.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments/{id}/cancel:
 *   post:
 *     tags: [Payments]
 *     summary: Cancel a payment
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
 */
router.post('/:id/cancel', asyncHandler(paymentController.cancelPayment.bind(paymentController)));

/**
 * @swagger
 * /api/v1/payments/{id}/refund:
 *   post:
 *     tags: [Payments]
 *     summary: Process a payment refund
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 */
router.post('/:id/refund', asyncHandler(paymentController.refundPayment.bind(paymentController)));

export default router;