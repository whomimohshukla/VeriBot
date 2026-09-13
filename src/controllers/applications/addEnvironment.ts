import { Request, Response } from 'express';
import { applicationService } from '../../services/application/applicationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';

export const addEnvironment = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const applicationId = (req.params as { applicationId: string }).applicationId;
  const { type, url, name } = req.body as {
    type: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'CUSTOM';
    url: string;
    name?: string;
  };
  await applicationService.assertProjectAccess(req.orgId, applicationId);
  const environment = await applicationService.addEnvironment({ applicationId, type, url, name });
  res.status(201).json(created(environment, { message: Messages.APPLICATION.ENV_ADDED }));
};