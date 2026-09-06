import { Router, type Request, type Response } from "express";
import authRoutes from "./auth.routes.js";
import organizationRoutes from "./organization.routes.js";
import projectRoutes from "./project.routes.js";
import applicationRoutes from "./application.routes.js";

const router: Router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "api", status: "healthy" });
});

router.get("/", (_req: Request, res: Response) => {
  res.json({ name: "VeriBot API", version: "0.1.0" });
});

router.use("/auth", authRoutes);
router.use("/organizations", organizationRoutes);
router.use("/projects", projectRoutes);
router.use("/applications", applicationRoutes);

export default router;
