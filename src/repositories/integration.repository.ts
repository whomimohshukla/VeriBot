import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const integrationRepository = {
  findById: (id: string) => prisma.integration.findUnique({ where: { id } }),

  findByType: (organizationId: string, type: string, projectId?: string | null) =>
    prisma.integration.findFirst({
      where: {
        organizationId,
        type: type as Prisma.IntegrationWhereInput['type'],
        projectId: projectId ?? null,
      },
    }),

  create: (data: Prisma.IntegrationUncheckedCreateInput) => prisma.integration.create({ data }),

  update: (id: string, data: Prisma.IntegrationUpdateInput) =>
    prisma.integration.update({ where: { id }, data }),

  hardDelete: (id: string) => prisma.integration.delete({ where: { id } }),

  list: (organizationId: string, projectId?: string | null) =>
    prisma.integration.findMany({
      where: {
        organizationId,
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    }),
};
