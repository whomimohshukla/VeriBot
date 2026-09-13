import { z } from 'zod';
import { EnvironmentType } from '@prisma/client';

export const createApplicationSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1, 'Name is required').max(120),
  baseUrl: z.string().url('Must be a valid URL'),
  description: z.string().max(500).optional(),
});

export const updateApplicationSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  baseUrl: z.string().url('Must be a valid URL').optional(),
  description: z.string().max(500).optional(),
});

export const applicationParamsSchema = z.object({
  applicationId: z.string().min(1),
});

export const addEnvironmentSchema = z.object({
  type: z.nativeEnum(EnvironmentType),
  url: z.string().url('Must be a valid URL'),
  name: z.string().max(80).optional(),
});

export const addTestUserSchema = z.object({
  environmentId: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email().optional(),
  password: z.string().min(1, 'Password is required'),
  role: z.string().max(80).optional(),
  description: z.string().max(500).optional(),
});

export const scanApplicationSchema = z.object({
  environmentId: z.string().optional(),
  maxPages: z.coerce.number().int().min(1).max(100).default(25),
  testUserId: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
