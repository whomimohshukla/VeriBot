import { Request, Response } from 'express';
import { integrationService } from '../../services/integration/integrationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const listIntegrations = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const projectId = req.query.projectId as string | undefined;
  const integrations = await integrationService.list(req.orgId, projectId);
  res.status(200).json(ok(integrations));
};