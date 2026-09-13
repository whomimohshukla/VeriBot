import { Request, Response } from 'express';
import { projectService } from '../../services/project/projectService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const archiveProject = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params as { projectId: string };
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const archived = await projectService.archive(projectId);
  res.status(200).json(ok(archived, { message: Messages.PROJECT.ARCHIVED }));
};