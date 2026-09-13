import { Request, Response } from 'express';
import { webhookService } from '../../services/webhook/webhookService';
import { auditService } from '../../services/audit/auditTrailService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const deleteWebhook = async (req: Request, res: Response): Promise<void> => {
  const { webhookId } = req.params as { webhookId: string };
  const existing = await webhookService.get(webhookId);
  if (req.orgId && existing.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  await webhookService.hardDelete(webhookId);
  if (req.orgId && req.user) {
    await auditService.log(
      {
        organizationId: req.orgId,
        userId: req.user.id,
        projectId: existing.projectId ?? undefined,
        actionType: 'DELETE',
        resourceType: 'webhook',
        resourceId: webhookId,
        changes: { url: existing.url },
      },
      req
    );
  }
  res.status(200).json(ok(null, { message: Messages.WEBHOOK.DELETED }));
};
