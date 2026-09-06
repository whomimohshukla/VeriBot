import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

export const oauthCallbackSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(120).optional(),
  providerAccountId: z.string().min(1),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
});

export const organizationSchema = z.object({
  name: z.string().min(2).max(120),
});

export const projectSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(1000).optional(),
  organizationId: z.string().min(1),
});

export const applicationSchema = z.object({
  name: z.string().min(2).max(120),
  url: z.string().url(),
  description: z.string().max(1000).optional(),
  projectId: z.string().min(1),
});
