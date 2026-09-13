import { ErrorCodes } from '../constants/errorCodes';
import type { ErrorCode } from '../types/errors.types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, ErrorCodes.BAD_REQUEST, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(400, code, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required.') {
    super(401, ErrorCodes.UNAUTHORIZED, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(403, ErrorCodes.FORBIDDEN, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found.') {
    super(404, ErrorCodes.NOT_FOUND, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, ErrorCodes.CONFLICT, message, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later.') {
    super(429, ErrorCodes.RATE_LIMITED, message);
  }
}

export class UpstreamError extends AppError {
  constructor(message: string, details?: unknown) {
    super(502, ErrorCodes.UPSTREAM_ERROR, message, details);
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
