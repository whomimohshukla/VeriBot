import { prisma } from '../../config/database';
import { cacheService } from '../cache/cacheService';

export interface QualityScoreParams {
  projectId: string;
}

export interface QualityScore {
  score: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  components: {
    passRate: number;
    testCoverage: number;
    bugBurden: number;
    flakiness: number;
  };
}

export const analyticsService = {
  async qualityScore(params: QualityScoreParams): Promise<QualityScore> {
    return cacheService.remember(
      `analytics:quality:${params.projectId}`,
      async () => {
        const [totalRuns, passedRuns, openBugs, totalBugs, runs, resultStats] = await Promise.all([
          prisma.testRun.count({ where: { projectId: params.projectId } }),
          prisma.testRun.count({ where: { projectId: params.projectId, status: 'PASSED' } }),
          prisma.bug.count({ where: { projectId: params.projectId, status: { not: 'CLOSED' } } }),
          prisma.bug.count({ where: { projectId: params.projectId } }),
          prisma.testRun.findMany({
            where: { projectId: params.projectId },
            orderBy: { createdAt: 'desc' },
            take: 30,
          }),
          prisma.testResult.aggregate({
            where: { testRun: { projectId: params.projectId } },
            _count: true,
          }),
        ]);

        const passRate = totalRuns > 0 ? passedRuns / totalRuns : 0;
        const bugBurden = totalBugs > 0 ? Math.min(1, openBugs / totalBugs) : 0;
        const flakiness = runs.length >= 5 ? estimateFlakiness(runs) : 0;

        const testCoverage =
          resultStats._count > 0
            ? Math.min(1, (passedRuns / Math.max(1, totalRuns)) * (runs.length / 30))
            : 0;

        const score = Math.round(
          passRate * 40 + (1 - bugBurden) * 25 + (1 - flakiness) * 20 + testCoverage * 15
        );

        return {
          score,
          level: score >= 80 ? 'LOW' : score >= 65 ? 'MEDIUM' : score >= 45 ? 'HIGH' : 'CRITICAL',
          components: {
            passRate: round(passRate * 100),
            testCoverage: round(testCoverage * 100),
            bugBurden: round(bugBurden * 100),
            flakiness: round(flakiness * 100),
          },
        };
      },
      60
    );
  },

  async releaseRisk(params: QualityScoreParams): Promise<{
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    details: Record<string, number>;
  }> {
    const quality = await analyticsService.qualityScore(params);
    const [openCriticalBugs, recentRuns] = await Promise.all([
      prisma.bug.count({
        where: {
          projectId: params.projectId,
          status: { not: 'CLOSED' },
          severity: { in: ['CRITICAL', 'HIGH'] },
        },
      }),
      prisma.testRun.findMany({
        where: { projectId: params.projectId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const failureRate =
      recentRuns.length > 0
        ? recentRuns.filter((run) => run.status === 'FAILED').length / recentRuns.length
        : 0;
    const riskScore = Math.round(
      (100 - quality.score) * 0.5 +
        (100 - quality.components.passRate) * 0.2 +
        openCriticalBugs * 5 +
        failureRate * 100 * 0.3
    );
    const clamped = Math.min(100, Math.max(0, riskScore));

    return {
      riskScore: clamped,
      riskLevel: clamped >= 75 ? 'CRITICAL' : clamped >= 55 ? 'HIGH' : clamped >= 35 ? 'MEDIUM' : 'LOW',
      details: {
        openCriticalBugs,
        failureRate: round(failureRate * 100),
        qualityScore: quality.score,
      },
    };
  },

  async getDashboardAnalytics(organizationId: string, projectId?: string): Promise<unknown> {
    const [projects, recentRuns, openBugs, totalCases] = await Promise.all([
      prisma.project.findMany({
        where: { organizationId, archivedAt: null, ...(projectId ? { id: projectId } : {}) },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.testRun.findMany({
        where: { ...(projectId ? { projectId } : { project: { organizationId } }) },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { project: { select: { id: true, name: true } } },
      }),
      prisma.bug.count({
        where: {
          ...(projectId ? { projectId } : { project: { organizationId } }),
          status: { not: 'CLOSED' },
        },
      }),
      prisma.testCase.count({
        where: { ...(projectId ? { projectId } : { project: { organizationId } }), archivedAt: null },
      }),
    ]);

    const quality = projectId ? await analyticsService.qualityScore({ projectId }) : null;
    const risk = projectId ? await analyticsService.releaseRisk({ projectId }) : null;

    return {
      projects,
      recentRuns,
      openBugs,
      totalCases,
      quality,
      risk,
    };
  },
};

const round = (value: number): number => Math.round(value * 100) / 100;

const estimateFlakiness = (
  runs: Array<{ passedTests: number; failedTests: number; totalTests: number }>
): number => {
  const runsWithResults = runs.filter((run) => run.totalTests > 0);
  if (runsWithResults.length === 0) return 0;
  const inconsistent = runsWithResults.filter((run) => run.passedTests > 0 && run.failedTests > 0).length;
  return inconsistent / runsWithResults.length;
};
