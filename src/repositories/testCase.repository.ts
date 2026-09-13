import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const testCaseRepository = {
  findById: (id: string) =>
    prisma.testCase.findUnique({ where: { id } }),

  create: (data: Prisma.TestCaseUncheckedCreateInput) =>
    prisma.testCase.create({ data }),

  update: (id: string, data: Prisma.TestCaseUpdateInput) =>
    prisma.testCase.update({ where: { id }, data }),

  softDelete: (id: string) =>
    prisma.testCase.delete({ where: { id } }),

  archive: (id: string) =>
    prisma.testCase.update({ where: { id }, data: { archivedAt: new Date() } }),

  duplicate: (id: string, data: Prisma.TestCaseUncheckedCreateInput) =>
    prisma.testCase.create({ data }),

  count: (where: Prisma.TestCaseWhereInput = {}) =>
    prisma.testCase.count({ where: { status: { not: 'archived' }, ...where } }),

  list: (where: Prisma.TestCaseWhereInput = {}, skip = 0, take = 20) =>
    prisma.testCase.findMany({
      where: { status: { not: 'archived' }, ...where },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),

  listByIds: (ids: string[]) =>
    prisma.testCase.findMany({ where: { id: { in: ids }, status: { not: 'archived' } } }),

  findSuite: (id: string) =>
    prisma.testSuite.findUnique({
      where: { id },
      include: {
        testSuiteItems: { include: { testCase: true }, orderBy: { order: 'asc' } },
      },
    }),

  createSuite: (data: Prisma.TestSuiteUncheckedCreateInput) =>
    prisma.testSuite.create({ data }),

  addSuiteItems: (testSuiteId: string, items: Array<{ testCaseId: string; order: number }>) =>
    prisma.$transaction(
      items.map((item) =>
        prisma.testSuiteItem.create({
          data: { testSuiteId, testCaseId: item.testCaseId, order: item.order },
        })
      )
    ),
};