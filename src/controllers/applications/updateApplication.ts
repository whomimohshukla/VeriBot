import { Request, Response } from 'express';
import { applicationService } from '../../services/application/applicationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const updateApplication = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { applicationId } = req.params as { applicationId: string };
  await applicationService.assertProjectAccess(req.orgId, applicationId);
  const { name, baseUrl, description } = req.body as {
    name?: string;
    baseUrl?: string;
    description?: string;
  };
  const application = await applicationService.update(applicationId, { name, baseUrl, description });
  res.status(200).json(ok(application, { message: Messages.APPLICATION.UPDATED }));
};