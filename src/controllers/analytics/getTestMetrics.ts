import { Request, Response } from 'express';
import { metricsService } from '../../services/analytics/metricsService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const getTestMetrics = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const projectId = req.query.projectId as string | undefined;
  const timeframe = Number(req.query.timeframe ?? 30);

  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.organizationId !== req.orgId) {
      res
        .status(403)
        .json({ success: false, error: { code: 'FORBIDDEN', message: Messages.AUTH.FORBIDDEN } });
      return;
    }
  }

  const where = projectId ? { projectId } : {};
  const result = await metricsService.getTestMetrics(where, timeframe);
  res.status(200).json(ok(result));
};
