import { Request, Response } from 'express';
import { integrationService } from '../../services/integration/integrationService';
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
  res.status(201).json(created(integration, { message: Messages.INTEGRATION.CONNECTED }));
};
