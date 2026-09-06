import { z } from "zod";

export const registerSchema = z.object({
	firstName: z.string().min(1).max(80),
	lastName: z.string().min(1).max(80),
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
	newPassword: z.string().min(8).max(128),
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

export const organizationUpdateSchema = z.object({
	name: z.string().min(2).max(120).optional(),
	slug: z.string().min(2).max(80).optional(),
	logoUrl: z.string().url().nullable().optional(),
});
export const inviteSchema = z.object({
	email: z.string().email(),
	role: z.enum(["ADMIN", "QA_MANAGER", "DEVELOPER", "TESTER", "VIEWER"]),
});
export const memberRoleSchema = z.object({
	role: z.enum([
		"OWNER",
		"ADMIN",
		"QA_MANAGER",
		"DEVELOPER",
		"TESTER",
		"VIEWER",
	]),
});
export const profileSchema = z.object({
	firstName: z.string().min(1).max(80).optional(),
	lastName: z.string().min(1).max(80).optional(),
	avatarUrl: z.string().url().nullable().optional(),
});
export const settingsSchema = z.object({
	timezone: z.string().min(1).max(80).optional(),
	emailNotifications: z.boolean().optional(),
	slackNotifications: z.boolean().optional(),
});
export const apiKeySchema = z.object({
	name: z.string().min(1).max(120),
	permissions: z.array(z.string()).min(1),
});
export const testCredentialSchema = z.object({
	name: z.string().min(1).max(120),
	username: z.string().min(1).max(200),
	password: z.string().min(1).max(500),
	role: z.string().max(80).optional(),
	environment: z.enum(["DEVELOPMENT", "STAGING", "PRODUCTION", "CUSTOM"]),
});
