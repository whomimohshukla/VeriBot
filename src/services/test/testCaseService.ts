import type { TestCase, TestSuite, Prisma } from '@prisma/client';
import { testCaseRepository } from '../../repositories/testCase.repository';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { pagination } from '../../utils/formatters';
import type { ListResponse } from '../../types/api.types';
import type { CreateTestCaseInput } from '../../validators/testCase.validator';
import { aiQueue } from '../../queues/aiQueue';

export interface CreateSuiteParams {
  projectId: string;
  name: string;
  description?: string;
  type?: string;
  testCaseIds: string[];
}

export interface GenerateTestsParams {
  applicationId: string;
  projectId: string;
  organizationId: string;
  requirements?: string;
  types?: string[];
  count?: number;
  triggeredById: string;
}

export const testCaseService = {
  async create(params: CreateTestCaseInput & { projectId: string }): Promise<TestCase> {
    return testCaseRepository.create({
      projectId: params.projectId,
      applicationId: params.applicationId,
      workflowId: params.workflowId,
      title: params.title,
      description: params.description,
      type: params.type,
      priority: params.priority,
      status: 'draft',
      steps: params.steps as unknown as Prisma.InputJsonValue,
      expectedResult: params.expectedResult,
      tags: params.tags,
    });
  },

  async get(testCaseId: string): Promise<TestCase> {
    const testCase = await testCaseRepository.findById(testCaseId);
    if (!testCase) {
      throw new NotFoundError(Messages.TEST.NOT_FOUND);
    }
    return testCase;
  },

  async update(testCaseId: string, params: Record<string, unknown>): Promise<TestCase> {
    const existing = await testCaseRepository.findById(testCaseId);
    if (!existing) {
      throw new NotFoundError(Messages.TEST.NOT_FOUND);
    }
    const data: Prisma.TestCaseUpdateInput = {};
    if (params.title !== undefined) data.title = params.title as string;
    if (params.description !== undefined) data.description = params.description as string;
    if (params.type !== undefined) data.type = params.type as TestCase['type'];
    if (params.priority !== undefined) data.priority = params.priority as string;
    if (params.status !== undefined) data.status = params.status as string;
    if (params.expectedResult !== undefined) data.expectedResult = params.expectedResult as string;
    if (params.tags !== undefined) data.tags = params.tags as string[];
    if (params.steps !== undefined) data.steps = params.steps as Prisma.InputJsonValue;
    return testCaseRepository.update(testCaseId, data);
  },

  async hardDelete(testCaseId: string): Promise<void> {
    await testCaseService.get(testCaseId);
    await testCaseRepository.hardDelete(testCaseId);
  },

  async archive(testCaseId: string): Promise<TestCase> {
    await testCaseService.get(testCaseId);
    return testCaseRepository.archive(testCaseId);
  },

  async duplicate(testCaseId: string): Promise<TestCase> {
    const original = await testCaseService.get(testCaseId);
    return testCaseRepository.create({
      projectId: original.projectId,
      applicationId: original.applicationId,
      workflowId: original.workflowId,
      title: `${original.title} (copy)`,
      description: original.description,
      type: original.type,
      priority: original.priority,
      status: 'draft',
      steps: original.steps as unknown as Prisma.InputJsonValue,
      expectedResult: original.expectedResult,
      tags: original.tags,
    });
  },

  async list(where: Prisma.TestCaseWhereInput, page = 1, pageSize = 20): Promise<ListResponse<TestCase>> {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      testCaseRepository.list(where, skip, pageSize),
      testCaseRepository.count(where),
    ]);
    return pagination(items, total, { page, pageSize });
  },

  async createSuite(params: CreateSuiteParams): Promise<TestSuite> {
    if (params.testCaseIds.length === 0) {
      throw new BadRequestError('Select at least one test case for the suite.');
    }
    const tests = await testCaseRepository.listByIds(params.testCaseIds);
    if (tests.length !== params.testCaseIds.length) {
      throw new BadRequestError('One or more test cases do not exist.');
    }

    const suite = await testCaseRepository.createSuite({
      projectId: params.projectId,
      name: params.name,
      description: params.description,
      type: params.type ?? 'custom',
    });

    await testCaseRepository.addSuiteItems(
      suite.id,
      params.testCaseIds.map((testCaseId, index) => ({ testCaseId, order: index }))
    );

    return suite;
  },

  async generate(params: GenerateTestsParams): Promise<{ queued: boolean }> {
    await aiQueue.add('generate-tests', {
      applicationId: params.applicationId,
      projectId: params.projectId,
      organizationId: params.organizationId,
      requirements: params.requirements,
      types: params.types,
      count: params.count,
    });
    void params.triggeredById;
    return { queued: true };
  },
};
