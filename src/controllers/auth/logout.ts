import { Request, Response } from 'express';
import { authService } from '../../services/auth/authService';
import { auditService } from '../../services/audit/auditTrailService';
import { ok } from '../../utils/formatters';
import { Messages } from '../../constants/messages';

export const logout = async (req: Request, res: Response): Promise<void> => {
  const header = req.headers.authorization;
  const accessToken = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  const refreshToken = (req.body as { refreshToken?: string }).refreshToken;
  await authService.logout(accessToken, refreshToken);
  if (req.user && req.orgId) {
    await auditService.log(
      {
        organizationId: req.orgId,
        userId: req.user.id,
        actionType: 'AUTHENTICATION',
        resourceType: 'auth',
        resourceId: req.user.id,
        metadata: { action: 'logout' },
      },
      req
    );
  }
  res.status(200).json(ok(null, { message: Messages.AUTH.LOGGED_OUT }));
};
