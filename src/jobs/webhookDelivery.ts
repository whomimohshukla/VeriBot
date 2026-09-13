import { Job } from 'bullmq';
import type { WebhookJobData } from '../queues/webhookQueue';
import { webhookService } from '../services/webhook/webhookService';
import { logger } from '../config/logger';

export const processWebhookDeliveryJob = async (job: Job<WebhookJobData>): Promise<void> => {
  if (job.name !== 'deliver-webhook' && job.name !== 'test-webhook') {
    return;
  }
  const { webhookId, eventType, payload, deliveryId } = job.data;
  await webhookService.processDelivery(webhookId, eventType, payload, deliveryId);
  logger.info({ webhookId, deliveryId }, 'webhook delivery processed');
};