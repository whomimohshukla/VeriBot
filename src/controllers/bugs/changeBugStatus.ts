import { Request, Response } from 'express';
import { bugService } from '../../services/bug/bugService';
import { ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { prisma } from '../../config/database';

export const changeBugStatus = async (req: Request, res: Response): Promise<void> => {
  const { bugId } = req.params as { bugId: string };
  const { status } = req.body as {
    status: 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED' | 'CLOSED' | 'REJECTED' | 'DUPLICATE';
  };
  const existing = await bugService.get(bugId);
  const project = await prisma.project.findUnique({ where: { id: existing.projectId } });
  if (req.orgId && project?.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
  }
  const bug = await bugService.changeStatus(bugId, status);
  res.status(200).json(ok(bug, { message: Messages.BUG.STATUS_CHANGED }));
};
