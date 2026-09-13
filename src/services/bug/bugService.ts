import type { Bug, Prisma } from '@prisma/client';
import { bugRepository } from '../../repositories/bug.repository';
import { NotFoundError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { pagination } from '../../utils/formatters';
import type { ListResponse } from '../../types/api.types';
import type { CreateBugInput } from '../../validators/bug.validator';
import type { DetectedBug } from '../ai/bugDetectionAgent';
import { webhookService } from '../webhook/webhookService';

export const bugService = {
  async create(params: CreateBugInput, organizationId: string, _createdById: string): Promise<Bug> {
    const bug = await bugRepository.create({
      projectId: params.projectId,
      organizationId,
      applicationId: params.applicationId,
      testCaseId: params.testCaseId || undefined,
      title: params.title,
      description: params.description,
      severity: params.severity,
      priority: params.priority,
      status: params.status,
      rootCause: params.rootCause,
      reproductionSteps: params.reproductionSteps
        ? (params.reproductionSteps as unknown as Prisma.InputJsonValue)
        : undefined,
      expectedBehavior: params.expectedBehavior,
      actualBehavior: params.actualBehavior,
    });
    await bugService.dispatchBugCreated(bug);
    return bug;
  },

  async get(bugId: string): Promise<Bug> {
    const bug = await bugRepository.findById(bugId);
    if (!bug) {
      throw new NotFoundError(Messages.BUG.NOT_FOUND);
    }
    return bug;
  },

  async update(bugId: string, params: Prisma.BugUpdateInput): Promise<Bug> {
    await bugService.get(bugId);
    return bugRepository.update(bugId, params);
  },

  async hardDelete(bugId: string): Promise<void> {
    await bugService.get(bugId);
    await bugRepository.hardDelete(bugId);
  },

  async changeStatus(bugId: string, status: Prisma.BugUpdateInput['status']): Promise<Bug> {
    await bugService.get(bugId);
    return bugRepository.changeStatus(bugId, status as Prisma.BugCreateInput['status']);
  },

  async assign(bugId: string, assigneeId: string): Promise<Bug> {
    await bugService.get(bugId);
    return bugRepository.assign(bugId, assigneeId);
  },

  async addComment(bugId: string, userId: string, content: string) {
    await bugService.get(bugId);
    return bugRepository.addComment({
      bugId,
      userId,
      content,
    });
  },

  async list(
    projectId: string,
    page = 1,
    pageSize = 20,
    filters: { status?: string; severity?: string } = {}
  ): Promise<ListResponse<Bug>> {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      bugRepository.list(projectId, skip, pageSize, filters.status, filters.severity),
      bugRepository.count({
        projectId,
        ...(filters.status ? { status: filters.status as Prisma.BugWhereInput['status'] } : {}),
        ...(filters.severity ? { severity: filters.severity as Prisma.BugWhereInput['severity'] } : {}),
      }),
    ]);
    return pagination(items, total, { page, pageSize });
  },

  async createFromDetection(params: {
    projectId: string;
    organizationId: string;
    applicationId?: string;
    testCaseId?: string;
    testRunId: string;
    candidate: DetectedBug;
  }): Promise<Bug> {
    const bug = await bugRepository.create({
      projectId: params.projectId,
      organizationId: params.organizationId,
      applicationId: params.applicationId,
      testCaseId: params.testCaseId || undefined,
      title: params.candidate.title.slice(0, 300),
      description: params.candidate.description,
      severity: params.candidate.severity,
      priority: params.candidate.priority,
      status: 'OPEN',
      rootCause: params.candidate.rootCause,
      reproductionSteps: params.candidate.reproductionSteps as unknown as Prisma.InputJsonValue,
      expectedBehavior: params.candidate.expectedBehavior,
      actualBehavior: params.candidate.actualBehavior,
      metadata: {
        source: 'ai-detection',
        testRunId: params.testRunId,
        confidence: params.candidate.confidence,
      },
    });
    await bugService.dispatchBugCreated(bug);
    return bug;
  },

  async dispatchBugCreated(bug: Bug): Promise<void> {
    await webhookService.dispatch(bug.organizationId, 'BUG_CREATED', {
      bugId: bug.id,
      projectId: bug.projectId,
      applicationId: bug.applicationId,
      testCaseId: bug.testCaseId,
      title: bug.title,
      severity: bug.severity,
      priority: bug.priority,
      status: bug.status,
    });
  },
};
