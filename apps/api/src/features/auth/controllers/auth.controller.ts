import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../../../config/env";
import { SESSION_COOKIE } from "../../../lib/session";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import {
	changePasswordSchema,
	loginSchema,
	oauthCallbackSchema,
	registerSchema,
	requestPasswordResetSchema,
	resetPasswordSchema,
	sessionIdSchema,
	switchOrganizationSchema,
} from "../../../validators/schemas";
import {
	changePassword,
	getCurrentUser,
	loginUser,
	logoutUser,
	oauthLoginOrRegister,
	refreshUserSession,
	registerUser,
	requestPasswordReset,
	resetPassword,
	verifyEmail,
	listUserSessions,
	revokeOtherUserSessions,
	revokeUserSession,
	switchUserOrganization,
} from "../services/auth.service";
import { completeOAuthAuthorization, createOAuthAuthorizationUrl, type OAuthProvider } from "../services/oauth.service";

const cookieOptions = {
	httpOnly: true,
	signed: true,
	secure: env.nodeEnv === "production",
	sameSite: "lax" as const,
	maxAge: 1000 * 60 * 60 * 24 * 30,
	path: "/",
};
const setSessionCookie = (res: Response, token: string) =>
	res.cookie(SESSION_COOKIE, token, cookieOptions);
const validationError = (error: unknown) =>
	error instanceof z.ZodError
		? {
				status: 400,
				body: { message: "Validation failed", errors: error.flatten() },
			}
		: null;

export const registerController = async (req: Request, res: Response) => {
	try {
		const result = await registerUser(registerSchema.parse(req.body), {
			userAgent: req.get("user-agent"),
			ipAddress: req.ip,
		});
		setSessionCookie(res, result.session);
		return res.status(201).json({
			user: result.user,
			...(result.verificationCode
				? { verificationCode: result.verificationCode }
				: {}),
		});
	} catch (error) {
		const validation = validationError(error);
		return res.status(validation?.status ?? 400).json(
			validation?.body ?? {
				message:
					error instanceof Error ? error.message : "Registration failed",
			},
		);
	}
};

export const loginController = async (req: Request, res: Response) => {
	try {
		const result = await loginUser(loginSchema.parse(req.body), {
			userAgent: req.get("user-agent"),
			ipAddress: req.ip,
		});
		setSessionCookie(res, result.session);
		return res.json({
			user: result.user,
			organizationId: result.organizationId,
		});
	} catch (error) {
		const validation = validationError(error);
		return res.status(validation?.status ?? 401).json(
			validation?.body ?? {
				message: error instanceof Error ? error.message : "Login failed",
			},
		);
	}
};

export const refreshController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		if (!req.sessionToken)
			return res.status(401).json({ message: "Authentication required" });
		const session = await refreshUserSession(req.sessionToken);
		setSessionCookie(res, req.sessionToken);
		return res.json({ expiresAt: session.expiresAt });
	} catch (error) {
		return res.status(401).json({
			message: error instanceof Error ? error.message : "Refresh failed",
		});
	}
};

export const logoutController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	if (req.sessionToken) await logoutUser(req.sessionToken);
	res.clearCookie(SESSION_COOKIE, cookieOptions);
	return res.json({ message: "Logged out successfully" });
};

export const requestPasswordResetController = async (
	req: Request,
	res: Response,
) => {
	try {
		return res.json(
			await requestPasswordReset(requestPasswordResetSchema.parse(req.body)),
		);
	} catch (error) {
		const validation = validationError(error);
		return res
			.status(validation?.status ?? 400)
			.json(
				validation?.body ?? { message: "Password reset request failed" },
			);
	}
};

export const resetPasswordController = async (req: Request, res: Response) => {
	try {
		return res.json(await resetPassword(resetPasswordSchema.parse(req.body)));
	} catch (error) {
		const validation = validationError(error);
		return res.status(validation?.status ?? 400).json(
			validation?.body ?? {
				message:
					error instanceof Error ? error.message : "Password reset failed",
			},
		);
	}
};

