import express from 'express';
import passport from 'passport';
import { sessionService } from '@/services/session-service';
import { createLogger } from '@/utils/logger';

const logger = createLogger('OAuthRoutes');
const router = express.Router();

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to dashboard on success, login on failure
 */
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed` 
  }),
  async (req, res) => {
    try {
      const user = req.user as any;
      
      // Create session
      const session = await sessionService.createSession(
        (user._id || user.id).toString(),
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        false // rememberMe
      );

      // Set session token
      res.cookie('session_token', session.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      logger.info('Google OAuth login successful', { 
        userId: user._id || user.id, 
        email: user.email 
      });

      // Redirect to dashboard with proper URL handling
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = frontendUrl.endsWith('/') ? 
        `${frontendUrl}dashboard?auth=success` : 
        `${frontendUrl}/dashboard?auth=success`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = frontendUrl.endsWith('/') ? 
        `${frontendUrl}login?error=oauth_error` : 
        `${frontendUrl}/login?error=oauth_error`;
      res.redirect(errorUrl);
    }
  }
);

/**
 * @swagger
 * /api/auth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 */
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email'] 
  })
);

/**
 * @swagger
 * /api/auth/github/callback:
 *   get:
 *     summary: Handle GitHub OAuth callback
 *     tags: [Authentication]  
 *     responses:
 *       302:
 *         description: Redirect to dashboard on success, login on failure
 */
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed` 
  }),
  async (req, res) => {
    try {
      const user = req.user as any;
      
      // Create session
      const session = await sessionService.createSession(
        (user._id || user.id).toString(),
        req.ip || 'unknown',
        req.get('User-Agent') || 'unknown',
        false // rememberMe
      );

      // Set session token
      res.cookie('session_token', session.sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      logger.info('GitHub OAuth login successful', { 
        userId: user._id || user.id, 
        email: user.email 
      });

      // Redirect to dashboard with proper URL handling
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = frontendUrl.endsWith('/') ? 
        `${frontendUrl}dashboard?auth=success` : 
        `${frontendUrl}/dashboard?auth=success`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('GitHub OAuth callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorUrl = frontendUrl.endsWith('/') ? 
        `${frontendUrl}login?error=oauth_error` : 
        `${frontendUrl}/login?error=oauth_error`;
      res.redirect(errorUrl);
    }
  }
);

export default router;