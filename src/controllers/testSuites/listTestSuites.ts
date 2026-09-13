import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { testCaseService } from '../../services/test/testCaseService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const listTestSuites = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { projectId } = req.query as { projectId?: string };
  if (!projectId) {
    throw new ForbiddenError('projectId query parameter is required.');
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.PROJECT.NOT_FOUND);
  }
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const suites = await testCaseService.listSuites(projectId, page, pageSize);
  res.status(200).json(ok(suites));
};
