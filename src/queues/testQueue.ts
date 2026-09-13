import { Queue } from 'bullmq';
import { queueConfig } from '../config/queue';

export type TestJobData = {
  testRunId?: string;
  testCaseIds?: string[];
  organizationId: string;
  projectId: string;
  createdById?: string;
  testSuiteId?: string;
  environmentId?: string;
  testUserId?: string;
};

export type TestJobNames = 'execute-test-run' | 'execute-test-case' | 'execute-scheduled-run';

export const testQueue = new Queue<TestJobData>('test', queueConfig);

export const enqueueTestExecution = async (data: TestJobData): Promise<string> => {
  const job = await testQueue.add('execute-test-run', data);
  return job.id ?? '';
};
