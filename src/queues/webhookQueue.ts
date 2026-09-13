import { Queue } from 'bullmq';
import { queueConfig } from '../config/queue';

export type WebhookJobData = {
  webhookId: string;
  eventType: string;
  payload: unknown;
  deliveryId?: string;
  organizationId: string;
};

export type WebhookJobNames = 'deliver-webhook' | 'test-webhook';

export const webhookQueue = new Queue<WebhookJobData>('webhook', queueConfig);
