import { Request, Response } from 'express';
import { projectService } from '../../services/project/projectService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const getProject = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.params as { projectId: string };
  const project = await projectService.get(projectId);
  if (req.orgId && project.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  res.status(200).json(ok(project));
};
