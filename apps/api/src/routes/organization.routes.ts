import { Router, type Router as ExpressRouter } from "express";
import { requireAuth, requireOrgRole } from "../middleware/auth";
import { createOrganizationController, listOrganizationsController } from "../controllers/organization.controller";

const router: ExpressRouter = Router();

router.use(requireAuth);
router.get("/", requireOrgRole(["OWNER", "ADMIN", "QA_MANAGER", "DEVELOPER", "TESTER", "VIEWER"]), listOrganizationsController);
router.post("/", createOrganizationController);

export default router;
