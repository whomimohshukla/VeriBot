import { Request, Response } from 'express';
import { analyticsService } from '../../services/analytics/analyticsService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const projectId = req.query.projectId as string | undefined;
  const result = await analyticsService.getDashboardAnalytics(req.orgId, projectId);
  res.status(200).json(ok(result));
};