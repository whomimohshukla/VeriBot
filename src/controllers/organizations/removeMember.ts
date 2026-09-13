import { Request, Response } from 'express';
import { organizationService } from '../../services/organization/organizationService';
import { auditService } from '../../services/audit/auditTrailService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { organizationId, userId } = req.params as { organizationId: string; userId: string };
  await organizationService.removeMember(organizationId, userId, req.user.id);
  await auditService.log(
    {
      organizationId,
      userId: req.user.id,
      actionType: 'DELETE',
      resourceType: 'organization_member',
      resourceId: userId,
    },
    req
  );
  res.status(200).json(ok(null, { message: Messages.ORG.MEMBER_REMOVED }));
};
