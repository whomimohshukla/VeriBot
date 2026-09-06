import { Router, type Router as ExpressRouter } from "express";
import {
	changePasswordController,
	loginController,
	logoutController,
	oauthController,
	refreshController,
	registerController,
	requestPasswordResetController,
	resetPasswordController,
	verifyEmailController,
	meController,
} from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router: ExpressRouter = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/refresh", refreshController);
router.post("/logout", requireAuth, logoutController);
router.post("/password-reset/request", requestPasswordResetController);
router.post("/password-reset", resetPasswordController);
router.post("/password/change", requireAuth, changePasswordController);
router.post("/verify-email", verifyEmailController);
router.get("/me", requireAuth, meController);
router.post("/oauth/:provider", oauthController);

export default router;
