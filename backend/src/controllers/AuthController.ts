import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { authService } from '@/services/auth-service';
import { walletAuthService } from '@/services/wallet-auth-service';
import { multiWalletAuthService } from '@/services/multi-wallet-auth-service';
import { createLogger } from '@/utils/logger';
import { getClientIpAddress} from '@/utils/request';
import { 
  RegisterRequest, 
  LoginRequest
} from '@/interfaces/auth.interface';
import { WalletAuthRequest } from '@/interfaces/wallet.interface';

const logger = createLogger('AuthController');

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - businessType
 *         - acceptTerms
 *       properties:
 *         name:
 *           type: string
 *           description: Business name
 *         email:
 *           type: string
 *           format: email
 *           description: Business email address
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Secure password
 *         businessType:
 *           type: string
 *           enum: [ecommerce, saas, marketplace, nonprofit, consulting, other]
 *         acceptTerms:
 *           type: boolean
 *           description: Must be true to accept terms and conditions
 *         stacksAddress:
 *           type: string
 *           description: Optional Stacks wallet address
 *         website:
 *           type: string
 *           format: uri
 *           description: Optional business website
 *     
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         rememberMe:
 *           type: boolean
 *           default: false
 *     
 *     WalletAuthRequest:
 *       type: object
 *       required:
 *         - address
 *         - signature
 *         - message
 *         - publicKey
 *         - walletType
 *       properties:
 *         address:
 *           type: string
 *           description: Stacks wallet address
 *         signature:
 *           type: string
 *           description: Message signature from wallet
 *         message:
 *           type: string
 *           description: Challenge message that was signed
 *         publicKey:
 *           type: string
 *           description: Public key from wallet
 *         walletType:
 *           type: string
 *           enum: [stacks, bitcoin]
 *         paymentId:
 *           type: string
 *           description: Optional payment ID for payment authorization
 *         amount:
 *           type: number
 *           description: Optional payment amount in satoshis
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         token:
 *           type: string
 *           description: JWT access token
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *         merchant:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             stacksAddress:
 *               type: string
 *             emailVerified:
 *               type: boolean
 *         apiKey:
 *           type: object
 *           properties:
 *             keyId:
 *               type: string
 *             apiKey:
 *               type: string
 *             keyPreview:
 *               type: string
 *             permissions:
 *               type: array
 *               items:
 *                 type: string
 *         error:
 *           type: string
 */

