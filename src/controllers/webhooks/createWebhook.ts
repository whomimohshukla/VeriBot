import { Request, Response } from 'express';
import { webhookService } from '../../services/webhook/webhookService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';
import type { CreateWebhookInput } from '../../validators/webhook.validator';

export const createWebhook = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const params = req.body as CreateWebhookInput;
  const webhook = await webhookService.create(req.orgId, params);
  res.status(201).json(created(webhook, { message: Messages.WEBHOOK.CREATED }));
};
