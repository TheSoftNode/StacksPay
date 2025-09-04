import express from 'express';
import { PaymentController } from '@/controllers/PaymentController';
import { sessionMiddleware } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/middleware/error.middleware';

const router = express.Router();
const paymentController = new PaymentController();

/**
 * Payment routes for merchant dashboard (JWT auth)
 * These routes use merchant JWT authentication, not API keys
 */

// Apply JWT middleware to all merchant payment routes
router.use(sessionMiddleware);

// Payment management for merchant dashboard
router.post('/', asyncHandler(paymentController.createPayment.bind(paymentController)));
router.get('/', asyncHandler(paymentController.listPayments.bind(paymentController)));
router.get('/:paymentId', asyncHandler(paymentController.getPayment.bind(paymentController)));
router.put('/:paymentId', asyncHandler(paymentController.updatePayment.bind(paymentController)));
router.post('/:paymentId/cancel', asyncHandler(paymentController.cancelPayment.bind(paymentController)));
router.post('/:paymentId/refund', asyncHandler(paymentController.refundPayment.bind(paymentController)));
router.post('/:paymentId/verify', asyncHandler(paymentController.verifyPayment.bind(paymentController)));

// QR Code generation
router.get('/:paymentId/qr', asyncHandler(paymentController.generateQRCode.bind(paymentController)));

export default router;