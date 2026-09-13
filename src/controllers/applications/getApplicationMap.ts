import { Request, Response } from 'express';
import { applicationService } from '../../services/application/applicationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const getApplicationMap = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { applicationId } = req.params as { applicationId: string };
  await applicationService.assertProjectAccess(req.orgId, applicationId);
  const map = await applicationService.getApplicationMap(applicationId);
  res.status(200).json(ok(map));
};
