import { Request, Response } from 'express';
import { integrationService } from '../../services/integration/integrationService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const getIntegration = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { integrationId } = req.params as { integrationId: string };
  const integration = await integrationService.get(integrationId);
  if (integration.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const config = await integrationService.getConfig(integrationId);
  res.status(200).json(ok({ ...integration, config: scrubbedConfig(config) }));
};

const scrubbedConfig = (config: Record<string, unknown>): Record<string, unknown> => {
  const secretKeys = ['accessToken', 'token', 'apiKey', 'secret', 'botToken', 'apiToken'];
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(config)) {
    result[key] = secretKeys.includes(key) ? '••••••' : value;
  }
  return result;
};