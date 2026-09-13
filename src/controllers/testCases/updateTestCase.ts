import { Request, Response } from 'express';
import { testCaseService } from '../../services/test/testCaseService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const updateTestCase = async (req: Request, res: Response): Promise<void> => {
  const { testCaseId } = req.params as { testCaseId: string };
  const existing = await testCaseService.get(testCaseId);
  const project = await prisma.project.findUnique({ where: { id: existing.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const testCase = await testCaseService.update(testCaseId, req.body);
  res.status(200).json(ok(testCase, { message: Messages.TEST.UPDATED }));
};