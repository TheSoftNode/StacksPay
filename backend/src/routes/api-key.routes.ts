import express from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { asyncHandler } from '@/middleware/error.middleware';
import { createLogger } from '@/utils/logger';
import { Merchant } from '@/models/Merchant';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

const router = express.Router();
const logger = createLogger('ApiKeyController');

// Apply JWT middleware to all API key routes (merchant dashboard only)
router.use(authMiddleware);

/**
 * Generate new API key for merchant
 */
router.post('/generate', asyncHandler(async (req: express.Request, res: express.Response) => {
  const merchantId = req.merchant?.id;
  const { name, environment, permissions, ipRestrictions, rateLimit } = req.body;

  if (!merchantId) {
    res.status(401).json({
      success: false,
      error: 'Merchant authentication required'
    });
    return;
  }

  if (!name || !environment || !permissions) {
    res.status(400).json({
      success: false,
      error: 'Name, environment, and permissions are required'
    });
    return;
  }

  try {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
      return;
    }

    // Generate API key
    const keyPrefix = environment === 'test' ? 'sk_test_' : 'sk_live_';
    const randomBytes = crypto.randomBytes(32).toString('hex');
    const apiKey = `${keyPrefix}${randomBytes}`;
    const keyId = crypto.randomBytes(16).toString('hex');

    // Hash the API key for secure storage
    const keyHash = await bcrypt.hash(apiKey, 10);
    const keyPreview = `${keyPrefix}****${randomBytes.slice(-4)}`;

    // Add to merchant's API keys
    const apiKeyData = {
      keyId,
      keyHash,
      keyPreview,
      name,
      permissions: Array.isArray(permissions) ? permissions : [permissions],
      environment,
      isActive: true,
      createdAt: new Date(),
      ipRestrictions: ipRestrictions || [],
      rateLimit: rateLimit || 1000,
    };

    merchant.apiKeys.push(apiKeyData);
    await merchant.save();

    logger.info('API key generated', {
      merchantId,
      keyId,
      environment,
      permissions
    });

    res.status(201).json({
      success: true,
      data: {
        keyId,
        name,
        apiKey, // Only returned once during creation
        keyPreview,
        environment,
        permissions,
        ipRestrictions: apiKeyData.ipRestrictions,
        rateLimit: apiKeyData.rateLimit,
        createdAt: apiKeyData.createdAt,
        isActive: true
      },
      message: 'API key created successfully. Please store this key securely as it will not be shown again.'
    });
  } catch (error: any) {
    logger.error('API key generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate API key'
    });
  }
}));

/**
 * Get all API keys for merchant (without revealing full keys)
 */
router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const merchantId = req.merchant?.id;

  if (!merchantId) {
    res.status(401).json({
      success: false,
      error: 'Merchant authentication required'
    });
    return;
  }

  try {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
      return;
    }

    // Return API keys without sensitive data
    const apiKeys = merchant.apiKeys
      .filter(key => key.isActive)
      .map(key => ({
        keyId: key.keyId,
        name: key.name,
        keyPreview: key.keyPreview,
        environment: key.environment,
        permissions: key.permissions,
        ipRestrictions: key.ipRestrictions,
        rateLimit: key.rateLimit,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        expiresAt: key.expiresAt,
        isActive: key.isActive,
        requestCount: key.requestCount || 0
      }));

    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error: any) {
    logger.error('API key fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch API keys'
    });
  }
}));

/**
 * Revoke API key
 */
router.delete('/:keyId', asyncHandler(async (req: express.Request, res: express.Response) => {
  const merchantId = req.merchant?.id;
  const keyId = req.params.keyId;

  if (!merchantId) {
    res.status(401).json({
      success: false,
      error: 'Merchant authentication required'
    });
    return;
  }

  try {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
      return;
    }

    // Find and deactivate the API key
    const apiKey = merchant.apiKeys.find(key => key.keyId === keyId);
    if (!apiKey) {
      res.status(404).json({
        success: false,
        error: 'API key not found'
      });
      return;
    }

    apiKey.isActive = false;
    await merchant.save();

    logger.info('API key revoked', {
      merchantId,
      keyId,
      environment: apiKey.environment
    });

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error: any) {
    logger.error('API key revocation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke API key'
    });
  }
}));

/**
 * Update API key settings (permissions, rate limits, etc.)
 */
router.put('/:keyId', asyncHandler(async (req: express.Request, res: express.Response) => {
  const merchantId = req.merchant?.id;
  const keyId = req.params.keyId;
  const { name, permissions, ipRestrictions, rateLimit } = req.body;

  if (!merchantId) {
    res.status(401).json({
      success: false,
      error: 'Merchant authentication required'
    });
    return;
  }

  try {
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
      return;
    }

    // Find and update the API key
    const apiKey = merchant.apiKeys.find(key => key.keyId === keyId);
    if (!apiKey) {
      res.status(404).json({
        success: false,
        error: 'API key not found'
      });
      return;
    }

    // Update allowed fields
    if (name) apiKey.name = name;
    if (permissions) apiKey.permissions = Array.isArray(permissions) ? permissions : [permissions];
    if (ipRestrictions !== undefined) apiKey.ipRestrictions = ipRestrictions;
    if (rateLimit !== undefined) apiKey.rateLimit = rateLimit;

    await merchant.save();

    logger.info('API key updated', {
      merchantId,
      keyId,
      updatedFields: { name, permissions, ipRestrictions, rateLimit }
    });

    res.json({
      success: true,
      message: 'API key updated successfully',
      data: {
        keyId: apiKey.keyId,
        name: apiKey.name,
        keyPreview: apiKey.keyPreview,
        environment: apiKey.environment,
        permissions: apiKey.permissions,
        ipRestrictions: apiKey.ipRestrictions,
        rateLimit: apiKey.rateLimit,
      }
    });
  } catch (error: any) {
    logger.error('API key update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update API key'
    });
  }
}));

export default router;