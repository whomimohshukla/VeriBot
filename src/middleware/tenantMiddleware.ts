import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { ForbiddenError } from '../utils/errors';
import { Messages } from '../constants/messages';

export const tenantMiddleware = (() => {
  const middleware = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const headerOrg = req.headers['x-org-id'];
      const headerOrgId = typeof headerOrg === 'string' && headerOrg.length > 0 ? headerOrg : undefined;

      if (req.user) {
        let orgId = headerOrgId ?? req.user.orgId;

        if (headerOrgId && headerOrgId !== req.user.orgId) {
          const membership = await prisma.membership.findFirst({
            where: { userId: req.user.id, organizationId: headerOrgId, deletedAt: null },
          });
          if (!membership) {
            throw new ForbiddenError(Messages.ORG.MEMBER_NOT_FOUND);
          }
          orgId = headerOrgId;
        }

        req.orgId = orgId;
        req.user.orgId = orgId;
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
  Object.defineProperty(middleware, 'name', { value: 'tenantMiddleware' });
  return middleware;
})();
