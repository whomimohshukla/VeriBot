import { Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { metricsService } from '../../services/analytics/metricsService';

export const getAgentMetrics = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const metrics = await metricsService.getAgentMetrics(req.orgId);
  res.status(200).json(ok(metrics));
};
