import { llmService, type LlmMessage } from './llmService';
import type { AgentContext, AgentResult } from './agentService';

export interface FailureAnalyzerInput {
  errorMessage?: string;
  stackTrace?: string;
  consoleLog?: string[];
  domSnapshot?: unknown;
  networkLog?: unknown;
  testTitle?: string;
  testSteps?: unknown;
  failedStep?: unknown;
}

export interface FailureAnalysis {
  rootCause: string;
  category: 'selector' | 'navigation' | 'data' | 'timeout' | 'functional' | 'network' | 'unknown';
  confidence: number;
  evidence: string[];
  suggestedFix: string;
  relatedSelectors: string[];
}

export interface FailureAnalyzerOutput {
  analysis: FailureAnalysis;
}

const buildPrompt = (input: FailureAnalyzerInput): LlmMessage[] => {
  return [
    {
      role: 'system',
      content:
        'You are an expert QA failure analysis agent. Analyze the test failure data and produce a precise root-cause analysis as JSON with keys: rootCause, category, confidence, evidence, suggestedFix, relatedSelectors.',
    },
    {
      role: 'user',
      content: JSON.stringify(input),
    },
  ];
};

export const fallbackAnalysis = (input: FailureAnalyzerInput): FailureAnalysis => {
  const message = input.errorMessage ?? 'Unknown failure';
  return {
    rootCause: message.slice(0, 1000),
    category: 'unknown',
    confidence: 10,
    evidence: input.consoleLog?.slice(0, 20) ?? [],
    suggestedFix: 'Review the failure evidence and fix the referenced element or flow.',
    relatedSelectors: [],
  };
};

export const failureAnalyzerAgent = {
  type: 'FAILURE_ANALYZER' as const,

  async execute(context: AgentContext, input: FailureAnalyzerInput): Promise<AgentResult<FailureAnalyzerOutput>> {
    const messages = buildPrompt(input);

    if (!llmService.isConfigured()) {
      return {
        output: { analysis: fallbackAnalysis(input) },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
        messages,
      };
    }

    const response = await llmService.chatJson<FailureAnalyzerOutput>(messages);
    return {
      output: {
        analysis: {
          ...fallbackAnalysis(input),
          ...response.data.analysis,
        },
      },
      usage: response.usage,
      messages,
    };
  },
};