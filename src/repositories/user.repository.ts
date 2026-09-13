import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const userRepository = {
  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findActiveById: (id: string) => prisma.user.findFirst({ where: { id, deletedAt: null } }),

  findActiveByEmail: (email: string) => prisma.user.findFirst({ where: { email, deletedAt: null } }),

  create: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data }),

  softDelete: (id: string) => prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }),

  count: (where: Prisma.UserWhereInput = {}) => prisma.user.count({ where: { deletedAt: null, ...where } }),

  list: (where: Prisma.UserWhereInput = {}, skip = 0, take = 20) =>
    prisma.user.findMany({
      where: { deletedAt: null, ...where },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
};
