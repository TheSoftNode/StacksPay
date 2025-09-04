import express from 'express';
import { WebhookController } from '@/controllers/WebhookController';
import { apiKeyMiddleware } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/middleware/error.middleware';

const router = express.Router();
const webhookController = new WebhookController();

/**
 * Webhook routes for StacksPay API
 * All routes require API key authentication
 */

// Apply API key middleware to all webhook routes
router.use(apiKeyMiddleware);

/**
 * @swagger
 * /api/v1/webhooks:
 *   post:
 *     tags: [Webhooks]
 *     summary: Create a webhook endpoint
 *     description: Register a webhook URL for receiving payment notifications
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - events
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Webhook endpoint URL
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [payment.created, payment.confirmed, payment.failed, payment.expired]
 *               secret:
 *                 type: string
 *                 description: Optional webhook secret for signature verification
 *     responses:
 *       201:
 *         description: Webhook created successfully
 */
router.post('/', asyncHandler(webhookController.createWebhook.bind(webhookController)));

/**
 * @swagger
 * /api/v1/webhooks:
 *   get:
 *     tags: [Webhooks]
 *     summary: List webhook endpoints
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Webhooks retrieved successfully
 */
router.get('/', asyncHandler(webhookController.listWebhooks.bind(webhookController)));

/**
 * @swagger
 * /api/v1/webhooks/{id}:
 *   get:
 *     tags: [Webhooks]
 *     summary: Get webhook details
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
 *         description: Webhook details retrieved successfully
 */
router.get('/:id', asyncHandler(webhookController.getWebhook.bind(webhookController)));

/**
 * @swagger
 * /api/v1/webhooks/{id}:
 *   put:
 *     tags: [Webhooks]
 *     summary: Update webhook
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
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               events:
 *                 type: array
 *                 items:
 *                   type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Webhook updated successfully
 */
router.put('/:id', asyncHandler(webhookController.updateWebhook.bind(webhookController)));

/**
 * @swagger
 * /api/v1/webhooks/{id}:
 *   delete:
 *     tags: [Webhooks]
 *     summary: Delete webhook
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
 *         description: Webhook deleted successfully
 */
router.delete('/:id', asyncHandler(webhookController.deleteWebhook.bind(webhookController)));

/**
 * @swagger
 * /api/v1/webhooks/{id}/test:
 *   post:
 *     tags: [Webhooks]
 *     summary: Test webhook endpoint
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
 *         description: Webhook test completed
 */
router.post('/:id/test', asyncHandler(webhookController.testWebhook.bind(webhookController)));

/**
 * @swagger
 * /api/v1/webhooks/{id}/retry:
 *   post:
 *     tags: [Webhooks]
 *     summary: Retry failed webhook deliveries
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
 *         description: Webhook retry initiated
 */
router.post('/:id/retry', asyncHandler(webhookController.retryWebhook.bind(webhookController)));

export default router;