import { ConnectionOptions } from 'bullmq';
import { parseRedisUrl } from './redis';
import { env } from './environment';

export const queueConnection: ConnectionOptions = {
  ...parseRedisUrl(env.REDIS_URL),
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
};

export const queuePrefix = 'veribot:queues';

export const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
  removeOnComplete: {
    age: 60 * 60 * 24 * 7,
    count: 1000,
  },
  removeOnFail: {
    age: 60 * 60 * 24 * 14,
  },
};

export const queueConfig = {
  connection: queueConnection,
  prefix: queuePrefix,
  defaultJobOptions,
};