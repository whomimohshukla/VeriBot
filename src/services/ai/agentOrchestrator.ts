import { llmService } from './llmService';
import { explorerAgent } from './explorerAgent';
import { testGeneratorAgent } from './testGeneratorAgent';
import { failureAnalyzerAgent } from './failureAnalyzerAgent';
import { bugDetectionAgent } from './bugDetectionAgent';
import { healingAgent } from './healingAgent';
import { codeAnalysisAgent } from './codeAnalysisAgent';
import { agentRunRepository } from '../../repositories/agentRun.repository';
import { usageService } from '../billing/usageService';
import { logger } from '../../config/logger';
import { NotFoundError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import type { AgentType } from '@prisma/client';
import type { AgentContext, AgentResult } from './agentService';
import type { ExplorerInput } from './explorerAgent';
import type { TestGeneratorInput } from './testGeneratorAgent';
import type { FailureAnalyzerInput } from './failureAnalyzerAgent';
import type { BugDetectionInput } from './bugDetectionAgent';
import type { HealingInput } from './healingAgent';
import type { CodeAnalysisInput } from './codeAnalysisAgent';

type AgentInput = unknown;

export const agentOrchestrator = {
  async run(agentRunId: string, organizationId: string): Promise<void> {
    const agentRun = await agentRunRepository.findById(agentRunId);
    if (!agentRun) {
      throw new NotFoundError(Messages.AGENT.NOT_FOUND);
    }
    void organizationId;

    await agentRunRepository.update(agentRunId, {
      status: 'RUNNING',
      startedAt: new Date(),
    });

    try {
      const context: AgentContext = {
        agentRunId,
        organizationId,
        applicationId: undefined,
        projectId: undefined,
        testRunId: agentRun.testRunId ?? undefined,
        testCaseId: agentRun.testCaseId ?? undefined,
        ...((agentRun.input as Record<string, unknown>) ?? {}),
      };

      const startedAt = Date.now();
      const result = await dispatch(agentRun.agentType, context, agentRun.input);

      await agentRunRepository.update(agentRunId, {
        status: 'COMPLETED',
        output: result.output as object,
        tokensUsed: result.usage.totalTokens,
        costUsd: result.usage.costUsd,
        toolCalls: 0,
        duration: Date.now() - startedAt,
        completedAt: new Date(),
      });

      await usageService.increment(organizationId, {
        agentRunsExecuted: 1,
        aiTokensUsed: result.usage.totalTokens,
        estimatedCostUsd: result.usage.costUsd,
      });

      logger.info({ agentRunId, agentType: agentRun.agentType }, 'agent run completed');
    } catch (error) {
      await agentRunRepository.update(agentRunId, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message.slice(0, 4000) : 'Agent failed',
        completedAt: new Date(),
      });
      logger.error({ agentRunId, err: error }, 'agent run failed');
    }
  },
};

const dispatch = async (
  agentType: AgentType,
  context: AgentContext,
  input: AgentInput
): Promise<AgentResult<unknown>> => {
  switch (agentType) {
    case 'EXPLORER':
      return explorerAgent.execute(context, input as ExplorerInput);
    case 'TEST_GENERATOR':
      return testGeneratorAgent.execute(context, input as TestGeneratorInput);
    case 'FAILURE_ANALYZER':
      return failureAnalyzerAgent.execute(context, input as FailureAnalyzerInput);
    case 'BUG_AGENT':
      return bugDetectionAgent.execute(context, input as BugDetectionInput);
    case 'HEALING_AGENT':
      return healingAgent.execute(context, input as HealingInput);
    case 'CODE_AGENT':
    case 'FIX_AGENT':
      return codeAnalysisAgent.execute(context, input as CodeAnalysisInput);
    default:
      return {
        output: { status: 'not_implemented' },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
        messages: [],
      };
  }
};

export const llmConfigured = (): boolean => llmService.isConfigured();
