import { prisma } from "@autonomiq/database";
import crypto from "node:crypto";
import {
	comparePassword,
	generateSecureToken,
	hashPassword,
} from "../lib/auth";
import {
	createSession,
	deleteSession,
	getSession,
	SESSION_TTL_SECONDS,
	updateSession,
} from "../lib/session";
import { env } from "../config/env";
import { sendVerificationEmail } from "../lib/email";

const publicUser = (user: {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	avatarUrl: string | null;
	emailVerified: boolean;
}) => ({
	id: user.id,
	email: user.email,
	firstName: user.firstName,
	lastName: user.lastName,
	avatarUrl: user.avatarUrl,
	emailVerified: user.emailVerified,
});

const sessionForUser = async (
	user: { id: string; email: string },
	request?: { userAgent?: string; ipAddress?: string },
) => {
	const membership = await prisma.membership.findFirst({
		where: { userId: user.id, organization: { deletedAt: null } },
		orderBy: { createdAt: "asc" },
		select: { organizationId: true, role: true },
	});
	const session = await createSession({
		userId: user.id,
		email: user.email,
		orgId: membership?.organizationId,
		role: membership?.role,
		userAgent: request?.userAgent,
		ipAddress: request?.ipAddress,
		expiresAt: new Date(
			Date.now() + SESSION_TTL_SECONDS * 1000,
		).toISOString(),
	});
	return { session, organizationId: membership?.organizationId };
};

export const registerUser = async (
	input: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	},
	request?: { userAgent?: string; ipAddress?: string },
) => {
	const email = input.email.toLowerCase();
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing && !existing.deletedAt) throw new Error("User already exists");

	const passwordHash = await hashPassword(input.password);
	const name = `${input.firstName} ${input.lastName}`.trim();
	const verificationToken = generateSecureToken(24);
	const verificationCode = String(crypto.randomInt(100000, 1000000));
	const user = await prisma.$transaction(async (tx) => {
		const created = await tx.user.create({
			data: {
				email,
				passwordHash,
				firstName: input.firstName,
				lastName: input.lastName,
				name,
				emailVerificationToken: verificationToken,
				emailVerificationCode: verificationCode,
				emailVerificationExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24),
				settings: { create: {} },
			},
		});
		const organization = await tx.organization.create({
			data: {
				name: `${input.firstName}'s Organization`,
				slug: `${input.firstName}-${created.id}`
					.toLowerCase()
					.replace(/[^a-z0-9-]/g, ""),
			},
		});
		await tx.membership.create({
			data: {
				userId: created.id,
				organizationId: organization.id,
				role: "OWNER",
			},
		});
		return created;
	});
	await sendVerificationEmail({
		email,
		firstName: input.firstName,
		token: verificationToken,
		code: verificationCode,
	});

	const { session } = await sessionForUser(user, request);
	return {
		user: publicUser(user),
		session,
		verificationToken,
		...(env.nodeEnv !== "production" ? { verificationCode } : {}),
	};
};

export const loginUser = async (
	input: { email: string; password: string },
	request?: { userAgent?: string; ipAddress?: string },
) => {
	const user = await prisma.user.findFirst({
		where: { email: input.email.toLowerCase(), deletedAt: null },
	});
	if (
		!user?.passwordHash ||
		!(await comparePassword(input.password, user.passwordHash))
	)
		throw new Error("Invalid credentials");
	if (env.requireEmailVerification && !user.emailVerified)
		throw new Error("Email verification required");
	const { session, organizationId } = await sessionForUser(user, request);
	return { user: publicUser(user), organizationId, session };
};

export const refreshUserSession = async (sessionToken: string) => {
	const session = await getSession(sessionToken);
	if (!session) throw new Error("Invalid session");
	const refreshed = await updateSession(sessionToken, {});
	if (!refreshed) throw new Error("Invalid session");
	return refreshed;
};

export const logoutUser = async (sessionToken: string) => {
	await deleteSession(sessionToken);
	return { message: "Logged out successfully" };
};

