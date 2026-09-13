import { Request, Response } from 'express';
import { projectService } from '../../services/project/projectService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const getProjectDashboard = async (req: Request, res: Response): Promise<void> => {
  const projectId = req.query.projectId as string | undefined;
  if (!projectId) {
    throw new ForbiddenError(Messages.PROJECT.NOT_FOUND);
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || (req.orgId && project.organizationId !== req.orgId)) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const dashboard = await projectService.getDashboard(projectId);
  res.status(200).json(ok(dashboard));
};