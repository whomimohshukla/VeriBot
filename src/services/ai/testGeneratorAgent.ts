import { llmService, type LlmMessage } from './llmService';
import { applicationRepository } from '../../repositories/application.repository';
import type { AgentContext, AgentResult } from './agentService';
import type { TestStep } from '../../types/domain.types';
import type { TestType } from '@prisma/client';

export interface TestGeneratorInput {
  applicationId: string;
  requirements?: string;
  types?: string[];
  count?: number;
}

export interface GeneratedTestCase {
  title: string;
  description: string;
  type: TestType;
  priority: 'high' | 'medium' | 'low';
  steps: TestStep[];
  expectedResult: string;
  tags: string[];
}

export interface TestGeneratorOutput {
  testCases: GeneratedTestCase[];
}

const buildPrompt = (appMap: unknown, input: TestGeneratorInput): LlmMessage[] => {
  return [
    {
      role: 'system',
      content:
        'You are an AI test generation agent. Produce concrete Playwright test cases (using selectors found in the app map) as JSON. Each step must use one of: goto, click, fill, press, waitForSelector, waitForTimeout, expectVisible, expectText, screenshot. Return JSON only with a "testCases" array.',
    },
    {
      role: 'user',
      content: JSON.stringify({
        applicationMap: appMap,
        requirements: input.requirements,
        types: input.types,
        count: input.count ?? 5,
        outputSchema: {
          testCases: [
            {
              title: 'string',
              description: 'string',
              type: 'TestType enum',
              priority: 'high|medium|low',
              steps: [{ action: 'string', selector: 'string', value: 'string' }],
              expectedResult: 'string',
              tags: ['string'],
            },
          ],
        },
      }),
    },
  ];
};

export const testGeneratorAgent = {
  type: 'TEST_GENERATOR' as const,

  async execute(context: AgentContext, input: TestGeneratorInput): Promise<AgentResult<TestGeneratorOutput>> {
    const map = await applicationRepository.getMap(input.applicationId);
    const messages = buildPrompt(
      map ? { pages: map.pages, components: map.components, workflows: map.workflows } : null,
      input
    );

    if (!llmService.isConfigured()) {
      return {
        output: {
          testCases: [
            {
              title: 'Placeholder smoke test',
              description: 'LLM not configured',
              type: 'SMOKE',
              priority: 'medium',
              steps: [{ action: 'goto', value: map?.baseUrl ?? '' }],
              expectedResult: 'Page loads',
              tags: ['smoke'],
            },
          ],
        },
        usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, costUsd: 0 },
        messages,
      };
    }

    const response = await llmService.chatJson<TestGeneratorOutput>(messages);
    return { output: response.data, usage: response.usage, messages };
  },
};
