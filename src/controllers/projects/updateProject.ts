import { Request, Response } from 'express';
import { projectService } from '../../services/project/projectService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params as { projectId: string };
  const { name, description } = req.body as { name?: string; description?: string };
  const existing = await projectService.getIncludingArchived(projectId);
  if (req.orgId && existing.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const project = await projectService.update(projectId, { name, description });
  res.status(200).json(ok(project, { message: Messages.PROJECT.UPDATED }));
};