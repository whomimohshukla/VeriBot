import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit';
import { env } from '../config/environment';
import { Messages } from '../constants/messages';
import type { ErrorCode } from '../types/errors.types';

export const createRateLimiter = (
  options: {
    windowMs?: number;
    max?: number;
    code?: ErrorCode;
    message?: string;
  } = {}
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: options.windowMs ?? env.RATE_LIMIT_WINDOW_MS,
    max: options.max ?? env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: options.code ?? 'RATE_LIMITED',
        message: options.message ?? Messages.AUTH.FORBIDDEN,
      },
    },
  });
};

export const apiRateLimiter = createRateLimiter();

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  code: 'RATE_LIMITED',
  message: 'Too many authentication attempts, please try again later.',
});
