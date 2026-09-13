import { Request, Response, NextFunction } from 'express';
import { isAppError } from '../utils/errors';
import { errorResponse } from '../utils/formatters';
import { ErrorCodes } from '../constants';
import { logger } from '../config/logger';

export const errorHandler = (error: unknown, req: Request, res: Response, _next: NextFunction): void => {
  const requestId = req.requestId;

  if (isAppError(error)) {
    res
      .status(error.statusCode)
      .json(errorResponse({ code: error.code, message: error.message, details: error.details }, requestId));
    return;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    res
      .status(400)
      .json(errorResponse({ code: ErrorCodes.VALIDATION_ERROR, message: 'Malformed JSON body' }, requestId));
    return;
  }

  logger.error({ err: error, requestId, path: req.path, method: req.method }, 'unhandled error');
  res
    .status(500)
    .json(errorResponse({ code: ErrorCodes.INTERNAL_ERROR, message: 'Internal server error' }, requestId));
};
