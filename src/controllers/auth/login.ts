import { Request, Response } from 'express';
import { authService } from '../../services/auth/authService';
import { auditService } from '../../services/audit/auditTrailService';
import { ok } from '../../utils/formatters';
import { Messages } from '../../constants/messages';

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login({ email, password });
  await auditService.log(
    {
      organizationId: result.organization.id,
      userId: result.user.id,
      actionType: 'AUTHENTICATION',
      resourceType: 'auth',
      resourceId: result.user.id,
      metadata: { action: 'login', email: result.user.email },
    },
    req
  );
  res.status(200).json(ok(result, { message: Messages.AUTH.LOGGED_IN }));
};
