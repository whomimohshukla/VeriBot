import { Request, Response } from 'express';
import { organizationService } from '../../services/organization/organizationService';
import { auditService } from '../../services/audit/auditTrailService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const inviteMember = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { organizationId } = req.params as { organizationId: string };
  const { email, role } = req.body as {
    email: string;
    role: 'OWNER' | 'ADMIN' | 'QA_MANAGER' | 'DEVELOPER' | 'TESTER' | 'VIEWER';
  };
  const membership = await organizationService.inviteMember({
    organizationId,
    email,
    role,
    invitedByUserId: req.user.id,
  });
  await auditService.log(
    {
      organizationId,
      userId: req.user.id,
      actionType: 'CREATE',
      resourceType: 'organization_member',
      resourceId: membership.userId,
      changes: { email, role },
    },
    req
  );
  res.status(201).json(ok(membership, { message: Messages.ORG.MEMBER_INVITED(email) }));
};