export class AuthController {
  /**
   * @swagger
   * /api/auth/register/email:
   *   post:
   *     tags: [Authentication]
   *     summary: Register merchant with email/password
   *     description: Traditional business registration with email and password
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *           example:
   *             name: "My Business"
   *             email: "business@example.com"
   *             password: "SecurePassword123!"
   *             businessType: "ecommerce"
   *             acceptTerms: true
   *             stacksAddress: "SP1ABC123DEF456GHI789JKL012MNO345PQR678STU"
   *             website: "https://mybusiness.com"
   *     responses:
   *       201:
   *         description: Registration successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Registration failed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   */
  async registerWithEmail(req: Request, res: Response): Promise<void> {
    try {
      const ipAddress = getClientIpAddress(req);
      const registerData: RegisterRequest = req.body;

      // Validate required fields
      if (!registerData.name || !registerData.email || !registerData.password || !registerData.businessType) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: name, email, password, businessType'
        });
        return;
      }

      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await authService.register(registerData, ipAddress, userAgent);

      if (result.success) {
        logger.info('Merchant registered via email', {
          merchantId: result.merchant?.id,
          email: registerData.email,
          businessType: registerData.businessType,
          hasStacksAddress: !!registerData.stacksAddress
        });

        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Email registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/register/wallet:
   *   post:
   *     tags: [Authentication]
   *     summary: Register merchant with wallet connection
   *     description: Instant merchant registration using Stacks wallet signature
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             allOf:
   *               - $ref: '#/components/schemas/WalletAuthRequest'
   *               - type: object
   *                 required:
   *                   - businessName
   *                   - businessType
   *                 properties:
   *                   businessName:
   *                     type: string
   *                     description: Business name for the account
   *                   businessType:
   *                     type: string
   *                     enum: [ecommerce, saas, marketplace, nonprofit, consulting, other]
   *                   email:
   *                     type: string
   *                     format: email
   *                     description: Optional email for notifications
   *     responses:
   *       201:
   *         description: Wallet registration successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Registration failed
   */
  async registerWithWallet(req: Request, res: Response): Promise<void> {
    try {
      const ipAddress = getClientIpAddress(req);
      const walletData: WalletAuthRequest & { 
        businessName: string; 
        businessType: string; 
        email?: string; 
      } = req.body;

      // Validate required wallet fields
      if (!walletData.address || !walletData.signature || !walletData.message || 
          !walletData.publicKey || !walletData.businessName || !walletData.businessType) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: address, signature, message, publicKey, businessName, businessType'
        });
        return;
      }

      // First verify the wallet signature
      const walletVerification = await walletAuthService.verifyWalletConnection(walletData);
      
      if (!walletVerification.success || !walletVerification.verified) {
        res.status(400).json({
          success: false,
          error: walletVerification.error || 'Wallet signature verification failed'
        });
        return;
      }

      // Create merchant account with wallet as primary authentication
      const merchantData: RegisterRequest = {
        name: walletData.businessName,
        email: walletData.email || `wallet-${walletData.address.toLowerCase()}@stackspay.app`, // Generate valid email if not provided
        password: crypto.randomBytes(32).toString('hex'), // Random password since they'll use wallet auth
        businessType: walletData.businessType,
        stacksAddress: walletData.address,
        acceptTerms: true, // Auto-accept for wallet registrations
      };

      const userAgent = req.headers['user-agent'] || 'unknown';
      const result = await authService.register(merchantData, ipAddress, userAgent);

      if (result.success) {
        logger.info('Merchant registered via wallet', {
          merchantId: result.merchant?.id,
          stacksAddress: walletData.address,
          businessType: walletData.businessType,
          walletType: walletData.walletType
        });

        // Return success with wallet authentication context
        res.status(201).json({
          ...result,
          walletConnected: true,
          authMethod: 'wallet'
        });
      } else {
        res.status(400).json(result);
      }

    } catch (error) {
      logger.error('Wallet registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Wallet registration failed. Please try again.'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/login/email:
   *   post:
   *     tags: [Authentication]
   *     summary: Login merchant with email/password
   *     description: Traditional login for business dashboard access
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid credentials
   */
  async loginWithEmail(req: Request, res: Response): Promise<void> {
    try {
      const ipAddress = getClientIpAddress(req);
      const userAgent = req.get('User-Agent') || '';
      const loginData: LoginRequest = req.body;

      // Validate required fields
      if (!loginData.email || !loginData.password) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: email, password'
        });
        return;
      }

      const result = await authService.login(loginData, ipAddress, userAgent);

      if (result.success) {
        logger.info('Merchant logged in via email', {
          merchantId: result.merchant?.id,
          email: loginData.email,
          rememberMe: loginData.rememberMe
        });

        res.json({
          ...result,
          authMethod: 'email'
        });
      } else {
        res.status(401).json(result);
      }

    } catch (error) {
      logger.error('Email login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/login/wallet:
   *   post:
   *     tags: [Authentication]
   *     summary: Login merchant with wallet signature
   *     description: Authenticate merchant using Stacks wallet signature
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/WalletAuthRequest'
   *     responses:
   *       200:
   *         description: Wallet login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Wallet authentication failed
   */
  async loginWithWallet(req: Request, res: Response): Promise<void> {
    try {
      const ipAddress = getClientIpAddress(req);
      const userAgent = req.get('User-Agent') || '';
      const walletData: WalletAuthRequest = req.body;

      // Validate wallet auth fields
      if (!walletData.address || !walletData.signature || !walletData.message || !walletData.publicKey) {
        res.status(400).json({
          success: false,
          error: 'Missing required wallet fields: address, signature, message, publicKey'
        });
        return;
      }

      // Verify wallet signature
      const walletVerification = await walletAuthService.verifyWalletConnection(walletData);
      
      if (!walletVerification.success || !walletVerification.verified) {
        res.status(401).json({
          success: false,
          error: walletVerification.error || 'Wallet authentication failed'
        });
        return;
      }

      // Find merchant by Stacks address
      const { Merchant } = await import('@/models/Merchant');
      const merchant = await Merchant.findOne({ stacksAddress: walletData.address });

      if (!merchant) {
        res.status(404).json({
          success: false,
          error: 'No merchant account found for this wallet address. Please register first.'
        });
        return;
      }

      // Create session for wallet-authenticated merchant
      const loginRequest: LoginRequest = {
        email: merchant.email,
        password: '', // Not used for wallet auth
        rememberMe: true // Wallet sessions are typically longer
      };

      // Generate session tokens directly
      const sessionResult = await (authService as any).createSession(merchant, ipAddress, userAgent, true);

      logger.info('Merchant logged in via wallet', {
        merchantId: merchant._id.toString(),
        stacksAddress: walletData.address,
        walletType: walletData.walletType
      });

      res.json({
        success: true,
        token: sessionResult.token,
        refreshToken: sessionResult.refreshToken,
        merchant: {
          id: merchant._id.toString(),
          name: merchant.name,
          email: merchant.email,
          stacksAddress: merchant.stacksAddress,
          emailVerified: merchant.emailVerified,
        },
        authMethod: 'wallet',
        walletConnected: true
      });

    } catch (error) {
      logger.error('Wallet login error:', error);
      res.status(500).json({
        success: false,
        error: 'Wallet login failed. Please try again.'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/logout:
   *   post:
   *     tags: [Authentication]
   *     summary: Logout merchant
   *     description: Invalidate current session and logout
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Logout successful
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
   *                   example: Logged out successfully
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      const sessionId = req.session?.sessionId;

      if (!merchantId || !sessionId) {
        res.status(401).json({
          success: false,
          error: 'No active session found'
        });
        return;
      }

      const ipAddress = getClientIpAddress(req);
      const result = await authService.logout(merchantId, sessionId, ipAddress);

      if (result.success) {
        logger.info('Merchant logged out', { merchantId, sessionId });
        res.json({
          success: true,
          message: 'Logged out successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Logout failed'
        });
      }

    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed. Please try again.'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/wallet/challenge:
   *   get:
   *     tags: [Wallet Authentication]
   *     summary: Generate wallet challenge message
   *     description: Generate a challenge message for wallet signature authentication
   *     parameters:
   *       - in: query
   *         name: address
   *         required: true
   *         schema:
   *           type: string
   *         description: Stacks wallet address
   *       - in: query
   *         name: type
   *         required: true
   *         schema:
   *           type: string
   *           enum: [connection, payment]
   *         description: Type of challenge (connection or payment)
   *       - in: query
   *         name: paymentId
   *         schema:
   *           type: string
   *         description: Payment ID (required for payment type)
   *       - in: query
   *         name: amount
   *         schema:
   *           type: number
   *         description: Payment amount in satoshis (required for payment type)
   *     responses:
   *       200:
   *         description: Challenge generated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 challenge:
   *                   type: string
   *                   description: Message to be signed by wallet
   *                 expiresAt:
   *                   type: string
   *                   format: date-time
   *                   description: Challenge expiration time
   */
  async generateWalletChallenge(req: Request, res: Response): Promise<void> {
    try {
      const { address, type, paymentId, amount } = req.query;

      if (!address || !type) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters: address, type'
        });
        return;
      }

      let challenge: string;
      
      if (type === 'payment') {
        if (!paymentId || !amount) {
          res.status(400).json({
            success: false,
            error: 'Payment challenges require paymentId and amount'
          });
          return;
        }
        challenge = walletAuthService.generateChallengeMessage(
          paymentId as string, 
          parseInt(amount as string)
        );
      } else if (type === 'connection') {
        challenge = walletAuthService.generateConnectionChallenge(address as string);
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid challenge type. Must be "connection" or "payment"'
        });
        return;
      }

      const expiresAt = new Date(Date.now() + (type === 'payment' ? 5 * 60 * 1000 : 10 * 60 * 1000));

      res.json({
        success: true,
        challenge,
        expiresAt,
        type
      });

    } catch (error) {
      logger.error('Wallet challenge generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate wallet challenge'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/wallet/verify:
   *   post:
   *     tags: [Wallet Authentication]
   *     summary: Verify wallet signature
   *     description: Verify wallet signature for payment authorization or connection
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/WalletAuthRequest'
   *     responses:
   *       200:
   *         description: Wallet verification result
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 verified:
   *                   type: boolean
   *                 address:
   *                   type: string
   *                 paymentMethod:
   *                   type: string
   *                 error:
   *                   type: string
   */
  async verifyWalletSignature(req: Request, res: Response): Promise<void> {
    try {
      const walletData: WalletAuthRequest = req.body;

      // Validate wallet verification fields
      if (!walletData.address || !walletData.signature || !walletData.message || !walletData.publicKey) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: address, signature, message, publicKey'
        });
        return;
      }

      // Use multi-wallet auth service for comprehensive verification
      const result = await multiWalletAuthService.verifyWalletSignature(walletData);

      logger.info('Wallet signature verification completed', {
        address: walletData.address,
        verified: result.verified,
        walletType: walletData.walletType,
        paymentId: walletData.paymentId
      });

      res.json(result);

    } catch (error) {
      logger.error('Wallet verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Wallet verification failed. Please try again.'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/api-keys:
   *   get:
   *     tags: [API Keys]
   *     summary: Get merchant API keys
   *     description: List all active API keys for authenticated merchant
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: API keys retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       keyId:
   *                         type: string
   *                       keyPreview:
   *                         type: string
   *                       permissions:
   *                         type: array
   *                         items:
   *                           type: string
   *                       environment:
   *                         type: string
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                       lastUsed:
   *                         type: string
   *                         format: date-time
   *   post:
   *     tags: [API Keys]
   *     summary: Generate new API key
   *     description: Create a new API key for merchant
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - permissions
   *               - environment
   *             properties:
   *               permissions:
   *                 type: array
   *                 items:
   *                   type: string
   *                   enum: [read, write, webhooks]
   *               environment:
   *                 type: string
   *                 enum: [test, live]
   *     responses:
   *       201:
   *         description: API key created successfully
   */
  async getApiKeys(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const apiKeys = await authService.getMerchantApiKeys(merchantId);

      res.json({
        success: true,
        data: apiKeys
      });

    } catch (error) {
      logger.error('Get API keys error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve API keys'
      });
    }
  }

  async createApiKey(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const { permissions, environment } = req.body;

      if (!permissions || !Array.isArray(permissions) || !environment) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: permissions (array), environment'
        });
        return;
      }

      const apiKeyData = {
        name: req.body.name || `API Key ${new Date().toISOString()}`,
        permissions,
        environment,
        ipRestrictions: req.body.ipRestrictions || [],
        rateLimit: req.body.rateLimit,
        expiresAt: req.body.expiresAt,
      };

      const apiKey = await authService.generateApiKey(merchantId, apiKeyData);

      logger.info('API key created', {
        merchantId,
        keyId: apiKey.keyId,
        environment,
        permissions
      });

      res.status(201).json({
        success: true,
        data: apiKey
      });

    } catch (error) {
      logger.error('Create API key error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create API key'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/api-keys/{keyId}:
   *   delete:
   *     tags: [API Keys]
   *     summary: Revoke API key
   *     description: Revoke an active API key
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: keyId
   *         required: true
   *         schema:
   *           type: string
   *         description: API key ID to revoke
   *     responses:
   *       200:
   *         description: API key revoked successfully
   */
  async revokeApiKey(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      const { keyId } = req.params;

      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Merchant authentication required'
        });
        return;
      }

      const result = await authService.revokeApiKey(merchantId, keyId);

      if (result.success) {
        logger.info('API key revoked', { merchantId, keyId });
        res.json({
          success: true,
          message: 'API key revoked successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Failed to revoke API key'
        });
      }

    } catch (error) {
      logger.error('Revoke API key error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to revoke API key'
      });
    }
  }

  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     tags: [Authentication]
   *     summary: Get current merchant info
   *     description: Get authenticated merchant information
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Merchant info retrieved successfully
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
   *                     name:
   *                       type: string
   *                     email:
   *                       type: string
   *                     stacksAddress:
   *                       type: string
   *                     emailVerified:
   *                       type: boolean
   *                     walletSetup:
   *                       type: object
   */
  async getCurrentMerchant(req: Request, res: Response): Promise<void> {
    try {
      const merchantId = req.merchant?.id;
      if (!merchantId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const walletStatus = await authService.getWalletSetupStatus(merchantId);

      res.json({
        success: true,
        data: {
          ...req.merchant,
          walletSetup: walletStatus
        }
      });

    } catch (error) {
      logger.error('Get current merchant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve merchant information'
      });
    }
  }
}