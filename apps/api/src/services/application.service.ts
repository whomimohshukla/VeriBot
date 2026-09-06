import { prisma } from "@autonomiq/database";

export const createApplication = async (input: {
	name: string;
	url: string;
	description?: string;
	projectId: string;
	userId: string;
}) => {
	const app = await prisma.application.create({
		data: {
			name: input.name,
			url: input.url,
			description: input.description,
			projectId: input.projectId,
			createdById: input.userId,
			status: "PENDING",
		},
	});

	return app;
};

export const listApplicationsForProject = async (projectId: string) => {
	return prisma.application.findMany({
		where: { projectId },
		orderBy: { createdAt: "desc" },
	});
};
