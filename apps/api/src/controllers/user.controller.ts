import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth";
import {
	apiKeySchema,
	profileSchema,
	settingsSchema,
	testCredentialSchema,
} from "../validators/schemas";
import {
	createApiKey,
	createTestCredential,
	deleteAccount,
	getProfile,
	listApiKeys,
	revokeApiKey,
	setupTwoFactor,
	updateProfile,
	updateSettings,
	verifyTwoFactor,
} from "../services/user.service";

const userId = (req: AuthenticatedRequest) => {
	if (!req.user) throw new Error("Authentication required");
	return req.user.id;
};
const sendError = (res: Response, error: unknown) =>
	res.status(error instanceof z.ZodError ? 400 : 400).json({
		message:
			error instanceof z.ZodError
				? "Validation failed"
				: error instanceof Error
					? error.message
					: "Request failed",
	});

export const profileController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		return res.json(await getProfile(userId(req)));
	} catch (error) {
		return sendError(res, error);
	}
};
export const updateProfileController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		return res.json(
			await updateProfile(userId(req), profileSchema.parse(req.body)),
		);
	} catch (error) {
		return sendError(res, error);
	}
};
export const changeSettingsController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		return res.json(
			await updateSettings(userId(req), settingsSchema.parse(req.body)),
		);
	} catch (error) {
		return sendError(res, error);
	}
};
export const enableTwoFactorController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		return res.json(await setupTwoFactor(userId(req)));
	} catch (error) {
		return sendError(res, error);
	}
};
export const verifyTwoFactorController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		const token = z
			.object({ totpCode: z.string().length(6) })
			.parse(req.body).totpCode;
		return res.json(await verifyTwoFactor(userId(req), token));
	} catch (error) {
		return sendError(res, error);
	}
};
export const deleteAccountController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		const password = z
			.object({ password: z.string().min(8) })
			.parse(req.body).password;
		return res.json(await deleteAccount(userId(req), password));
	} catch (error) {
		return sendError(res, error);
	}
};
export const createApiKeyController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		if (!req.user?.orgId)
			return res
				.status(400)
				.json({ message: "Organization context is required" });
		return res
			.status(201)
			.json(
				await createApiKey(
					userId(req),
					req.user.orgId,
					apiKeySchema.parse(req.body),
				),
			);
	} catch (error) {
		return sendError(res, error);
	}
};
export const listApiKeysController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		if (!req.user?.orgId)
			return res
				.status(400)
				.json({ message: "Organization context is required" });
		return res.json(await listApiKeys(userId(req), req.user.orgId));
	} catch (error) {
		return sendError(res, error);
	}
};
export const revokeApiKeyController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		return res.json(await revokeApiKey(userId(req), req.params.keyId));
	} catch (error) {
		return sendError(res, error);
	}
};
export const createCredentialController = async (
	req: AuthenticatedRequest,
	res: Response,
) => {
	try {
		return res
			.status(201)
			.json(
				await createTestCredential(
					userId(req),
					req.params.projectId,
					testCredentialSchema.parse(req.body),
				),
			);
	} catch (error) {
		return sendError(res, error);
	}
};
