import crypto from "node:crypto";
import { prisma } from "@autonomiq/database";
import { generateSecret, generateURI, verify } from "otplib";
import QRCode from "qrcode";
import { comparePassword, hashPassword } from "../lib/auth";

export const getProfile = async (userId: string) =>
	prisma.user.findFirst({
		where: { id: userId, deletedAt: null },
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			avatarUrl: true,
			emailVerified: true,
			twoFactorEnabled: true,
			createdAt: true,
		},
	});
export const updateProfile = async (
	userId: string,
	input: { firstName?: string; lastName?: string; avatarUrl?: string | null },
) =>
	prisma.user.update({
		where: { id: userId },
		data: {
			...input,
			...(input.firstName || input.lastName
				? {
						name: `${input.firstName ?? ""} ${input.lastName ?? ""}`.trim(),
					}
				: {}),
		},
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			avatarUrl: true,
			emailVerified: true,
		},
	});
export const updateSettings = async (
	userId: string,
	input: {
		timezone?: string;
		emailNotifications?: boolean;
		slackNotifications?: boolean;
	},
) =>
	prisma.userSettings.upsert({
		where: { userId },
		create: { userId, ...input },
		update: input,
	});
export const setupTwoFactor = async (userId: string) => {
	const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
	const secret = generateSecret();
	const uri = generateURI({ issuer: "AutonomIQ", label: user.email, secret });
	const qrCodeUrl = await QRCode.toDataURL(uri);
	await prisma.user.update({
		where: { id: userId },
		data: { twoFactorSecret: secret },
	});
	return { secret, qrCodeUrl };
};
export const verifyTwoFactor = async (userId: string, token: string) => {
	const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
	if (
		!user.twoFactorSecret ||
		!(await verify({ secret: user.twoFactorSecret, token })).valid
	)
		throw new Error("Invalid two-factor code");
	await prisma.user.update({
		where: { id: userId },
		data: { twoFactorEnabled: true },
	});
	return { message: "Two-factor authentication enabled" };
};
export const deleteAccount = async (userId: string, password: string) => {
	const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
	if (
		!user.passwordHash ||
		!(await comparePassword(password, user.passwordHash))
	)
		throw new Error("Current password is incorrect");
	await prisma.user.update({
		where: { id: userId },
		data: {
			deletedAt: new Date(),
			email: `deleted-${user.id}@invalid.local`,
		},
	});
	return { message: "Account deleted" };
};

export const createApiKey = async (
	userId: string,
	organizationId: string,
	input: { name: string; permissions: string[] },
) => {
	const plain = `ak_${crypto.randomBytes(32).toString("hex")}`;
	const keyHash = crypto.createHash("sha256").update(plain).digest("hex");
	const key = await prisma.apiKey.create({
		data: {
			name: input.name,
			keyHash,
			permissions: input.permissions,
			userId,
			organizationId,
		},
	});
	return {
		key: plain,
		apiKey: {
			id: key.id,
			name: key.name,
			permissions: key.permissions,
			createdAt: key.createdAt,
		},
	};
};
export const listApiKeys = async (userId: string, organizationId: string) =>
	prisma.apiKey.findMany({
		where: { userId, organizationId, revokedAt: null },
		select: {
			id: true,
			name: true,
			permissions: true,
			lastUsedAt: true,
			expiresAt: true,
			createdAt: true,
		},
	});
export const revokeApiKey = async (userId: string, id: string) =>
	prisma.apiKey.updateMany({
		where: { id, userId, revokedAt: null },
		data: { revokedAt: new Date() },
	});

const encryptionKey = () => {
	const value = process.env.TEST_CREDENTIAL_ENCRYPTION_KEY;
	if (!value) throw new Error("TEST_CREDENTIAL_ENCRYPTION_KEY is required");
	return crypto.createHash("sha256").update(value).digest();
};
export const createTestCredential = async (
	userId: string,
	projectId: string,
	input: {
		name: string;
		username: string;
		password: string;
		role?: string;
		environment: "DEVELOPMENT" | "STAGING" | "PRODUCTION" | "CUSTOM";
	},
) => {
	const project = await prisma.project.findFirst({
		where: {
			id: projectId,
			organization: { memberships: { some: { userId } } },
		},
	});
	if (!project) throw new Error("Project access denied");
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
	const encryptedPassword = Buffer.concat([
		cipher.update(input.password, "utf8"),
		cipher.final(),
	]);
	const credential = await prisma.testCredential.create({
		data: {
			projectId,
			name: input.name,
			username: input.username,
			encryptedPassword: encryptedPassword.toString("base64"),
			passwordIv: iv.toString("base64"),
			passwordAuthTag: cipher.getAuthTag().toString("base64"),
			role: input.role,
			environment: input.environment,
		},
	});
	return {
		id: credential.id,
		name: credential.name,
		username: credential.username,
		role: credential.role,
		environment: credential.environment,
		createdAt: credential.createdAt,
	};
};
