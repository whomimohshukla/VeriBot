import type { AgentType } from '@prisma/client';
import type { LlmUsage } from './llmService';

export interface AgentResult<T = unknown> {
  output: T;
  usage: LlmUsage;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}

export interface AgentContext {
  agentRunId?: string;
  organizationId?: string;
  applicationId?: string;
  projectId?: string;
  testRunId?: string;
  testResultId?: string;
  testCaseId?: string;
  [key: string]: unknown;
}

export interface Agent<TInput, TOutput> {
  type: AgentType;
  execute(context: AgentContext, input: TInput): Promise<AgentResult<TOutput>>;
}

export const AGENT_TYPE_MAP: Record<string, AgentType> = {
  EXPLORER: 'EXPLORER',
  TEST_GENERATOR: 'TEST_GENERATOR',
  EXECUTION: 'EXECUTION',
  FAILURE_ANALYZER: 'FAILURE_ANALYZER',
  BUG_AGENT: 'BUG_AGENT',
  HEALING_AGENT: 'HEALING_AGENT',
  CODE_AGENT: 'CODE_AGENT',
  FIX_AGENT: 'FIX_AGENT',
  REPORT_AGENT: 'REPORT_AGENT',
};