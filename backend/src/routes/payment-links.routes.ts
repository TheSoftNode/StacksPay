import express from 'express';
import { PaymentController } from '@/controllers/PaymentController';
import { sessionMiddleware } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/middleware/error.middleware';

const router = express.Router();
const paymentController = new PaymentController();

/**
 * Payment Links routes for merchant dashboard (JWT auth)
 * These routes use merchant JWT authentication for creating shareable payment links
 */

// Apply JWT middleware to all payment link routes
router.use(sessionMiddleware);

/**
 * @swagger
 * /api/payment-links:
 *   post:
 *     tags: [Payment Links]
 *     summary: Create a shareable payment link
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount
 *               currency:
 *                 type: string
 *                 description: Payment currency
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method - btc, stx, or sbtc
 *               payoutMethod:
 *                 type: string
 *                 description: Payout method, defaults to usd
 *               description:
 *                 type: string
 *                 description: Payment description
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Link expiration date
 *               successUrl:
 *                 type: string
 *                 description: Success redirect URL
 *               cancelUrl:
 *                 type: string
 *                 description: Cancel redirect URL
 *               webhookUrl:
 *                 type: string
 *                 description: Webhook URL for notifications
 *               metadata:
 *                 type: object
 *                 description: Additional metadata
 *     responses:
 *       201:
 *         description: Payment link created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Payment ID
 *                     url:
 *                       type: string
 *                       description: Shareable payment URL
 *                     qrCode:
 *                       type: string
 *                       description: QR code data URL
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: Link expiration date
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', asyncHandler(paymentController.createPaymentLink.bind(paymentController)));

export default router;
