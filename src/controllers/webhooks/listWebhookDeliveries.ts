import { Request, Response } from 'express';
import { webhookService } from '../../services/webhook/webhookService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const listWebhookDeliveries = async (req: Request, res: Response): Promise<void> => {
  const { webhookId } = req.params as { webhookId: string };
  const webhook = await webhookService.get(webhookId);
  if (req.orgId && webhook.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const deliveries = await webhookService.listDeliveries(webhookId, page, pageSize);
  res.status(200).json(ok(deliveries));
};
