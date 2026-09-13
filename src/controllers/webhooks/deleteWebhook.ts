import { Request, Response } from 'express';
import { webhookService } from '../../services/webhook/webhookService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const deleteWebhook = async (req: Request, res: Response): Promise<void> => {
  const { webhookId } = req.params as { webhookId: string };
  const existing = await webhookService.get(webhookId);
  if (req.orgId && existing.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  await webhookService.softDelete(webhookId);
  res.status(200).json(ok(null, { message: Messages.WEBHOOK.DELETED }));
};