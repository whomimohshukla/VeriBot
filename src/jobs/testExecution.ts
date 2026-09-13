import { Job } from 'bullmq';
import { testExecutionService } from '../services/test/testExecutionService';
import { logger } from '../config/logger';
import type { TestJobData } from '../queues/testQueue';

const handleExecuteTestRun = async (job: Job<TestJobData>): Promise<void> => {
  if (!job.data.testRunId) {
    logger.error({ jobId: job.id }, 'execute-test-run job missing testRunId');
    return;
  }
  const { testRunId, projectId, organizationId } = job.data;
  await testExecutionService.executeRun({ testRunId, projectId, organizationId });
};

const handleExecuteScheduledRun = async (job: Job<TestJobData>): Promise<void> => {
  const data = job.data;
  if (!data.projectId) {
    logger.error({ jobId: job.id }, 'execute-scheduled-run job missing projectId');
    return;
  }
  const { testRunService } = await import('../services/test/testRunService');
  await testRunService.startRun({
    projectId: data.projectId,
    organizationId: data.organizationId,
    createdById: data.createdById ?? 'system',
    testSuiteId: data.testSuiteId,
    testCaseIds: data.testCaseIds,
    environmentId: data.environmentId,
    testUserId: data.testUserId,
  });
};

export const processTestExecutionJob = async (job: Job<TestJobData>): Promise<void> => {
  switch (job.name as string) {
    case 'execute-test-run':
      return handleExecuteTestRun(job);
    case 'execute-test-case':
      return handleExecuteTestRun(job);
    case 'execute-scheduled-run':
      return handleExecuteScheduledRun(job);
    default:
      logger.warn({ jobName: job.name }, 'unhandled test queue job name');
  }
};
