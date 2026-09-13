import { Request, Response } from 'express';
import { bugService } from '../../services/bug/bugService';
import { UnauthorizedError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const addBugComment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { bugId } = req.params as { bugId: string };
  const { content } = req.body as { content: string };
  const existing = await bugService.get(bugId);
  const project = await prisma.project.findUnique({ where: { id: existing.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const comment = await bugService.addComment(bugId, req.user.id, content);
  res.status(201).json(created(comment, { message: Messages.BUG.COMMENT_ADDED }));
};