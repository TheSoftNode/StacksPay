import express from 'express';
import { PaymentController } from '@/controllers/PaymentController';
import { asyncHandler } from '@/middleware/error.middleware';

const router = express.Router();
const paymentController = new PaymentController();

/**
 * Public payment routes for customer interactions
 * No authentication required for these endpoints
 */

/**
 * @swagger
 * /api/public/payments/{paymentId}/status:
 *   get:
 *     tags: [Public Payments]
 *     summary: Get payment status (public)
 *     description: Get payment status without authentication for customer checkout
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 */
router.get('/:paymentId/status', asyncHandler(paymentController.getPaymentStatus.bind(paymentController)));

/**
 * @swagger
 * /api/public/payments/{paymentId}/process:
 *   post:
 *     tags: [Public Payments]
 *     summary: Process customer payment
 *     description: Submit payment transaction from customer wallet
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
 *               - walletAddress
 *               - transactionId
 *               - paymentMethod
 *             properties:
 *               walletAddress:
 *                 type: string
 *               transactionId:
 *                 type: string
 *               signature:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [bitcoin, stx, sbtc]
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/:paymentId/process', asyncHandler(paymentController.processCustomerPayment.bind(paymentController)));

/**
 * @swagger
 * /api/public/payments/{paymentId}/qr:
 *   get:
 *     tags: [Public Payments]
 *     summary: Get payment QR code (public)
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 256
 *     responses:
 *       200:
 *         description: QR code generated successfully
 */
router.get('/:paymentId/qr', asyncHandler(paymentController.generatePublicQRCode.bind(paymentController)));

export default router;