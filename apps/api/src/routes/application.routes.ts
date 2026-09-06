import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/auth";
import { createApplicationController, listApplicationsController } from "../features/applications/controllers/application.controller";

const router: ExpressRouter = Router();

router.use(requireAuth);
router.get("/:projectId", listApplicationsController);
router.post("/", createApplicationController);

export default router;
