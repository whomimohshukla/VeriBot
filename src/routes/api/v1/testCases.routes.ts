import { Router } from 'express';
import {
  createTestCase,
  getTestCase,
  updateTestCase,
  deleteTestCase,
  listTestCases,
  duplicateTestCase,
  archiveTestCase,
} from '../../../controllers/testCases';
import { authenticate, tenantMiddleware, validate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';
import {
  createTestCaseSchema,
  updateTestCaseSchema,
  testCaseParamsSchema,
  listTestCasesQuerySchema,
  generateTestsSchema,
} from '../../../validators';
import { testCaseService } from '../../../services/test/testCaseService';
import { ok } from '../../../utils/formatters';
import { UnauthorizedError, ForbiddenError } from '../../../utils/errors';
import { Messages } from '../../../constants/messages';
import { prisma } from '../../../config/database';
import type { Request, Response } from 'express';

const router = Router();

router.use(authenticate(), tenantMiddleware);

const generateTests = async (req: Request, res: Response): Promise<void> => {
  if (!req.user || !req.orgId) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { applicationId, projectId, requirements, types, count } = req.body as {
    applicationId: string;
    projectId: string;
    requirements?: string;
    types?: string[];
    count?: number;
  };
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project || project.organizationId !== req.orgId) {
    throw new ForbiddenError(Messages.PROJECT.NOT_FOUND);
  }
  const result = await testCaseService.generate({
    applicationId,
    projectId,
    organizationId: req.orgId,
    requirements,
    types,
    count,
    triggeredById: req.user.id,
  });
  res.status(200).json(ok(result, { message: Messages.TEST.CREATED }));
};

router.post('/', requirePermission(Permissions.TEST_CREATE), validate(createTestCaseSchema), createTestCase);
router.get(
  '/',
  requirePermission(Permissions.TEST_READ),
  validate(listTestCasesQuerySchema, 'query'),
  listTestCases
);
router.post(
  '/generate',
  requirePermission(Permissions.TEST_CREATE),
  validate(generateTestsSchema),
  generateTests
);
router.get(
  '/:testCaseId',
  requirePermission(Permissions.TEST_READ),
  validate(testCaseParamsSchema, 'params'),
  getTestCase
);
router.patch(
  '/:testCaseId',
  requirePermission(Permissions.TEST_UPDATE),
  validate(testCaseParamsSchema, 'params'),
  validate(updateTestCaseSchema),
  updateTestCase
);
router.delete(
  '/:testCaseId',
  requirePermission(Permissions.TEST_DELETE),
  validate(testCaseParamsSchema, 'params'),
  deleteTestCase
);
router.post(
  '/:testCaseId/duplicate',
  requirePermission(Permissions.TEST_CREATE),
  validate(testCaseParamsSchema, 'params'),
  duplicateTestCase
);
router.patch(
  '/:testCaseId/archive',
  requirePermission(Permissions.TEST_UPDATE),
  validate(testCaseParamsSchema, 'params'),
  archiveTestCase
);

export default router;
