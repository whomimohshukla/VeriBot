import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const bugRepository = {
  findById: (id: string) =>
    prisma.bug.findUnique({
      where: { id },
      include: {
        comments: { include: { user: true } },
        testResults: true,
        attachments: true,
      },
    }),

  create: (data: Prisma.BugUncheckedCreateInput) => prisma.bug.create({ data }),

  update: (id: string, data: Prisma.BugUncheckedUpdateInput) => prisma.bug.update({ where: { id }, data }),

  hardDelete: (id: string) => prisma.bug.delete({ where: { id } }),

  changeStatus: (id: string, status: Prisma.BugUpdateInput['status']) =>
    prisma.bug.update({
      where: { id },
      data: {
        status,
        closedAt: status === 'CLOSED' || status === 'VERIFIED' || status === 'REJECTED' ? new Date() : null,
      },
    }),

  assign: (id: string, assigneeId: string) => prisma.bug.update({ where: { id }, data: { assigneeId } }),

  addComment: (data: Prisma.BugCommentUncheckedCreateInput) => prisma.bugComment.create({ data }),

  listComments: (bugId: string, skip = 0, take = 50) =>
    prisma.bugComment.findMany({
      where: { bugId },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, email: true, name: true } } },
    }),

  countComments: (bugId: string) => prisma.bugComment.count({ where: { bugId } }),

  list: (projectId: string, skip = 0, take = 20, status?: string, severity?: string) =>
    prisma.bug.findMany({
      where: {
        projectId,
        ...(status ? { status: status as Prisma.BugWhereInput['status'] } : {}),
        ...(severity ? { severity: severity as Prisma.BugWhereInput['severity'] } : {}),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),

  count: (where: Prisma.BugWhereInput = {}) => prisma.bug.count({ where }),
};
