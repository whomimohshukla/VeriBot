import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/auth";
import {
	createProjectController,
	listProjectsController,
} from "../features/projects/controllers/project.controller";

const router: ExpressRouter = Router();

router.use(requireAuth);
router.get("/:organizationId", listProjectsController);
router.post("/", createProjectController);

export default router;
