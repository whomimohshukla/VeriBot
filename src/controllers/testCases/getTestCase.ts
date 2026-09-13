import { Request, Response } from 'express';
import { testCaseService } from '../../services/test/testCaseService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const getTestCase = async (req: Request, res: Response): Promise<void> => {
  const { testCaseId } = req.params as { testCaseId: string };
  const testCase = await testCaseService.get(testCaseId);
  const project = await prisma.project.findUnique({ where: { id: testCase.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  res.status(200).json(ok(testCase));
};
