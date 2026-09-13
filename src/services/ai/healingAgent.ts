import { llmService, type LlmMessage } from './llmService';
import type { AgentContext, AgentResult } from './agentService';

export interface HealingInput {
  oldSelector: string;
  errorMessage: string;
  pageSnapshot?: unknown;
}

export interface HealingOutput {
  repaired: boolean;
  newSelector: string | null;
  reason: string;
  confidence: number;
}

const buildPrompt = (input: HealingInput): LlmMessage[] => {
  return [
    {
      role: 'system',
      content:
        'You are a test healing agent. Given a failing selector and a snapshot of the current DOM, determine whether the element can be found under a new selector. Return JSON with keys: repaired, newSelector, reason, confidence.',
    },
    {
      role: 'user',
      content: JSON.stringify(input),
    },
  ];
};

export const healingAgent = {
  type: 'HEALING_AGENT' as const,

  async execute(context: AgentContext, input: HealingInput): Promise<AgentResult<HealingOutput>> {
    const messages = buildPrompt(input);

    if (!llmService.isConfigured()) {
      return {
        output: { repaired: false, newSelector: null, reason: 'LLM not configured', confidence: 0 },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
        messages,
      };
    }

    const response = await llmService.chatJson<HealingOutput>(messages);
    return { output: response.data, usage: response.usage, messages };
  },
};