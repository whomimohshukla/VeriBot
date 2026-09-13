import { z } from 'zod';
import { AgentType } from '@prisma/client';

export const triggerAgentSchema = z.object({
  agentType: z.nativeEnum(AgentType),
  input: z.record(z.string(), z.unknown()).optional(),
  testRunId: z.string().optional(),
  testCaseId: z.string().optional(),
  projectId: z.string().optional(),
});

export const agentParamsSchema = z.object({
  agentRunId: z.string().min(1),
});

export const listAgentRunsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  agentType: z.nativeEnum(AgentType).optional(),
  status: z.string().optional(),
});

export type TriggerAgentInput = z.infer<typeof triggerAgentSchema>;
