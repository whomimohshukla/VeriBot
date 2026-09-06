import { Router, type Router as ExpressRouter } from "express";
import {
	changePasswordController,
	loginController,
	logoutController,
	oauthCallbackController,
	oauthController,
	oauthRedirectController,
	refreshController,
	registerController,
	requestPasswordResetController,
	resetPasswordController,
	verifyEmailController,
	meController,
	listSessionsController,
	revokeSessionController,
	revokeOtherSessionsController,
	switchOrganizationController,
} from "../features/auth/controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { deleteAccountController } from "../features/users/controllers/user.controller";

const router: ExpressRouter = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController);
router.post("/logout", requireAuth, logoutController);
router.post("/password-reset/request", requestPasswordResetController);
router.post("/password-reset", resetPasswordController);
router.post("/password/change", requireAuth, changePasswordController);
router.delete("/account", requireAuth, deleteAccountController);
router.post("/verify-email", verifyEmailController);
router.get("/me", requireAuth, meController);
router.get("/sessions", requireAuth, listSessionsController);
router.delete("/sessions/:sessionId", requireAuth, revokeSessionController);
router.delete("/sessions", requireAuth, revokeOtherSessionsController);
router.post("/switch/:orgId", requireAuth, switchOrganizationController);
router.post("/oauth/:provider", oauthController);
router.get("/google", oauthRedirectController);
router.get("/google/callback", oauthCallbackController);
router.get("/github", oauthRedirectController);
router.get("/github/callback", oauthCallbackController);

export default router;
