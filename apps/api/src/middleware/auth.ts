import type { NextFunction, Request, Response } from "express";
import { prisma } from "@autonomiq/database";
import { getSession, SESSION_COOKIE } from "../lib/session";
import crypto from "node:crypto";

export interface AuthenticatedRequest extends Request {
	user?: { id: string; email: string; orgId?: string; role?: string };
	sessionToken?: string;
}

export const authMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	const token = req.signedCookies?.[SESSION_COOKIE] as string | undefined;
	if (!token)
		return res.status(401).json({ message: "Authentication required" });

	try {
		const session = await getSession(token);
		if (!session || new Date(session.expiresAt) <= new Date())
			return res.status(401).json({ message: "Session expired" });

		const user = await prisma.user.findFirst({
			where: { id: session.userId, deletedAt: null },
			select: { id: true, email: true },
		});
		if (!user)
			return res.status(401).json({ message: "User account unavailable" });

		req.user = {
			id: user.id,
			email: user.email,
			orgId: session.orgId,
			role: session.role,
		};
		req.sessionToken = token;
		return next();
	} catch {
		return res.status(401).json({ message: "Invalid session" });
	}
};

export const requireAuth = authMiddleware;

export const apiKeyAuthMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	const value = req.header("x-api-key");
	if (!value) return res.status(401).json({ message: "API key required" });
	const keyHash = crypto.createHash("sha256").update(value).digest("hex");
	const apiKey = await prisma.apiKey.findFirst({
		where: {
			keyHash,
			revokedAt: null,
			OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
		},
		include: { user: true },
	});
	if (!apiKey) return res.status(401).json({ message: "Invalid API key" });
	await prisma.apiKey.update({
		where: { id: apiKey.id },
		data: { lastUsedAt: new Date() },
	});
	req.user = {
		id: apiKey.user.id,
		email: apiKey.user.email,
		orgId: apiKey.organizationId,
	};
	return next();
};

export const orgMiddleware = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	const organizationId =
		req.params.orgId ?? req.params.organizationId ?? req.user?.orgId;
	if (!organizationId || !req.user)
		return res
			.status(403)
			.json({ message: "Organization context is required" });

	const membership = await prisma.membership.findUnique({
		where: { userId_organizationId: { userId: req.user.id, organizationId } },
		select: { role: true },
	});
	if (!membership)
		return res.status(403).json({ message: "Organization access denied" });

	req.user.orgId = organizationId;
	req.user.role = membership.role;
	return next();
};

const permissions: Record<string, string[]> = {
	OWNER: ["*"],
	ADMIN: [
		"member:invite",
		"member:remove",
		"member:change-role",
		"project:create",
		"project:delete",
		"project:update",
		"project:archive",
		"test:create",
		"test:update",
		"test:delete",
		"test:run",
		"test:schedule",
		"bug:create",
		"bug:update",
		"bug:delete",
		"github:connect",
		"github:create-pr",
		"billing:view",
		"billing:manage",
		"api-key:create",
		"api-key:delete",
		"settings:update",
		"audit-log:view",
	],
	QA_MANAGER: [
		"project:create",
		"project:update",
		"project:archive",
		"test:create",
		"test:update",
		"test:delete",
		"test:run",
		"bug:create",
		"bug:update",
		"view:reports",
	],
	DEVELOPER: [
		"test:run",
		"bug:create",
		"bug:update",
		"view:reports",
		"github:connect",
	],
	TESTER: ["test:run", "bug:create", "view:reports"],
	VIEWER: ["view:reports", "view:dashboard"],
};

export const permissionMiddleware = (permission: string) => {
	return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
		const role = req.user?.role;
		if (
			!role ||
			!(
				permissions[role]?.includes("*") ||
				permissions[role]?.includes(permission)
			)
		)
			return res.status(403).json({ message: "Permission denied" });
		return next();
	};
};

export const requireOrgRole = (allowedRoles: string[]) => {
	return async (
		req: AuthenticatedRequest,
		res: Response,
		next: NextFunction,
	) => {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const organizationId =
			(req.params.orgId as string | undefined) ??
			(req.params.organizationId as string | undefined) ??
			(req.body?.organizationId as string | undefined) ??
			(req.query?.organizationId as string | undefined) ??
			(req.headers["x-organization-id"] as string | undefined);

		if (!organizationId) {
			return res
				.status(400)
				.json({ message: "Organization context is required" });
		}

		const membership = await prisma.membership.findUnique({
			where: {
				userId_organizationId: {
					userId,
					organizationId,
				},
			},
			select: {
				role: true,
			},
		});

		if (!membership) {
			return res
				.status(403)
				.json({ message: "You do not belong to this organization" });
		}

		if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
			return res
				.status(403)
				.json({
					message: "You do not have permission to perform this action",
				});
		}

		req.user!.orgId = organizationId;
		req.user!.role = membership.role;

		return next();
	};
};
