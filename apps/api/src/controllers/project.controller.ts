import type { Request, Response } from "express";
import { z } from "zod";
import { projectSchema } from "../validators/schemas";
import {
	createProject,
	listProjectsForOrganization,
} from "../services/project.service";

export const createProjectController = async (req: Request, res: Response) => {
	try {
		const parsed = projectSchema.parse(req.body);
		const userId = (req as any).user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const project = await createProject({
			name: parsed.name,
			description: parsed.description,
			organizationId: parsed.organizationId,
			userId,
		});

		return res.status(201).json(project);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return res
				.status(400)
				.json({ message: "Validation failed", errors: error.flatten() });
		}

		return res
			.status(400)
			.json({
				message:
					error instanceof Error
						? error.message
						: "Project creation failed",
			});
	}
};

export const listProjectsController = async (req: Request, res: Response) => {
	const organizationId = req.params.organizationId;
	const projects = await listProjectsForOrganization(organizationId);
	return res.json(projects);
};
