import { Request, Response } from 'express';
import { integrationService } from '../../services/integration/integrationService';
import { auditService } from '../../services/audit/auditTrailService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';
import type { IntegrationType } from '@prisma/client';

export const connectIntegration = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { type, projectId, config } = req.body as {
    type: IntegrationType;
    projectId?: string;
    config: Record<string, unknown>;
  };
  const integration = await integrationService.connect(req.orgId, { type, projectId, config });
  await auditService.log(
    {
      organizationId: req.orgId,
      userId: req.user?.id ?? '',
      projectId: projectId ?? undefined,
      actionType: 'INTEGRATION',
      resourceType: 'integration',
      resourceId: integration.id,
      changes: { type },
    },
    req
  );
  res.status(201).json(created(integration, { message: Messages.INTEGRATION.CONNECTED }));
};
