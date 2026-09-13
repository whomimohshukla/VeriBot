import { Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';
import { reportService } from '../../services/analytics/reportService';
import { prisma } from '../../config/database';

export const generateReport = async (req: Request, res: Response): Promise<void> => {
  if (!req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { testRunId, testSuiteId } = req.body as { testRunId?: string; testSuiteId?: string };
  const projectId = (req.query.projectId ?? req.body.projectId) as string | undefined;

  if (!projectId) {
    const testRun = testRunId ? await prisma.testRun.findUnique({ where: { id: testRunId } }) : null;
    if (!testRun) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'projectId or testRunId is required.' },
      });
      return;
    }
    const project = await prisma.project.findUnique({ where: { id: testRun.projectId } });
    if (!project || project.organizationId !== req.orgId) {
      res
        .status(403)
        .json({ success: false, error: { code: 'FORBIDDEN', message: Messages.AUTH.FORBIDDEN } });
      return;
    }
    const start = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
    const result = await reportService.generate({
      organizationId: req.orgId,
      projectId: testRun.projectId,
      testRunId,
      periodStart: start.toISOString(),
      periodEnd: new Date().toISOString(),
    });
    res.status(200).json(ok(result, { message: Messages.REPORT.GENERATED }));
    return;
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.organizationId !== req.orgId) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: Messages.AUTH.FORBIDDEN } });
    return;
  }

  const start = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const report = await reportService.generate({
    organizationId: req.orgId,
    projectId,
    testRunId,
    periodStart: start.toISOString(),
    periodEnd: new Date().toISOString(),
  });
  void testSuiteId;
  res.status(200).json(ok(report, { message: Messages.REPORT.GENERATED }));
};
