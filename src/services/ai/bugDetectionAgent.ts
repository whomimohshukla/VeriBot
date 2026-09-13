import { llmService, type LlmMessage } from './llmService';
import type { AgentContext, AgentResult } from './agentService';
import type { FailureAnalysis } from './failureAnalyzerAgent';
import type { BugSeverity, BugPriority } from '@prisma/client';

export interface BugDetectionInput {
  testTitle: string;
  analysis: FailureAnalysis;
  expectation?: string;
}

export interface DetectedBug {
  title: string;
  description: string;
  severity: BugSeverity;
  priority: BugPriority;
  rootCause: string;
  expectedBehavior: string;
  actualBehavior: string;
  reproductionSteps: string[];
  confidence: number;
}

export interface BugDetectionOutput {
  suspicious: boolean;
  candidate: DetectedBug | null;
}

const buildPrompt = (input: BugDetectionInput): LlmMessage[] => {
  return [
    {
      role: 'system',
      content:
        'You are an expert bug triage agent. Decide whether a failed test represents a real product bug and produce a JSON result with keys: suspicious, candidate. If suspicious is false, candidate must be null.',
    },
    {
      role: 'user',
      content: JSON.stringify(input),
    },
  ];
};

export const bugDetectionAgent = {
  type: 'BUG_AGENT' as const,

  async execute(context: AgentContext, input: BugDetectionInput): Promise<AgentResult<BugDetectionOutput>> {
    const messages = buildPrompt(input);

    if (!llmService.isConfigured()) {
      return {
        output: {
          suspicious: true,
          candidate: {
            title: input.testTitle,
            description: input.analysis.rootCause,
            severity: 'MEDIUM',
            priority: 'P2',
            rootCause: input.analysis.rootCause,
            expectedBehavior: input.expectation ?? 'Expected behavior not defined',
            actualBehavior: input.analysis.rootCause,
            reproductionSteps: [],
            confidence: input.analysis.confidence,
          },
        },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
        messages,
      };
    }

    const response = await llmService.chatJson<BugDetectionOutput>(messages);
    return { output: response.data, usage: response.usage, messages };
  },
};
