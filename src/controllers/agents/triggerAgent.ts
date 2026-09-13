import { Request, Response } from 'express';
import { agentRunRepository } from '../../repositories/agentRun.repository';
import { aiQueue } from '../../queues/aiQueue';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';
import type { AgentType } from '@prisma/client';

export const triggerAgent = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || !req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { agentType, input, testRunId, testCaseId, projectId } = req.body as {
    agentType: AgentType;
    input?: unknown;
    testRunId?: string;
    testCaseId?: string;
    projectId?: string;
  };

  const agentRun = await agentRunRepository.create({
    agentType,
    input: (input ?? {}) as object,
    testRunId,
    testCaseId,
    organizationId: req.orgId,
    projectId,
    status: 'PENDING',
  });

  await aiQueue.add('run-agent', {
    agentRunId: agentRun.id,
    organizationId: req.orgId,
  });

  res.status(201).json(created(agentRun, { message: Messages.AGENT.TRIGGERED }));
};