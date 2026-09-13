import { prisma } from '../../config/database';
import { getRedis } from '../../config/redis';

export interface UsageIncrement {
  testsRun?: number;
  browserMinutes?: number;
  aiTokensUsed?: number;
  apiRequests?: number;
  screenshotsGenerated?: number;
  videosGenerated?: number;
  storageUsedGB?: number;
  agentRunsExecuted?: number;
  estimatedCostUsd?: number;
}

const CURRENT_MONTH = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
};

export const usageService = {
  async increment(organizationId: string, fields: UsageIncrement): Promise<void> {
    const month = CURRENT_MONTH();
    await prisma.$executeRaw`
      INSERT INTO "Usage" ("id", "organizationId", "month", "testsRun", "browserMinutes", "aiTokensUsed",
        "apiRequests", "screenshotsGenerated", "videosGenerated", "storageUsedGB", "agentRunsExecuted",
        "estimatedCostUsd", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${organizationId}, ${month}, ${fields.testsRun ?? 0}, ${fields.browserMinutes ?? 0},
        ${fields.aiTokensUsed ?? 0}, ${fields.apiRequests ?? 0}, ${fields.screenshotsGenerated ?? 0},
        ${fields.videosGenerated ?? 0}, ${fields.storageUsedGB ?? 0}, ${fields.agentRunsExecuted ?? 0},
        ${fields.estimatedCostUsd ?? 0}, NOW(), NOW())
      ON CONFLICT ("organizationId", "month")
      DO UPDATE SET
        "testsRun" = "Usage"."testsRun" + ${fields.testsRun ?? 0},
        "browserMinutes" = "Usage"."browserMinutes" + ${fields.browserMinutes ?? 0},
        "aiTokensUsed" = "Usage"."aiTokensUsed" + ${fields.aiTokensUsed ?? 0},
        "apiRequests" = "Usage"."apiRequests" + ${fields.apiRequests ?? 0},
        "screenshotsGenerated" = "Usage"."screenshotsGenerated" + ${fields.screenshotsGenerated ?? 0},
        "videosGenerated" = "Usage"."videosGenerated" + ${fields.videosGenerated ?? 0},
        "storageUsedGB" = "Usage"."storageUsedGB" + ${fields.storageUsedGB ?? 0},
        "agentRunsExecuted" = "Usage"."agentRunsExecuted" + ${fields.agentRunsExecuted ?? 0},
        "estimatedCostUsd" = "Usage"."estimatedCostUsd" + ${fields.estimatedCostUsd ?? 0},
        "updatedAt" = NOW()
    `;
    try {
      const redis = getRedis();
      await redis.del(`cache:usage:${organizationId}`);
    } catch {
      return;
    }
  },

  async getForOrg(organizationId: string, month?: Date) {
    const target = month ?? CURRENT_MONTH();
    const usage = await prisma.usage.findUnique({
      where: { organizationId_month: { organizationId, month: target } },
    });
    return usage;
  },

  async getHistory(organizationId: string, months = 6) {
    const start = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - months + 1, 1));
    return prisma.usage.findMany({
      where: { organizationId, month: { gte: start } },
      orderBy: { month: 'desc' },
    });
  },
};
