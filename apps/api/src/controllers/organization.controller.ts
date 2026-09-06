import type { Request, Response } from "express";
import { z } from "zod";
import { organizationSchema } from "../validators/schemas";
import { createOrganization, listOrganizationsForUser } from "../services/organization.service";

export const createOrganizationController = async (req: Request, res: Response) => {
  try {
    const parsed = organizationSchema.parse(req.body);
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const organization = await createOrganization({ name: parsed.name, userId });
    return res.status(201).json(organization);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    return res.status(400).json({ message: error instanceof Error ? error.message : "Failed to create organization" });
  }
};

export const listOrganizationsController = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const organizations = await listOrganizationsForUser(userId);
  return res.json(organizations);
};
