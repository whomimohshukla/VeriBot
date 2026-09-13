import { Request, Response } from 'express';
import { testRunService } from '../../services/test/testRunService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const cancelTestRun = async (req: Request, res: Response): Promise<void> => {
  const { testRunId } = req.params as { testRunId: string };
  const existing = await testRunService.get(testRunId);
  const project = await prisma.project.findUnique({ where: { id: existing.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const testRun = await testRunService.cancel(testRunId);
  res.status(200).json(ok(testRun, { message: Messages.TEST.RUN_CANCELLED }));
};
