import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { sessionMiddleware } from '@/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Merchant authentication endpoints
 *   - name: Wallet Authentication  
 *     description: Stacks wallet connection and verification
 *   - name: API Keys
 *     description: API key management for developers
 */

// Public authentication routes (no auth required)

/**
 * @swagger
 * /api/auth/test:
 *   get:
 *     summary: Test endpoint to verify API is working
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: API is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Authentication API is working"
 *                 timestamp:
 *                   type: string
 *                   example: "2025-09-03T00:00:00.000Z"
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Authentication API is working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/register/email',
      'POST /api/auth/register/wallet', 
      'POST /api/auth/login/email',
      'POST /api/auth/login/wallet',
      'GET /api/auth/me',
      'POST /api/auth/logout',
      'POST /api/auth/refresh'
    ]
  });
});

/**
 * @swagger
 * /api/auth/register/email:
 *   post:
 *     summary: Register merchant with email/password
 *     tags: [Authentication]
 */
router.post('/register/email', authController.registerWithEmail.bind(authController));

/**
 * @swagger
 * /api/auth/register/wallet:
 *   post:
 *     summary: Register merchant with wallet connection
 *     tags: [Authentication]
 */
router.post('/register/wallet', authController.registerWithWallet.bind(authController));

/**
 * @swagger
 * /api/auth/login/email:
 *   post:
 *     summary: Login merchant with email/password
 *     tags: [Authentication]
 */
router.post('/login/email', authController.loginWithEmail.bind(authController));

/**
 * @swagger
 * /api/auth/login/wallet:
 *   post:
 *     summary: Login merchant with wallet signature
 *     tags: [Authentication]
 */
router.post('/login/wallet', authController.loginWithWallet.bind(authController));

// Wallet challenge endpoints (public)
/**
 * @swagger
 * /api/auth/wallet/challenge:
 *   get:
 *     summary: Generate wallet challenge message
 *     tags: [Wallet Authentication]
 */
router.get('/wallet/challenge', authController.generateWalletChallenge.bind(authController));

/**
 * @swagger
 * /api/auth/wallet/verify:
 *   post:
 *     summary: Verify wallet signature
 *     tags: [Wallet Authentication]
 */
router.post('/wallet/verify', authController.verifyWalletSignature.bind(authController));

// Protected routes (require session authentication)
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout merchant
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/logout', sessionMiddleware, authController.logout.bind(authController));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current merchant info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', sessionMiddleware, authController.getCurrentMerchant.bind(authController));

// API key management routes (require session authentication)
/**
 * @swagger
 * /api/auth/api-keys:
 *   get:
 *     summary: List merchant API keys
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create new API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 */
router.get('/api-keys', sessionMiddleware, authController.getApiKeys.bind(authController));
router.post('/api-keys', sessionMiddleware, authController.createApiKey.bind(authController));

/**
 * @swagger
 * /api/auth/api-keys/{keyId}:
 *   delete:
 *     summary: Revoke API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/api-keys/:keyId', sessionMiddleware, authController.revokeApiKey.bind(authController));

export default router;