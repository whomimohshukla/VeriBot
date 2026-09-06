import { Router, type Router as ExpressRouter } from "express";
import { authMiddleware } from "../middleware/auth";
import {
	changeSettingsController,
	createApiKeyController,
	createCredentialController,
	deleteAccountController,
	enableTwoFactorController,
	listApiKeysController,
	profileController,
	revokeApiKeyController,
	updateProfileController,
	verifyTwoFactorController,
} from "../controllers/user.controller";

const router: ExpressRouter = Router();
router.use(authMiddleware);
router.get("/me/profile", profileController);
router.patch("/me/profile", updateProfileController);
router.patch("/me/settings", changeSettingsController);
router.post("/me/enable-2fa", enableTwoFactorController);
router.post("/me/verify-2fa", verifyTwoFactorController);
router.delete("/me/account", deleteAccountController);
router.post("/api-keys", createApiKeyController);
router.get("/api-keys", listApiKeysController);
router.delete("/api-keys/:keyId", revokeApiKeyController);
router.post(
	"/projects/:projectId/test-credentials",
	createCredentialController,
);
export default router;
