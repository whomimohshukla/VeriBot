import { z } from 'zod';

export const createTestSuiteSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().max(1000).optional(),
  type: z.enum(['regression', 'smoke', 'sanity', 'custom']).default('custom'),
  testCaseIds: z.array(z.string().min(1)).default([]),
});

export const runTestsSchema = z.object({
  projectId: z.string().min(1),
  testSuiteId: z.string().optional(),
  testCaseIds: z.array(z.string().min(1)).optional(),
  environmentId: z.string().optional(),
  testUserId: z.string().optional(),
});

export const scheduleTestRunSchema = z.object({
  projectId: z.string().min(1),
  testSuiteId: z.string().optional(),
  testCaseIds: z.array(z.string().min(1)).optional(),
  environmentId: z.string().optional(),
  cron: z.string().min(1, 'Cron expression is required'),
});

export const testRunParamsSchema = z.object({
  testRunId: z.string().min(1),
});

export const listTestRunsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  projectId: z.string().optional(),
  status: z.enum(['PENDING', 'RUNNING', 'PASSED', 'FAILED', 'SKIPPED', 'CANCELLED']).optional(),
});

export type RunTestsInput = z.infer<typeof runTestsSchema>;