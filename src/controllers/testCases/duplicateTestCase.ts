import { Request, Response } from 'express';
import { testCaseService } from '../../services/test/testCaseService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const duplicateTestCase = async (req: Request, res: Response): Promise<void> => {
  const { testCaseId } = req.params as { testCaseId: string };
  const existing = await testCaseService.get(testCaseId);
  const project = await prisma.project.findUnique({ where: { id: existing.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const testCase = await testCaseService.duplicate(testCaseId);
  res.status(201).json(created(testCase, { message: Messages.TEST.DUPLICATED }));
};
