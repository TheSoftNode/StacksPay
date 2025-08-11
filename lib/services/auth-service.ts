import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Merchant } from '@/models/merchant';
import { AuthEvent } from '@/models/auth-event';
import { connectToDatabase } from '@/lib/database/mongodb';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  businessType: string;
  stacksAddress: string;
  website?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  merchant?: {
    id: string;
    name: string;
    email: string;
    stacksAddress: string;
    emailVerified: boolean;
  };
  apiKey?: {
    keyId: string;
    apiKey: string;
    keyPreview: string;
    permissions: string[];
  };
  error?: string;
}

export interface ApiKeyResponse {
  keyId: string;
  apiKey: string;
  keyPreview: string;
  permissions: string[];
  environment: 'test' | 'live';
  createdAt: Date;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-jwt-secret';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
  
  /**
   * Register new merchant with full authentication setup
   */
  async register(data: RegisterRequest, ipAddress: string): Promise<AuthResponse> {
    await connectToDatabase();

    try {
      // Check if merchant already exists
      const existingMerchant = await Merchant.findOne({ email: data.email });
      if (existingMerchant) {
        await this.logAuthEvent(null, 'failed_login', ipAddress, false, { reason: 'email_exists' });
        return { success: false, error: 'Email already registered' };
      }

      // Validate Stacks address format
      const stacksAddressRegex = /^S[TM][0-9A-Z]{39}$|^SP[0-9A-Z]{39}$/;
      if (!stacksAddressRegex.test(data.stacksAddress)) {
        return { success: false, error: 'Invalid Stacks address format' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);
      
      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');

      // Create merchant
      const merchant = new Merchant({
        name: data.name,
        email: data.email,
        passwordHash,
        businessType: data.businessType,
        stacksAddress: data.stacksAddress,
        website: data.website,
        emailVerificationToken,
        emailVerified: false,
      });

      await merchant.save();

      // Generate initial API keys (test environment)
      const testApiKey = await this.generateApiKey(
        merchant._id.toString(), 
        ['read', 'write'], 
        'test'
      );

      // Create session
      const { token, refreshToken } = await this.createSession(merchant, ipAddress);

      await this.logAuthEvent(merchant._id.toString(), 'register', ipAddress, true, {
        businessType: data.businessType,
        hasWebsite: !!data.website,
      });

      return {
        success: true,
        token,
        refreshToken,
        merchant: {
          id: merchant._id.toString(),
          name: merchant.name,
          email: merchant.email,
          stacksAddress: merchant.stacksAddress,
          emailVerified: merchant.emailVerified,
        },
        apiKey: testApiKey,
      };
    } catch (error) {
      console.error('Registration error:', error);
      await this.logAuthEvent(null, 'register', ipAddress, false, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return { success: false, error: 'Registration failed' };
    }
  }

  /**
   * Login merchant with session management
   */
  async login(data: LoginRequest, ipAddress: string, userAgent: string): Promise<AuthResponse> {
    await connectToDatabase();

    try {
      // Find merchant
      const merchant = await Merchant.findOne({ email: data.email });
      if (!merchant) {
        await this.logAuthEvent(null, 'failed_login', ipAddress, false, { reason: 'email_not_found' });
        return { success: false, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (merchant.lockUntil && merchant.lockUntil > new Date()) {
        await this.logAuthEvent(merchant._id.toString(), 'failed_login', ipAddress, false, { reason: 'account_locked' });
        return { success: false, error: 'Account temporarily locked. Please try again later.' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(data.password, merchant.passwordHash);
      if (!isValidPassword) {
        await this.handleFailedLogin(merchant, ipAddress);
        return { success: false, error: 'Invalid credentials' };
      }

      // Reset login attempts on successful login
      merchant.loginAttempts = 0;
      merchant.lockUntil = undefined;
      await merchant.save();

      // Create session
      const { token, refreshToken } = await this.createSession(merchant, ipAddress, userAgent, data.rememberMe);

      await this.logAuthEvent(merchant._id.toString(), 'login', ipAddress, true, {
        rememberMe: data.rememberMe,
        userAgent: userAgent.substring(0, 100), // Truncate for storage
      });

      return {
        success: true,
        token,
        refreshToken,
        merchant: {
          id: merchant._id.toString(),
          name: merchant.name,
          email: merchant.email,
          stacksAddress: merchant.stacksAddress,
          emailVerified: merchant.emailVerified,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      await this.logAuthEvent(null, 'failed_login', ipAddress, false, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return { success: false, error: 'Login failed' };
    }
  }

  /**
   * Logout merchant and invalidate session
   */
  async logout(merchantId: string, sessionId: string): Promise<{ success: boolean }> {
    await connectToDatabase();

    try {
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return { success: false };
      }

      // Remove the specific session
      merchant.sessions = merchant.sessions.filter(
        (session: any) => session.sessionId !== sessionId
      );
      await merchant.save();

      await this.logAuthEvent(merchantId, 'logout', '', true);
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  /**
   * Generate API key with proper permissions and rate limiting
   */
  async generateApiKey(
    merchantId: string, 
    permissions: string[], 
    environment: 'test' | 'live' = 'test'
  ): Promise<ApiKeyResponse> {
    await connectToDatabase();

    try {
      const keyId = crypto.randomUUID();
      const keySecret = crypto.randomBytes(32).toString('hex');
      const apiKey = `sk_${environment}_${keySecret}`;
      const keyHash = await bcrypt.hash(apiKey, 10);
      const keyPreview = `${apiKey.substring(0, 12)}...${apiKey.substring(apiKey.length - 4)}`;

      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        throw new Error('Merchant not found');
      }

      // Check if merchant already has too many keys
      const activeKeys = merchant.apiKeys.filter((key: any) => key.isActive);
      if (activeKeys.length >= 10) {
        throw new Error('Maximum number of API keys reached');
      }

      merchant.apiKeys.push({
        keyId,
        keyHash,
        keyPreview,
        permissions,
        environment,
        isActive: true,
        createdAt: new Date(),
        rateLimit: environment === 'test' ? 100 : 1000, // Lower limit for test keys
      });

      await merchant.save();

      await this.logAuthEvent(merchantId, 'api_key_created', '', true, {
        keyId,
        environment,
        permissions,
      });

      return { 
        keyId, 
        apiKey, 
        keyPreview, 
        permissions, 
        environment,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('API key generation error:', error);
      throw error;
    }
  }

  /**
   * Validate API key for merchant authentication
   */
  async validateApiKey(apiKey: string): Promise<{
    merchantId: string;
    keyId: string;
    permissions: string[];
    environment: string;
    merchant: any;
  } | null> {
    await connectToDatabase();

    try {
      const merchants = await Merchant.find({ 'apiKeys.isActive': true });

      for (const merchant of merchants) {
        for (const key of merchant.apiKeys) {
          if (key.isActive && await bcrypt.compare(apiKey, key.keyHash)) {
            // Check if key has expired
            if (key.expiresAt && key.expiresAt < new Date()) {
              continue;
            }

            // Update last used timestamp
            key.lastUsed = new Date();
            await merchant.save();

            // Log API key usage (rate limited to avoid spam)
            const shouldLog = !key.lastUsed || 
              (Date.now() - key.lastUsed.getTime()) > 60000; // Log once per minute max
            
            if (shouldLog) {
              await this.logAuthEvent(merchant._id.toString(), 'api_key_used', '', true, { 
                keyId: key.keyId,
                environment: key.environment 
              });
            }

            return {
              merchantId: merchant._id.toString(),
              keyId: key.keyId,
              permissions: key.permissions,
              environment: key.environment,
              merchant: {
                name: merchant.name,
                email: merchant.email,
                stacksAddress: merchant.stacksAddress,
                emailVerified: merchant.emailVerified,
              },
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error('API key validation error:', error);
      return null;
    }
  }

  /**
   * Verify JWT token and get merchant info
   */
  async verifyToken(token: string): Promise<{
    merchantId: string;
    sessionId: string;
    merchant: any;
  } | null> {
    await connectToDatabase();

    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as any;
      
      // Check if session still exists
      const merchant = await Merchant.findById(payload.merchantId);
      if (!merchant) {
        return null;
      }

      const session = merchant.sessions.find(
        (s: any) => s.sessionId === payload.sessionId && s.expiresAt > new Date()
      );

      if (!session) {
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      await merchant.save();

      return {
        merchantId: payload.merchantId,
        sessionId: payload.sessionId,
        merchant: {
          id: merchant._id.toString(),
          name: merchant.name,
          email: merchant.email,
          stacksAddress: merchant.stacksAddress,
          emailVerified: merchant.emailVerified,
        },
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(merchantId: string, keyId: string): Promise<{ success: boolean }> {
    await connectToDatabase();

    try {
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return { success: false };
      }

      const keyIndex = merchant.apiKeys.findIndex((key: any) => key.keyId === keyId);
      if (keyIndex === -1) {
        return { success: false };
      }

      merchant.apiKeys[keyIndex].isActive = false;
      await merchant.save();

      await this.logAuthEvent(merchantId, 'api_key_revoked', '', true, { keyId });
      return { success: true };
    } catch (error) {
      console.error('API key revocation error:', error);
      return { success: false };
    }
  }

  /**
   * Get merchant's API keys
   */
  async getMerchantApiKeys(merchantId: string): Promise<any[]> {
    await connectToDatabase();

    try {
      const merchant = await Merchant.findById(merchantId);
      if (!merchant) {
        return [];
      }

      return merchant.apiKeys
        .filter((key: any) => key.isActive)
        .map((key: any) => ({
          keyId: key.keyId,
          keyPreview: key.keyPreview,
          permissions: key.permissions,
          environment: key.environment,
          createdAt: key.createdAt,
          lastUsed: key.lastUsed,
          rateLimit: key.rateLimit,
        }));
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return [];
    }
  }

  /**
   * Create JWT session with refresh token
   */
  private async createSession(
    merchant: any, 
    ipAddress: string, 
    userAgent?: string, 
    rememberMe?: boolean
  ): Promise<{ token: string; refreshToken: string }> {
    const sessionId = crypto.randomUUID();
    const expiresIn = rememberMe ? '30d' : '24h';
    const expiresAt = new Date(Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));

    // Create JWT token
    const token = jwt.sign(
      {
        merchantId: merchant._id.toString(),
        sessionId,
        email: merchant.email,
      },
      this.JWT_SECRET,
      { expiresIn }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      { merchantId: merchant._id.toString(), sessionId },
      this.JWT_REFRESH_SECRET,
      { expiresIn: '60d' }
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // Clean up old sessions (keep only last 5)
    merchant.sessions.sort((a: any, b: any) => b.createdAt - a.createdAt);
    merchant.sessions = merchant.sessions.slice(0, 4);

    // Store new session
    merchant.sessions.unshift({
      sessionId,
      tokenHash,
      createdAt: new Date(),
      expiresAt,
      lastActivity: new Date(),
      ipAddress,
      userAgent: userAgent || '',
    });

    await merchant.save();

    return { token, refreshToken };
  }

  /**
   * Handle failed login attempts with account locking
   */
  private async handleFailedLogin(merchant: any, ipAddress: string): Promise<void> {
    merchant.loginAttempts = (merchant.loginAttempts || 0) + 1;

    // Progressive lockout: 5 attempts = 15 min, 10 attempts = 1 hour, 15+ = 24 hours
    let lockDuration = 0;
    if (merchant.loginAttempts >= 15) {
      lockDuration = 24 * 60 * 60 * 1000; // 24 hours
    } else if (merchant.loginAttempts >= 10) {
      lockDuration = 60 * 60 * 1000; // 1 hour
    } else if (merchant.loginAttempts >= 5) {
      lockDuration = 15 * 60 * 1000; // 15 minutes
    }

    if (lockDuration > 0) {
      merchant.lockUntil = new Date(Date.now() + lockDuration);
      await this.logAuthEvent(merchant._id.toString(), 'account_locked', ipAddress, false, {
        attempts: merchant.loginAttempts,
        lockDuration: lockDuration / 1000 / 60, // minutes
      });
    }

    await merchant.save();
    await this.logAuthEvent(merchant._id.toString(), 'failed_login', ipAddress, false, { 
      attempts: merchant.loginAttempts 
    });
  }

  /**
   * Log authentication events for security monitoring
   */
  private async logAuthEvent(
    merchantId: string | null, 
    eventType: string, 
    ipAddress: string, 
    success: boolean, 
    metadata?: any
  ): Promise<void> {
    try {
      const authEvent = new AuthEvent({
        merchantId,
        eventType,
        ipAddress,
        success,
        metadata,
      });
      await authEvent.save();
    } catch (error) {
      console.error('Error logging auth event:', error);
    }
  }
}

export const authService = new AuthService();
