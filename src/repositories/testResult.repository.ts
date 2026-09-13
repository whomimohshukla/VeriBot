import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const testResultRepository = {
  findById: (id: string) =>
    prisma.testResult.findUnique({
      where: { id },
      include: { testCase: true },
    }),

  findByRunAndCase: (testRunId: string, testCaseId: string) =>
    prisma.testResult.findUnique({
      where: { testRunId_testCaseId: { testRunId, testCaseId } },
      include: { testCase: true },
    }),

  upsert: (
    testRunId: string,
    testCaseId: string,
    data: Omit<Prisma.TestResultUncheckedCreateInput, 'testRunId' | 'testCaseId'>
  ) =>
    prisma.testResult.upsert({
      where: { testRunId_testCaseId: { testRunId, testCaseId } },
      create: { ...data, testRunId, testCaseId },
      update: { ...data },
    }),

  update: (id: string, data: Prisma.TestResultUncheckedUpdateInput) =>
    prisma.testResult.update({ where: { id }, data }),

  create: (data: Prisma.TestResultUncheckedCreateInput) => prisma.testResult.create({ data }),

  listByRun: (testRunId: string) =>
    prisma.testResult.findMany({
      where: { testRunId },
      include: { testCase: true },
      orderBy: { createdAt: 'asc' },
    }),

  updateBug: (testRunId: string, testCaseId: string, bugId: string | null) =>
    prisma.testResult.update({
      where: { testRunId_testCaseId: { testRunId, testCaseId } },
      data: { bugId },
    }),
};
