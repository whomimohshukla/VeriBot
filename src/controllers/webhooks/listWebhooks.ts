import { Request, Response } from 'express';
import { webhookService } from '../../services/webhook/webhookService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const listWebhooks = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const projectId = req.query.projectId as string | undefined;
  const result = await webhookService.list(req.orgId, projectId);
  res.status(200).json(ok(result));
};