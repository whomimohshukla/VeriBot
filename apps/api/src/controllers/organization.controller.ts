import type { Request, Response } from "express";
import { z } from "zod";
import {
	inviteSchema,
	memberRoleSchema,
	organizationSchema,
	organizationUpdateSchema,
} from "../validators/schemas";
import {
	acceptInvitation,
	changeMemberRole,
	createOrganization,
	deleteOrganization,
	getOrganization,
	inviteMember,
	listMembers,
	listOrganizationsForUser,
	removeMember,
	updateOrganization,
} from "../services/organization.service";

export const createOrganizationController = async (
	req: Request,
	res: Response,
) => {
	try {
		const parsed = organizationSchema.parse(req.body);
		const userId = (req as any).user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Authentication required" });
		}

		const organization = await createOrganization({
			name: parsed.name,
			userId,
		});
		return res.status(201).json(organization);
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
					: "Failed to create organization",
		});
	}
};

export const listOrganizationsController = async (
	req: Request,
	res: Response,
) => {
	const userId = (req as any).user?.id;

	if (!userId) {
		return res.status(401).json({ message: "Authentication required" });
	}

	const organizations = await listOrganizationsForUser(userId);
	return res.json(organizations);
};

export const getOrganizationController = async (
	req: Request,
	res: Response,
) => {
	try {
		const result = await getOrganization(
			req.params.orgId,
			(req as any).user?.id,
		);
		return result
			? res.json(result)
			: res.status(404).json({ message: "Organization not found" });
	} catch (error) {
		return res.status(400).json({
			message: error instanceof Error ? error.message : "Request failed",
		});
	}
};
export const updateOrganizationController = async (
	req: Request,
	res: Response,
) => {
	try {
		return res.json(
			await updateOrganization(
				req.params.orgId,
				organizationUpdateSchema.parse(req.body),
			),
		);
	} catch (error) {
		return res.status(400).json({
			message: error instanceof Error ? error.message : "Update failed",
		});
	}
};
export const deleteOrganizationController = async (
	req: Request,
	res: Response,
) => {
	try {
		return res.json(
			await deleteOrganization(req.params.orgId, (req as any).user?.id),
		);
	} catch (error) {
		return res.status(400).json({
			message: error instanceof Error ? error.message : "Delete failed",
		});
	}
};
export const inviteMemberController = async (req: Request, res: Response) => {
	try {
		return res
			.status(201)
			.json(
				await inviteMember(
					req.params.orgId,
					(req as any).user?.id,
					inviteSchema.parse(req.body),
				),
			);
	} catch (error) {
		return res.status(400).json({
			message: error instanceof Error ? error.message : "Invite failed",
		});
	}
};
export const listMembersController = async (req: Request, res: Response) =>
	res.json(await listMembers(req.params.orgId));
export const changeMemberRoleController = async (
	req: Request,
	res: Response,
) => {
	try {
		return res.json(
			await changeMemberRole(
				req.params.orgId,
				req.params.userId,
				memberRoleSchema.parse(req.body).role,
				(req as any).user?.id,
			),
		);
	} catch (error) {
		return res.status(400).json({
			message: error instanceof Error ? error.message : "Role update failed",
		});
	}
};
export const removeMemberController = async (req: Request, res: Response) => {
	try {
		return res.json(await removeMember(req.params.orgId, req.params.userId));
	} catch (error) {
		return res.status(400).json({
			message:
				error instanceof Error ? error.message : "Member removal failed",
		});
	}
};
export const acceptInvitationController = async (
	req: Request,
	res: Response,
) => {
	try {
		return res.json(
			await acceptInvitation(
				(req as any).user?.id,
				z.object({ token: z.string().min(20) }).parse(req.body).token,
			),
		);
	} catch (error) {
		return res.status(400).json({
			message:
				error instanceof Error
					? error.message
					: "Invitation acceptance failed",
		});
	}
};
