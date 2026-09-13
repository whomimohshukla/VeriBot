import { Router } from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  requestResetPassword,
  resetPassword,
  verifyEmail as verifyEmailController,
  resendVerification as resendVerificationController,
} from '../../../controllers/auth';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  requestResetPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../../../validators';
import { validate } from '../../../middleware';
import { authRateLimiter, authenticate } from '../../../middleware';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/refresh-token', authRateLimiter, validate(refreshTokenSchema), refreshToken);
router.post('/logout', authenticate({ optional: true }), logout);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmailController);
router.post('/resend-verification', authRateLimiter, validate(requestResetPasswordSchema), resendVerificationController);
router.post('/request-password-reset', authRateLimiter, validate(requestResetPasswordSchema), requestResetPassword);
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPassword);

export default router;