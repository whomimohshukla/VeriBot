import { z } from 'zod';
import { IntegrationType } from '@prisma/client';

export const connectIntegrationSchema = z.object({
  type: z.nativeEnum(IntegrationType),
  projectId: z.string().optional(),
  config: z.record(z.unknown()).default({}),
});

export const updateIntegrationSchema = z.object({
  config: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const integrationParamsSchema = z.object({
  integrationId: z.string().min(1),
});

export const testIntegrationSchema = z.object({
  integrationId: z.string().min(1),
});

export type ConnectIntegrationInput = z.infer<typeof connectIntegrationSchema>;