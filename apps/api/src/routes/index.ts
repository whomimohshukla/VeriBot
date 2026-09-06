import { Router, type Request, type Response } from "express";
import authRoutes from "./auth.routes.js";
import organizationRoutes from "./organization.routes.js";
import projectRoutes from "./project.routes.js";
import applicationRoutes from "./application.routes.js";
import userRoutes from "./user.routes.js";
import testRoutes from "./test.routes.js";
import { requireAuth } from "../middleware/auth.js";
import { switchOrganizationController } from "../features/auth/controllers/auth.controller.js";

const router: Router = Router();

router.get("/health", (_req: Request, res: Response) => {
	res.json({ ok: true, service: "api", status: "healthy" });
});

router.get("/", (_req: Request, res: Response) => {
	res.json({ name: "VeriBot API", version: "0.1.0" });
});

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/orgs", organizationRoutes);
router.use("/projects", projectRoutes);
router.use("/applications", applicationRoutes);
router.use("/", userRoutes);
router.use("/users", userRoutes);
router.use("/tests", testRoutes);
router.post("/orgs/switch/:orgId", requireAuth, switchOrganizationController);

export default router;
