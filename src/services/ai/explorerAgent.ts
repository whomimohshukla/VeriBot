import { llmService, type LlmMessage } from './llmService';
import { applicationRepository } from '../../repositories/application.repository';
import { logger } from '../../config/logger';
import type { AgentContext, AgentResult } from './agentService';

export interface ExplorerInput {
  applicationId: string;
  baseUrl: string;
}

export interface ExplorerOutput {
  summary: string;
  suggestedWorkflows: Array<{
    name: string;
    description: string;
    pages: string[];
    steps: Array<{ action: string; detail: string }>;
  }>;
}

const buildPrompt = (appMap: unknown, baseUrl: string): LlmMessage[] => {
  return [
    {
      role: 'system',
      content:
        'You are an AI QA explorer agent. Given a discovered application map, produce a structured analysis of key user workflows the QA team should test. Return JSON only.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        baseUrl,
        applicationMap: appMap,
        task: 'Identify the top user journeys, the pages involved in each, and the steps to complete each journey.',
      }),
    },
  ];
};

export const explorerAgent = {
  type: 'EXPLORER' as const,

  async execute(context: AgentContext, input: ExplorerInput): Promise<AgentResult<ExplorerOutput>> {
    const map = await applicationRepository.getMap(input.applicationId);
    const messages = buildPrompt(map ? { pages: map.pages, workflows: map.workflows } : null, input.baseUrl);

    if (!llmService.isConfigured()) {
      return {
        output: {
          summary: 'LLM not configured; returning discovered map as-is.',
          suggestedWorkflows: [],
        },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
        messages,
      };
    }

    const response = await llmService.chatJson<ExplorerOutput>(messages);
    logger.info(
      { applicationId: input.applicationId, agentRunId: context.agentRunId },
      'explorer agent complete'
    );
    return { output: response.data, usage: response.usage, messages };
  },
};
