import { prisma } from "@autonomiq/database";
import crypto from "node:crypto";

export const createOrganization = async (input: {
	name: string;
	userId: string;
}) => {
	const slug = input.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

	const organization = await prisma.organization.create({
		data: {
			name: input.name,
			slug: `${slug}-${Date.now()}`.slice(0, 60),
			memberships: {
				create: {
					userId: input.userId,
					role: "OWNER",
				},
			},
		},
		include: {
			memberships: true,
		},
	});

	return organization;
};

export const listOrganizationsForUser = async (userId: string) => {
	return prisma.organization.findMany({
		where: {
			memberships: {
				some: {
					userId,
				},
			},
		},
		include: {
			memberships: true,
		},
	});
};

export const getOrganization = async (organizationId: string, userId: string) =>
	prisma.organization.findFirst({
		where: {
			id: organizationId,
			deletedAt: null,
			memberships: { some: { userId } },
		},
		include: {
			memberships: {
				include: {
					user: {
						select: {
							id: true,
							email: true,
							firstName: true,
							lastName: true,
						},
					},
				},
			},
		},
	});
export const updateOrganization = async (
	organizationId: string,
	input: { name?: string; slug?: string; logoUrl?: string | null },
) => prisma.organization.update({ where: { id: organizationId }, data: input });
export const deleteOrganization = async (
	organizationId: string,
	userId: string,
) =>
	prisma.$transaction(async (tx) => {
		const organization = await tx.organization.update({
			where: { id: organizationId },
			data: { deletedAt: new Date() },
		});
		await tx.project.updateMany({
			where: { organizationId },
			data: { status: "ARCHIVED" },
		});
		await tx.apiKey.updateMany({
			where: { organizationId },
			data: { revokedAt: new Date() },
		});
		await tx.auditLog.create({
			data: {
				action: "DELETE",
				resource: "Organization",
				resourceId: organizationId,
				organizationId,
				userId,
			},
		});
		return organization;
	});
export const inviteMember = async (
	organizationId: string,
	userId: string,
	input: {
		email: string;
		role: "ADMIN" | "QA_MANAGER" | "DEVELOPER" | "TESTER" | "VIEWER";
	},
) => {
	const token = crypto.randomUUID();
	const invitation = await prisma.invitation.create({
		data: {
			organizationId,
			email: input.email.toLowerCase(),
			role: input.role,
			token,
			expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
		},
	});
	await prisma.auditLog.create({
		data: {
			action: "CREATE",
			resource: "Invitation",
			resourceId: invitation.id,
			organizationId,
			userId,
		},
	});
	return invitation;
};
export const listMembers = async (organizationId: string) =>
	prisma.membership.findMany({
		where: { organizationId },
		include: {
			user: {
				select: { id: true, email: true, firstName: true, lastName: true },
			},
		},
	});
export const changeMemberRole = async (
	organizationId: string,
	userId: string,
	role: "OWNER" | "ADMIN" | "QA_MANAGER" | "DEVELOPER" | "TESTER" | "VIEWER",
	actorId: string,
) => {
	const membership = await prisma.membership.update({
		where: { userId_organizationId: { userId, organizationId } },
		data: { role },
	});
	await prisma.auditLog.create({
		data: {
			action: "ROLE_CHANGE",
			resource: "Membership",
			resourceId: membership.id,
			organizationId,
			userId: actorId,
			details: { targetUserId: userId, role },
		},
	});
	return membership;
};
export const removeMember = async (organizationId: string, userId: string) =>
	prisma.membership.delete({
		where: { userId_organizationId: { userId, organizationId } },
	});
export const acceptInvitation = async (userId: string, token: string) => {
	const invitation = await prisma.invitation.findUnique({ where: { token } });
	if (
		!invitation ||
		invitation.acceptedAt ||
		invitation.expiresAt < new Date()
	)
		throw new Error("Invalid or expired invitation");
	const membership = await prisma.membership.create({
		data: {
			userId,
			organizationId: invitation.organizationId,
			role: invitation.role,
		},
	});
	await prisma.invitation.update({
		where: { id: invitation.id },
		data: { acceptedAt: new Date() },
	});
	return membership;
};
