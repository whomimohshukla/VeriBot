import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const auditLogRepository = {
  create: (data: Prisma.AuditLogCreateInput) => prisma.auditLog.create({ data }),

  list: (organizationId: string, skip = 0, take = 20) =>
    prisma.auditLog.findMany({
      where: { organizationId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
};
