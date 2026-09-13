import { Request, Response } from 'express';
import { applicationService } from '../../services/application/applicationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { projectId, name, baseUrl, description } = req.body as {
    projectId: string;
    name: string;
    baseUrl: string;
    description?: string;
  };
  const application = await applicationService.create({
    organizationId: req.orgId,
    projectId,
    name,
    baseUrl,
    description,
  });
  res.status(201).json(created(application, { message: Messages.APPLICATION.CREATED }));
};