export const verifyEmailController = async (req: Request, res: Response) => {
	try {
		return res.json(
			await verifyEmail(
				z
					.object({
						token: z.string().min(20).optional(),
						code: z.string().length(6).optional(),
					})
					.refine((value) => value.token || value.code, {
						message: "A verification token or code is required",
					})
					.parse(req.body),
			),
		);
	} catch (error) {
		return res.status(400).json({
			message:
				error instanceof Error ? error.message : "Verification failed",
		});
	}
};

export const changePasswordController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		if (!req.user)
			return res.status(401).json({ message: "Authentication required" });
		return res.json(
			await changePassword({
				userId: req.user.id,
				...changePasswordSchema.parse(req.body),
			}),
		);
	} catch (error) {
		const validation = validationError(error);
		return res.status(validation?.status ?? 400).json(
			validation?.body ?? {
				message:
					error instanceof Error
						? error.message
						: "Password change failed",
			},
		);
	}
};

export const meController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		if (!req.user)
			return res.status(401).json({ message: "Authentication required" });
		return res.json(await getCurrentUser(req.user.id));
	} catch (error) {
		return res.status(404).json({
			message: error instanceof Error ? error.message : "User not found",
		});
	}
};

export const listSessionsController = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.user) return res.status(401).json({ message: "Authentication required" });
		return res.json(await listUserSessions(req.user.id));
	} catch (error) {
		return res.status(500).json({ message: error instanceof Error ? error.message : "Unable to list sessions" });
	}
};

export const revokeSessionController = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.user) return res.status(401).json({ message: "Authentication required" });
		return res.json(await revokeUserSession(req.user.id, sessionIdSchema.parse(req.params).sessionId));
	} catch (error) {
		return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to revoke session" });
	}
};

export const revokeOtherSessionsController = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.user || !req.sessionToken) return res.status(401).json({ message: "Authentication required" });
		return res.json(await revokeOtherUserSessions(req.user.id, req.sessionToken));
	} catch (error) {
		return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to revoke sessions" });
	}
};

export const switchOrganizationController = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.user || !req.sessionToken) return res.status(401).json({ message: "Authentication required" });
		const organizationId = req.params.orgId ?? switchOrganizationSchema.parse(req.body).organizationId;
		return res.json(await switchUserOrganization(req.user.id, req.sessionToken, organizationId));
	} catch (error) {
		return res.status(403).json({ message: error instanceof Error ? error.message : "Unable to switch organization" });
	}
};

export const oauthController = async (req: Request, res: Response) => {
	try {
		const provider = String(req.params.provider).toUpperCase();
		if (provider !== "GOOGLE" && provider !== "GITHUB")
			return res.status(400).json({ message: "Unsupported OAuth provider" });
		const result = await oauthLoginOrRegister({
			provider,
			...oauthCallbackSchema.parse(req.body),
		});
		setSessionCookie(res, result.session);
		return res.json({ message: "OAuth login successful" });
	} catch (error) {
		return res.status(400).json({
			message: error instanceof Error ? error.message : "OAuth login failed",
		});
	}
};

export const oauthRedirectController = async (req: Request, res: Response) => {
	try {
		const provider = req.params.provider as OAuthProvider;
		if (provider !== "google" && provider !== "github") return res.status(400).json({ message: "Unsupported OAuth provider" });
		return res.redirect(await createOAuthAuthorizationUrl(provider));
	} catch (error) {
		return res.status(503).json({ message: error instanceof Error ? error.message : "OAuth provider unavailable" });
	}
};

export const oauthCallbackController = async (req: Request, res: Response) => {
	try {
		const provider = req.params.provider as OAuthProvider;
		const query = z.object({ code: z.string().min(1), state: z.string().min(1) }).parse(req.query);
		const result = await completeOAuthAuthorization(provider, query.code, query.state);
		setSessionCookie(res, result.session);
		return res.redirect(`${env.frontendUrl}/auth/callback?provider=${provider}&status=success`);
	} catch (error) {
		const message = encodeURIComponent(error instanceof Error ? error.message : "OAuth callback failed");
		return res.redirect(`${env.frontendUrl}/auth/callback?status=error&message=${message}`);
	}
};
