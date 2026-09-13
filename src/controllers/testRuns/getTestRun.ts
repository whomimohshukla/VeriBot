import { Request, Response } from 'express';
import { testRunService } from '../../services/test/testRunService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const getTestRun = async (req: Request, res: Response): Promise<void> => {
  const { testRunId } = req.params as { testRunId: string };
  const testRun = await testRunService.get(testRunId);
  const project = await prisma.project.findUnique({ where: { id: testRun.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  res.status(200).json(ok(testRun));
};