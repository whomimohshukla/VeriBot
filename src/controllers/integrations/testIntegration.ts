import { Request, Response } from 'express';
import { integrationService } from '../../services/integration/integrationService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const testIntegration = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { integrationId } = req.params as { integrationId: string };
  const integration = await integrationService.get(integrationId);
  if (integration.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const result = await integrationService.test(integrationId);
  res.status(200).json(ok(result, { message: Messages.INTEGRATION.TESTED }));
};