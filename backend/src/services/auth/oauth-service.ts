import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Merchant } from '@/models/merchant/Merchant';
import { createLogger } from '@/utils/logger';
import { merchantService } from '../merchant/merchant-service';

const logger = createLogger('OAuthService');

interface OAuthProfile {
  id: string;
  provider: 'google' | 'github';
  email: string;
  name: string;
  avatar?: string;
}

class OAuthService {
  constructor() {
    this.configurePassport();
  }

  private configurePassport() {
    // Validate OAuth environment variables
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      logger.warn('Google OAuth credentials not configured');
    } else {
      // Google Strategy
      passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback"
      }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const oauthProfile: OAuthProfile = {
          id: profile.id,
          provider: 'google',
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value
        };
        
        const user = await this.handleOAuthUser(oauthProfile);
        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error, false);
      }
    }));
    }

    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
      logger.warn('GitHub OAuth credentials not configured');
    } else {
      // GitHub Strategy  
      passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/auth/github/callback"
      }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const oauthProfile: OAuthProfile = {
          id: profile.id,
          provider: 'github',
          email: profile.emails?.[0]?.value || '',
          name: profile.displayName || profile.username,
          avatar: profile.photos?.[0]?.value
        };
        
        const user = await this.handleOAuthUser(oauthProfile);
        return done(null, user);
      } catch (error) {
        logger.error('GitHub OAuth error:', error);
        return done(error, false);
      }
    }));
    }

    // Serialize user for session
    passport.serializeUser((user: any, done) => {
      const userId = user._id || user.id;
      done(null, userId.toString());
    });

    // Deserialize user from session
    passport.deserializeUser(async (id: string, done) => {
      try {
        const merchant = await merchantService.getMerchant(id);
        done(null, merchant);
      } catch (error) {
        logger.error('Error deserializing user:', error);
        done(error, false);
      }
    });
  }

  private async handleOAuthUser(profile: OAuthProfile): Promise<any> {
    try {
      // Validate profile data
      if (!profile.email || !profile.id) {
        throw new Error('OAuth profile missing required fields');
      }

      // Check if merchant already exists by email
      let merchant = await merchantService.getMerchantByEmail(profile.email);
      
      if (merchant) {
        // Update OAuth info for existing merchant
        const updateData: any = {
          lastLoginAt: new Date(),
          loginMethod: profile.provider, // Track current login method
        };
        updateData[`${profile.provider}Id`] = profile.id;
        if (profile.avatar) {
          updateData.avatar = profile.avatar;
        }
        
        const result = await merchantService.updateMerchant(merchant.id, updateData);
        
        if (result.success) {
          merchant = result.merchant!;
          logger.info(`Existing merchant signed in via ${profile.provider}:`, { 
            merchantId: merchant.id, 
            email: profile.email 
          });
        }
      } else {
        // Create new merchant from OAuth profile
        const newMerchant = new Merchant({
          name: profile.name,
          email: profile.email,
          businessType: 'other', // Default, merchant can update later
          emailVerified: true, // OAuth emails are verified
          authMethod: profile.provider, // Set initial auth method to OAuth provider
          loginMethod: profile.provider, // Set current login method to OAuth provider
          [`${profile.provider}Id`]: profile.id,
          avatar: profile.avatar,
          // Set a random password since OAuth users don't need it
          passwordHash: await require('bcryptjs').hash(Math.random().toString(36).substring(2, 15), 12),
          paymentPreferences: {
            acceptBitcoin: true,
            acceptSTX: true,
            acceptsBTC: true,
            preferredCurrency: 'sbtc',
            autoConvertToUSD: false,
            usdConversionMethod: 'coinbase',
          },
          isActive: true,
          hasUpdatedPassword: false,
        });
        
        const savedMerchant = await newMerchant.save();
        merchant = savedMerchant;
        
        logger.info(`New merchant registered via ${profile.provider}:`, { 
          merchantId: savedMerchant._id?.toString() || savedMerchant.id, 
          email: profile.email 
        });
      }
      
      if (!merchant) {
        throw new Error('Failed to create or retrieve merchant account');
      }
      
      return merchant;
    } catch (error) {
      logger.error('Error handling OAuth user:', error);
      throw error;
    }
  }
}

export const oauthService = new OAuthService();