import { Request, Response } from 'express';
import { projectService } from '../../services/project/projectService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const listProjects = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 20);
  const includeArchived = req.query.includeArchived === 'true';
  const result = await projectService.list(req.orgId, page, pageSize, includeArchived);
  res.status(200).json(ok(result));
};