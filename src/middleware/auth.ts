import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';
import { Messages } from '../constants/messages';
import { verifyToken } from '../utils/jwt';
import { getRedis } from '../config/redis';
import { prisma } from '../config/database';
import type { AuthUser } from '../types/auth.types';
import { ROLE_PERMISSIONS, roleHasPermission } from '../constants/roles';

export interface AuthenticateOptions {
  optional?: boolean;
}

export const authenticate = (options: AuthenticateOptions = {}) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const header = req.headers.authorization;
      if (!header || !header.startsWith('Bearer ')) {
        if (options.optional) return next();
        throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
      }
      const token = header.slice('Bearer '.length).trim();
      if (!token) {
        if (options.optional) return next();
        throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
      }

      const payload = verifyToken(token, 'access');
      const redis = getRedis();
      const blacklisted = await redis.get(`auth:blacklist:${payload.jti ?? ''}`);
      if (blacklisted) {
        throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          deletedAt: true,
          memberships: { where: { organizationId: payload.orgId } },
        },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
      }

      const membership = user.memberships[0];
      if (!membership) {
        throw new UnauthorizedError(Messages.AUTH.INVALID_TOKEN);
      }

      const roles = payload.roles.length > 0 ? payload.roles : [membership.role];
      const permissions = Array.from(
        new Set(roles.flatMap((role) => ROLE_PERMISSIONS[role] ?? []))
      );

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        orgId: payload.orgId,
        roles,
        permissions,
      };

      req.user = authUser;
      req.orgId = payload.orgId;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    return next(new UnauthorizedError(Messages.AUTH.UNAUTHORIZED));
  }
  return next();
};

export const hasPermission = (permission: string) => (user: AuthUser): boolean => {
  return roleHasPermission(user.roles[0], permission);
};