import { Request, Response } from 'express';
import { testCaseService } from '../../services/test/testCaseService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const createTestSuite = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { projectId, name, description, type, testCaseIds } = req.body as {
    projectId: string;
    name: string;
    description?: string;
    type?: string;
    testCaseIds: string[];
  };
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.PROJECT.NOT_FOUND);
  }
  const suite = await testCaseService.createSuite({ projectId, name, description, type, testCaseIds });
  res.status(201).json(created(suite, { message: Messages.TEST.CREATED }));
};