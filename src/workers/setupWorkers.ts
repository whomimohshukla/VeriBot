import { Worker } from 'bullmq';
import { queueConfig } from '../config/queue';
import { logger } from '../config/logger';
import { processTestExecutionJob } from '../jobs/testExecution';
import type { TestJobData } from '../queues/testQueue';

export const setupTestQueueWorker = (): Worker<TestJobData> => {
  const worker = new Worker<TestJobData>(
    'test',
    async (job) => {
      await processTestExecutionJob(job);
    },
    { connection: queueConfig.connection, prefix: queueConfig.prefix, concurrency: 4 }
  );

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queue: 'test', err }, 'test queue job failed');
  });

  return worker;
};
