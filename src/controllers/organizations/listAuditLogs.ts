import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { auditService } from '../../services/audit/auditTrailService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const listAuditLogs = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { organizationId } = req.params as { organizationId: string };
  const membership = await prisma.membership.findFirst({
    where: { userId: req.user.id, organizationId, deletedAt: null },
  });
  if (!membership) {
    throw new ForbiddenError(Messages.ORG.MEMBER_NOT_FOUND);
  }

  const { page, pageSize, resourceType } = req.query as {
    page?: string;
    pageSize?: string;
    resourceType?: string;
  };

  const logs = await auditService.list(organizationId, {
    page: page ? Number(page) : undefined,
    pageSize: pageSize ? Number(pageSize) : undefined,
    resourceType,
  });

  res.status(200).json(ok(logs));
};
