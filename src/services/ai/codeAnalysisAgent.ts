import { llmService, type LlmMessage } from './llmService';
import type { AgentContext, AgentResult } from './agentService';

export interface CodeAnalysisInput {
  repository?: string;
  filePaths?: string[];
  context?: string;
}

export interface CodeAnalysisOutput {
  summary: string;
  suspiciousFiles: Array<{ path: string; reason: string; confidence: number }>;
  suggestedFix: string | null;
}

const buildPrompt = (input: CodeAnalysisInput): LlmMessage[] => {
  return [
    {
      role: 'system',
      content:
        'You are a code analysis agent used by an AI QA platform. Analyze repository context and produce JSON with keys: summary, suspiciousFiles, suggestedFix.',
    },
    {
      role: 'user',
      content: JSON.stringify(input),
    },
  ];
};

export const codeAnalysisAgent = {
  type: 'CODE_AGENT' as const,

  async execute(context: AgentContext, input: CodeAnalysisInput): Promise<AgentResult<CodeAnalysisOutput>> {
    const messages = buildPrompt(input);

    if (!llmService.isConfigured()) {
      return {
        output: {
          summary: 'Repository analysis requires an LLM to be configured.',
          suspiciousFiles: [],
          suggestedFix: null,
        },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
        messages,
      };
    }

    const response = await llmService.chatJson<CodeAnalysisOutput>(messages);
    return { output: response.data, usage: response.usage, messages };
  },
};
