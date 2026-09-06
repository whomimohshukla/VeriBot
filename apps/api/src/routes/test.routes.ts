import { Router, type Router as ExpressRouter } from "express";
import {
	apiKeyAuthMiddleware,
	requireApiKeyPermission,
} from "../middleware/auth";
import { requestTestRunController } from "../features/tests/controllers/test-run.controller";

const router: ExpressRouter = Router();
router.post(
	"/run",
	apiKeyAuthMiddleware,
	requireApiKeyPermission("test:run"),
	requestTestRunController,
);
export default router;
