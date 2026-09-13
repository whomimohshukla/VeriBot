import { Request, Response } from 'express';
import { integrationService } from '../../services/integration/integrationService';
import { auditService } from '../../services/audit/auditTrailService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const disconnectIntegration = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { integrationId } = req.params as { integrationId: string };
  const integration = await integrationService.get(integrationId);
  if (integration.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  await integrationService.disconnect(integrationId);
  await auditService.log(
    {
      organizationId: req.orgId,
      userId: req.user?.id ?? '',
      projectId: integration.projectId ?? undefined,
      actionType: 'INTEGRATION',
      resourceType: 'integration',
      resourceId: integrationId,
      changes: { type: integration.type, action: 'disconnect' },
    },
    req
  );
  res.status(200).json(ok(null, { message: Messages.INTEGRATION.DISCONNECTED }));
};
