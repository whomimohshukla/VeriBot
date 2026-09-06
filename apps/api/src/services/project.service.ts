import { prisma } from "@autonomiq/database";

export const createProject = async (input: {
	name: string;
	description?: string;
	organizationId: string;
	userId: string;
}) => {
	const slug = input.name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

	const project = await prisma.project.create({
		data: {
			name: input.name,
			slug: `${slug}-${Date.now()}`.slice(0, 60),
			description: input.description,
			organizationId: input.organizationId,
			createdById: input.userId,
			status: "ACTIVE",
		},
	});

	return project;
};

export const listProjectsForOrganization = async (organizationId: string) => {
	return prisma.project.findMany({
		where: { organizationId },
		orderBy: { createdAt: "desc" },
	});
};
