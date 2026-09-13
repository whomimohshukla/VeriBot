import { Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export const agentRunRepository = {
  findById: (id: string) =>
    prisma.agentRun.findUnique({
      where: { id },
      include: { messages: true, toolCalls_rel: true, aiTraces: true },
    }),

  create: (data: Prisma.AgentRunUncheckedCreateInput) =>
    prisma.agentRun.create({ data }),

  update: (id: string, data: Prisma.AgentRunUncheckedUpdateInput) =>
    prisma.agentRun.update({ where: { id }, data }),

  list: (skip = 0, take = 20, where: Prisma.AgentRunWhereInput = {}) =>
    prisma.agentRun.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),

  count: (where: Prisma.AgentRunWhereInput = {}) =>
    prisma.agentRun.count({ where }),

  addMessage: (data: Prisma.AgentMessageUncheckedCreateInput) =>
    prisma.agentMessage.create({ data }),

  addToolCall: (data: Prisma.AgentToolCallUncheckedCreateInput) =>
    prisma.agentToolCall.create({ data }),

  addTrace: (data: Prisma.AITraceUncheckedCreateInput) =>
    prisma.aITrace.create({ data }),
};