export const requestPasswordReset = async (input: { email: string }) => {
	const user = await prisma.user.findFirst({
		where: { email: input.email.toLowerCase(), deletedAt: null },
	});
	if (user) {
		const token = generateSecureToken(24);
		await prisma.user.update({
			where: { id: user.id },
			data: {
				resetPasswordToken: token,
				resetPasswordExpiry: new Date(Date.now() + 1000 * 60 * 60),
			},
		});
	}
	return {
		message:
			"If an account exists for this email, password reset instructions have been sent.",
	};
};

export const resetPassword = async (input: {
	token: string;
	newPassword: string;
}) => {
	const user = await prisma.user.findFirst({
		where: {
			resetPasswordToken: input.token,
			resetPasswordExpiry: { gt: new Date() },
			deletedAt: null,
		},
	});
	if (!user) throw new Error("Invalid or expired reset token");
	await prisma.user.update({
		where: { id: user.id },
		data: {
			passwordHash: await hashPassword(input.newPassword),
			resetPasswordToken: null,
			resetPasswordExpiry: null,
		},
	});
	return { message: "Password reset successful" };
};

export const changePassword = async (input: {
	userId: string;
	currentPassword: string;
	newPassword: string;
}) => {
	const user = await prisma.user.findUnique({ where: { id: input.userId } });
	if (
		!user?.passwordHash ||
		!(await comparePassword(input.currentPassword, user.passwordHash))
	)
		throw new Error("Current password is incorrect");
	await prisma.user.update({
		where: { id: input.userId },
		data: { passwordHash: await hashPassword(input.newPassword) },
	});
	return { message: "Password changed successfully" };
};

export const verifyEmail = async (input: { token?: string; code?: string }) => {
	const user = await prisma.user.findFirst({
		where: {
			OR: [
				...(input.token ? [{ emailVerificationToken: input.token }] : []),
				...(input.code ? [{ emailVerificationCode: input.code }] : []),
			],
			emailVerificationExpiry: { gt: new Date() },
		},
	});
	if (!user) throw new Error("Invalid or expired verification token");
	await prisma.user.update({
		where: { id: user.id },
		data: {
			emailVerified: true,
			emailVerificationToken: null,
			emailVerificationCode: null,
			emailVerificationExpiry: null,
		},
	});
	return { message: "Email verified successfully" };
};

export const getCurrentUser = async (userId: string) => {
	const user = await prisma.user.findFirst({
		where: { id: userId, deletedAt: null },
		include: {
			memberships: { include: { organization: true } },
			settings: true,
		},
	});
	if (!user) throw new Error("User not found");
	return {
		...publicUser(user),
		settings: user.settings,
		organizations: user.memberships.map((membership) => ({
			...membership.organization,
			role: membership.role,
		})),
	};
};

export const oauthLoginOrRegister = async (input: {
	provider: "GOOGLE" | "GITHUB";
	providerAccountId: string;
	email?: string;
	name?: string;
}) => {
	const existing = await prisma.oAuthAccount.findUnique({
		where: {
			provider_providerAccountId: {
				provider: input.provider,
				providerAccountId: input.providerAccountId,
			},
		},
		include: { user: true },
	});
	let user = existing?.user;
	if (!user) {
		if (!input.email)
			throw new Error("Email is required to continue with social login");
		const foundUser = await prisma.user.findUnique({
			where: { email: input.email.toLowerCase() },
		});
		if (foundUser) user = foundUser;
		if (!user) {
			const parts = (input.name ?? input.email.split("@")[0]).split(" ");
			user = await prisma.user.create({
				data: {
					email: input.email.toLowerCase(),
					firstName: parts[0],
					lastName: parts.slice(1).join(" ") || "User",
					name: input.name ?? parts[0],
					emailVerified: true,
					oauthAccounts: {
						create: {
							provider: input.provider,
							providerAccountId: input.providerAccountId,
							email: input.email.toLowerCase(),
							name: input.name,
						},
					},
				},
			});
		} else {
			await prisma.oAuthAccount.create({
				data: {
					provider: input.provider,
					providerAccountId: input.providerAccountId,
					userId: user.id,
					email: input.email,
					name: input.name,
				},
			});
		}
	}
	return sessionForUser(user);
};
