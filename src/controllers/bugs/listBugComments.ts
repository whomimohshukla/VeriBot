import { Request, Response } from 'express';
import { bugService } from '../../services/bug/bugService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const listBugComments = async (req: Request, res: Response): Promise<void> => {
  const { bugId } = req.params as { bugId: string };
  const bug = await bugService.get(bugId);
  const project = await prisma.project.findUnique({ where: { id: bug.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const page = Number(req.query.page ?? 1);
  const pageSize = Number(req.query.pageSize ?? 50);
  const comments = await bugService.listComments(bugId, page, pageSize);
  res.status(200).json(ok(comments));
};
