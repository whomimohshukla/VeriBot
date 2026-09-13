import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { Messages } from '../constants/messages';

export const requirePermission = (...permissions: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError(Messages.AUTH.UNAUTHORIZED));
    }
    const hasAll = permissions.every((permission) => req.user!.permissions.includes(permission));
    if (!hasAll) {
      return next(new ForbiddenError(Messages.AUTH.FORBIDDEN));
    }
    return next();
  };
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError(Messages.AUTH.UNAUTHORIZED));
    }
    const hasRole = req.user.roles.some((role) => roles.includes(role));
    if (!hasRole) {
      return next(new ForbiddenError(Messages.AUTH.FORBIDDEN));
    }
    return next();
  };
};
