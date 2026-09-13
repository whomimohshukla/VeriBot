import { testQueue } from './testQueue';
import { aiQueue, aiExplorationQueue } from './aiQueue';
import { reportQueue } from './reportQueue';
import { webhookQueue } from './webhookQueue';

export const queues = {
  testQueue,
  aiQueue,
  aiExplorationQueue,
  reportQueue,
  webhookQueue,
};

export const closeAllQueues = async (): Promise<void> => {
  await Promise.all([testQueue.close(), aiQueue.close(), reportQueue.close(), webhookQueue.close()]);
};

export type { TestJobData, TestJobNames } from './testQueue';
export type { AiJobData, AiJobNames } from './aiQueue';
export type { ReportJobData, ReportJobNames } from './reportQueue';
export type { WebhookJobData, WebhookJobNames } from './webhookQueue';
