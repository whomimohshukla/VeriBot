import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const projectRepository = {
  findById: (id: string) =>
    prisma.project.findUnique({ where: { id } }),

  findActiveById: (id: string) =>
    prisma.project.findFirst({ where: { id, archivedAt: null } }),

  create: (data: Prisma.ProjectUncheckedCreateInput) =>
    prisma.project.create({ data }),

  update: (id: string, data: Prisma.ProjectUpdateInput) =>
    prisma.project.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.project.delete({ where: { id } }),

  archive: (id: string) =>
    prisma.project.update({ where: { id }, data: { archivedAt: new Date() } }),

  count: (where: Prisma.ProjectWhereInput = {}) =>
    prisma.project.count({ where }),

  list: (organizationId: string, skip = 0, take = 20, includeArchived = false) =>
    prisma.project.findMany({
      where: {
        organizationId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
};