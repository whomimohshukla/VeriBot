import { Request, Response } from 'express';
import { projectService } from '../../services/project/projectService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || !req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { name, description } = req.body as { name: string; description?: string };
  const project = await projectService.create({
    organizationId: req.orgId,
    name,
    description,
  });
  res.status(201).json(created(project, { message: Messages.PROJECT.CREATED }));
};
