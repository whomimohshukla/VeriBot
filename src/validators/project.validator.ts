import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().max(1000).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
});

export const projectParamsSchema = z.object({
  projectId: z.string().min(1),
});

export const listProjectsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  includeArchived: z.union([z.literal('true'), z.literal('false')]).default('false'),
});

export const testSuiteParamsSchema = z.object({
  projectId: z.string().min(1),
  suiteId: z.string().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;