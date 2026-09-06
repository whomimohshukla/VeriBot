import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../../../middleware/auth";
import { requestTestRun } from "../services/test-run.service";

const runSchema = z.object({ projectId: z.string().min(1), applicationId: z.string().min(1).optional(), testCaseId: z.string().min(1).optional() });

export const requestTestRunController = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.user?.orgId) return res.status(400).json({ message: "Organization context is required" });
		return res.status(202).json(await requestTestRun(req.user.id, req.user.orgId, runSchema.parse(req.body)));
	} catch (error) {
		return res.status(error instanceof z.ZodError ? 400 : 403).json({ message: error instanceof Error ? error.message : "Unable to queue test run" });
	}
};