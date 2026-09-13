import { Prisma, WebhookEventType } from '@prisma/client';
import { prisma } from '../config/database';

export const webhookRepository = {
  findById: (id: string) => prisma.webhook.findUnique({ where: { id } }),

  create: (data: Prisma.WebhookUncheckedCreateInput) => prisma.webhook.create({ data }),

  update: (id: string, data: Prisma.WebhookUpdateInput) => prisma.webhook.update({ where: { id }, data }),

  hardDelete: (id: string) => prisma.webhook.delete({ where: { id } }),

  list: (organizationId: string, projectId?: string | null) =>
    prisma.webhook.findMany({
      where: {
        organizationId,
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    }),

  listActiveForEvent: (organizationId: string, eventType: WebhookEventType) =>
    prisma.webhook.findMany({
      where: {
        organizationId,
        isActive: true,
        eventTypes: { has: eventType },
      },
    }),

  createDelivery: (data: Prisma.WebhookDeliveryUncheckedCreateInput) =>
    prisma.webhookDelivery.create({ data }),

  updateDelivery: (id: string, data: Prisma.WebhookDeliveryUpdateInput) =>
    prisma.webhookDelivery.update({ where: { id }, data }),
};
