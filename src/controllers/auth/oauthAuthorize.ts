import { Request, Response } from 'express';
import { oauthService } from '../../services/auth/oauthService';
import { UpstreamError } from '../../utils/errors';
import { ok } from '../../utils/formatters';
import { randomBytes } from 'crypto';

const SUPPORTED_PROVIDERS = new Set(['github']);

export const oauthAuthorize = async (req: Request, res: Response): Promise<void> => {
  const { provider } = req.params as { provider: string };

  if (!SUPPORTED_PROVIDERS.has(provider)) {
    throw new UpstreamError(`Provider '${provider}' is not supported`);
  }

  const state = req.query.state && typeof req.query.state === 'string'
    ? req.query.state
    : randomBytes(16).toString('hex');

  const url = oauthService.getAuthorizationUrl(provider as 'github', state);
  res.status(200).json(ok({ url, state }));
};