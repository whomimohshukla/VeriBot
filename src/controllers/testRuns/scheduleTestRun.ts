import { Request, Response } from 'express';
import { testRunService } from '../../services/test/testRunService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const scheduleTestRun = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || !req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { projectId, testSuiteId, testCaseIds, environmentId, cron } = req.body as {
    projectId: string;
    testSuiteId?: string;
    testCaseIds?: string[];
    environmentId?: string;
    cron: string;
  };
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.PROJECT.NOT_FOUND);
  }
  const result = await testRunService.schedule({
    projectId,
    organizationId: req.orgId,
    createdById: req.user.id,
    testSuiteId,
    testCaseIds,
    environmentId,
    cron,
  });
  res.status(200).json(ok(result, { message: Messages.TEST.RUN_SCHEDULED }));
};