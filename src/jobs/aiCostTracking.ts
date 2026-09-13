import { Job } from 'bullmq';
import type { AiJobData } from '../queues/aiQueue';
import { agentRunRepository } from '../repositories/agentRun.repository';
import { usageService } from '../services/billing/usageService';
import { logger } from '../config/logger';

export const processAiCostTrackingJob = async (job: Job<AiJobData>): Promise<void> => {
  if (job.name !== 'track-ai-cost') {
    return;
  }

  const data = job.data as { agentRunId?: string; organizationId: string };
  if (!data.agentRunId) {
    return;
  }

  const agentRun = await agentRunRepository.findById(data.agentRunId);
  if (!agentRun) {
    logger.warn({ agentRunId: data.agentRunId }, 'no agent run found for cost tracking');
    return;
  }

  await usageService.increment(data.organizationId, {
    agentRunsExecuted: 1,
    aiTokensUsed: agentRun.tokensUsed ?? 0,
    estimatedCostUsd: agentRun.costUsd ?? 0,
  });

  logger.info({ agentRunId: data.agentRunId }, 'ai cost tracked');
};
