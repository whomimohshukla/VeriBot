import { z } from 'zod';
import { WebhookEventType } from '@prisma/client';

export const createWebhookSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  eventTypes: z.array(z.nativeEnum(WebhookEventType)).min(1, 'At least one event type'),
  projectId: z.string().optional(),
  secret: z.string().min(16, 'Secret must be at least 16 characters').optional(),
});

export const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  eventTypes: z.array(z.nativeEnum(WebhookEventType)).min(1).optional(),
  isActive: z.boolean().optional(),
});

export const webhookParamsSchema = z.object({
  webhookId: z.string().min(1),
});

export const webhookDeliveryParamsSchema = z.object({
  webhookId: z.string().min(1),
  deliveryId: z.string().min(1),
});

export const testWebhookSchema = z.object({
  webhookId: z.string().min(1),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
