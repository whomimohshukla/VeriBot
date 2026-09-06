import type { Request, Response } from "express";
import { z } from "zod";
import { applicationSchema } from "../../../validators/schemas";
import {
	createApplication,
	listApplicationsForProject,
} from "../services/application.service";

export const createApplicationController = async (
	req: Request,
	res: Response,
) => {
	try {
		const parsed = applicationSchema.parse(req.body);
		const userId = (req as any).user?.userId;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const application = await createApplication({
			name: parsed.name,
			url: parsed.url,
			description: parsed.description,
			projectId: parsed.projectId,
			userId,
		});

		return res.status(201).json(application);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json({ message: "Validation failed", errors: error.flatten() });
		}

		return res.status(400).json({
			message:
				error instanceof Error
					? error.message
					: "Application creation failed",
		});
	}
};

export const listApplicationsController = async (
	req: Request,
	res: Response,
) => {
	const projectId = req.params.projectId;
	const applications = await listApplicationsForProject(projectId);
	return res.json(applications);
};
