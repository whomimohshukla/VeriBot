import { Queue } from 'bullmq';
import { queueConfig } from '../config/queue';

export type AiJobData =
  | {
      scanId?: string;
      applicationId: string;
      organizationId: string;
      projectId?: string;
      environmentId?: string;
      testUserId?: string;
      maxPages?: number;
    }
  | {
      testRunId: string;
      testResultId: string;
      organizationId: string;
      projectId: string;
      failingResults?: Array<{ testResultId: string; testCaseId: string; testCaseTitle: string }>;
    }
  | {
      testCaseId: string;
      applicationId: string;
      projectId: string;
      organizationId: string;
      requirements?: string;
      types?: string[];
      count?: number;
    }
  | {
      agentRunId: string;
      organizationId: string;
    };

export type AiJobNames =
  'explore-application' | 'analyze-failure' | 'generate-tests' | 'run-agent' | 'track-ai-cost';

export const aiQueue = new Queue<AiJobData>('ai', queueConfig);

export const aiExplorationQueue = aiQueue;
