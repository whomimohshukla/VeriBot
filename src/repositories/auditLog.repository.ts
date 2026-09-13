import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const auditLogRepository = {
  create: (data: Prisma.AuditLogUncheckedCreateInput) => prisma.auditLog.create({ data }),

  list: (organizationId: string, skip = 0, take = 20, resourceType?: string) =>
    prisma.auditLog.findMany({
      where: {
        organizationId,
        ...(resourceType ? { resourceType } : {}),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true } } },
    }),

  count: (organizationId: string, resourceType?: string) =>
    prisma.auditLog.count({
      where: {
        organizationId,
        ...(resourceType ? { resourceType } : {}),
      },
    }),
};
