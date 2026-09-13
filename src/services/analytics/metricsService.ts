import { prisma } from '../../config/database';
import type { Prisma } from '@prisma/client';

export interface TestRunMatrix {
  daily: Array<{ date: string; runs: number; passed: number; failed: number; skipped: number }>;
  totals: { runs: number; passed: number; failed: number; skipped: number; passRate: number };
}

export interface BugMetricsResult {
  totals: { open: number; closed: number; inProgress: number; total: number };
  bySeverity: Record<string, number>;
  avgAgeDays: number;
}

export const metricsService = {
  async getTestMetrics(where: Prisma.TestRunWhereInput, days = 30): Promise<TestRunMatrix> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const runs = await prisma.testRun.findMany({
      where: { ...where, createdAt: { gte: since } },
      select: {
        createdAt: true,
        status: true,
        passedTests: true,
        failedTests: true,
        skippedTests: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyMap = new Map<string, { runs: number; passed: number; failed: number; skipped: number }>();
    for (const run of runs) {
      const key = run.createdAt.toISOString().slice(0, 10);
      const current = dailyMap.get(key) ?? { runs: 0, passed: 0, failed: 0, skipped: 0 };
      current.runs += 1;
      if (run.status === 'PASSED') current.passed += 1;
      if (run.status === 'FAILED') current.failed += 1;
      if (run.status === 'SKIPPED' || run.status === 'CANCELLED') current.skipped += 1;
      dailyMap.set(key, current);
    }

    const daily = Array.from(dailyMap.entries()).map(([date, value]) => ({ date, ...value }));
    const totals = {
      runs: runs.length,
      passed: daily.reduce((sum, d) => sum + d.passed, 0),
      failed: daily.reduce((sum, d) => sum + d.failed, 0),
      skipped: daily.reduce((sum, d) => sum + d.skipped, 0),
      passRate: 0,
    };
    totals.passRate = runs.length > 0 ? round((totals.passed / runs.length) * 100) : 0;

    return { daily, totals };
  },

  async getBugMetrics(projectId: string): Promise<BugMetricsResult> {
    const [open, closed, inProgress, bySeverity, total] = await Promise.all([
      prisma.bug.count({ where: { projectId, status: 'OPEN' } }),
      prisma.bug.count({ where: { projectId, status: { in: ['CLOSED', 'VERIFIED', 'FIXED'] } } }),
      prisma.bug.count({ where: { projectId, status: 'IN_PROGRESS' } }),
      prisma.bug.groupBy({ by: ['severity'], where: { projectId }, _count: true }),
      prisma.bug.count({ where: { projectId } }),
    ]);

    const recently = await prisma.bug.findMany({
      where: { projectId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const avgAgeDays =
      recently.length > 0
        ? Math.round(
            (recently.reduce((sum, bug) => sum + (Date.now() - bug.createdAt.getTime()), 0) / recently.length) /
              (24 * 60 * 60 * 1000) *
              10
          ) / 10
        : 0;

    return {
      totals: { open, closed, inProgress, total },
      bySeverity: Object.fromEntries(bySeverity.map((row) => [row.severity, row._count])),
      avgAgeDays,
    };
  },

  async getAgentMetrics(organizationId: string, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const orgWhere: Prisma.AgentRunWhereInput = { organizationId, createdAt: { gte: since } };
    const [total, completed, failed, byType, cost] = await Promise.all([
      prisma.agentRun.count({ where: orgWhere }),
      prisma.agentRun.count({ where: { ...orgWhere, status: 'COMPLETED' } }),
      prisma.agentRun.count({ where: { ...orgWhere, status: 'FAILED' } }),
      prisma.agentRun.groupBy({ by: ['agentType'], where: orgWhere, _count: true }),
      prisma.aICost.aggregate({
        where: { organizationId, createdAt: { gte: since } },
        _sum: { costUsd: true, tokensUsed: true },
      }),
    ]);

    return {
      totals: { total, completed, failed, successRate: total > 0 ? round((completed / total) * 100) : 0 },
      byType: Object.fromEntries(byType.map((row) => [row.agentType, row._count])),
      cost: { usd: round(cost._sum.costUsd ?? 0), tokensUsed: cost._sum.tokensUsed ?? 0 },
    };
  },
};

const round = (value: number): number => Math.round(value * 100) / 100;