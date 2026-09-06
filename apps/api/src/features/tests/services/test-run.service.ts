import { prisma } from "@autonomiq/database";

export const requestTestRun = async (userId: string, organizationId: string, input: { projectId: string; applicationId?: string; testCaseId?: string }) => {
	const project = await prisma.project.findFirst({ where: { id: input.projectId, organizationId, organization: { memberships: { some: { userId } } } }, select: { id: true } });
	if (!project) throw new Error("Project access denied");
	const run = await prisma.testRun.create({ data: { projectId: input.projectId, applicationId: input.applicationId, testCaseId: input.testCaseId, status: "QUEUED" } });
	return { id: run.id, status: run.status, projectId: run.projectId, createdAt: run.createdAt };
};