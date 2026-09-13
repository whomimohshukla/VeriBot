import { Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { testCaseService } from '../../services/test/testCaseService';
import { auditService } from '../../services/audit/auditTrailService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const updateTestSuite = async (req: Request, res: Response): Promise<void> => {
  const { testSuiteId } = req.params as { testSuiteId: string };
  const suite = await testCaseService.getSuite(testSuiteId);
  const project = await prisma.project.findUnique({ where: { id: suite.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const updated = await testCaseService.updateSuite(testSuiteId, req.body as Prisma.TestSuiteUpdateInput);
  if (req.orgId && req.user) {
    await auditService.log(
      {
        organizationId: req.orgId,
        userId: req.user.id,
        projectId: suite.projectId,
        actionType: 'UPDATE',
        resourceType: 'test_suite',
        resourceId: testSuiteId,
        changes: req.body,
      },
      req
    );
  }
  res.status(200).json(ok(updated, { message: Messages.TEST.UPDATED }));
};
