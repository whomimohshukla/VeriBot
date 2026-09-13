import { Request, Response } from 'express';
import { webhookService } from '../../services/webhook/webhookService';
import { auditService } from '../../services/audit/auditTrailService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const updateWebhook = async (req: Request, res: Response): Promise<void> => {
  const { webhookId } = req.params as { webhookId: string };
  const existing = await webhookService.get(webhookId);
  if (req.orgId && existing.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const webhook = await webhookService.update(webhookId, req.body);
  if (req.orgId && req.user) {
    await auditService.log(
      {
        organizationId: req.orgId,
        userId: req.user.id,
        projectId: webhook.projectId ?? undefined,
        actionType: 'UPDATE',
        resourceType: 'webhook',
        resourceId: webhook.id,
        changes: { url: webhook.url, eventTypes: webhook.eventTypes, isActive: webhook.isActive },
      },
      req
    );
  }
  res.status(200).json(ok(webhook, { message: Messages.WEBHOOK.UPDATED }));
};
