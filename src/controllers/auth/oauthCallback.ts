import type { Request, Response } from 'express';
import { oauthService } from '../../services/auth/oauthService';
import { userRepository } from '../../repositories/user.repository';
import { generateJWT } from '../../utils/jwt';
import { logger } from '../../config/logger';
import { BadRequestError, UpstreamError } from '../../utils/errors';

export const oauthCallback = async (req: Request, res: Response) => {
  const { code, state, error, error_description } = req.query;
  const { provider } = req.params;
  
  // Handle OAuth errors
  if (error) {
    logger.error({ error, error_description, provider }, 'OAuth error');
    return res.status(400).json({
      success: false,
      error: 'oauth_error',
      message: error_description || 'OAuth authorization failed',
    });
  }
  
  // Validate code
  if (!code || typeof code !== 'string') {
    throw new BadRequestError('Missing or invalid authorization code');
  }
  
  // Validate provider
  if (provider !== 'github' && provider !== 'google') {
    throw new BadRequestError('Invalid OAuth provider');
  }
  
  try {
    // Exchange code for user profile
    const profile = await oauthService.exchangeCode(provider, code);
    
    // Find or create user
    const user = await userRepository.findOrCreateFromOAuth(profile);
    
    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
    });
    
    logger.info({ userId: user.id, provider }, 'OAuth login successful');
    
    // Return token and user info
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (error) {
    logger.error({ error, provider }, 'OAuth callback failed');
    
    if (error instanceof UpstreamError) {
      return res.status(502).json({
        success: false,
        error: 'oauth_failed',
        message: error.message,
      });
    }
    
    throw error;
  }
};
