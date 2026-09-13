import { Request, Response } from 'express';
import { organizationService } from '../../services/organization/organizationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const changeMemberRole = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { organizationId, userId } = req.params as { organizationId: string; userId: string };
  const { role } = req.body as { role: 'OWNER' | 'ADMIN' | 'QA_MANAGER' | 'DEVELOPER' | 'TESTER' | 'VIEWER' };
  await organizationService.changeMemberRole(organizationId, userId, role, req.user.id);
  res.status(200).json(ok(null, { message: Messages.ORG.ROLE_CHANGED }));
};