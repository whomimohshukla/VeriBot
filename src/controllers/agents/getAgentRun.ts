import { Request, Response } from 'express';
import { agentRunRepository } from '../../repositories/agentRun.repository';
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const getAgentRun = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { agentRunId } = req.params as { agentRunId: string };
  const agentRun = await agentRunRepository.findById(agentRunId);
  if (!agentRun) {
    throw new NotFoundError(Messages.AGENT.NOT_FOUND);
  }
  if (agentRun.organizationId && agentRun.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.AGENT.NOT_FOUND);
  }
  res.status(200).json(ok(agentRun));
};