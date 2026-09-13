import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { testCaseService } from '../../services/test/testCaseService';
import { testRunService } from '../../services/test/testRunService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';

export const runTestSuite = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || !req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { testSuiteId } = req.params as { testSuiteId: string };
  const { environmentId, testUserId } = req.body as {
    environmentId?: string;
    testUserId?: string;
  };
  const suite = await testCaseService.getSuite(testSuiteId);
  const project = await prisma.project.findUnique({ where: { id: suite.projectId } });
  if (!project || project.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.PROJECT.NOT_FOUND);
  }
  if (suite.testSuiteItems.length === 0) {
    throw new ForbiddenError('Suite has no test cases.');
  }
  const testRun = await testRunService.startRun({
    projectId: suite.projectId,
    testSuiteId: suite.id,
    environmentId,
    testUserId,
    createdById: req.user.id,
    organizationId: req.orgId,
  });
  res.status(201).json(created(testRun, { message: Messages.TEST.RUN_STARTED }));
};
