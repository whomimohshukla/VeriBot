import { Router } from 'express';
import {
  listTestSuites,
  getTestSuite,
  updateTestSuite,
  deleteTestSuite,
  addSuiteItem,
  removeSuiteItem,
  runTestSuite,
} from '../../../controllers/testSuites';
import { createTestSuite } from '../../../controllers/testCases';
import { authenticate, tenantMiddleware, validate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';
import {
  createTestSuiteSchema,
  listTestSuitesQuerySchema,
  updateTestSuiteSchema,
  addSuiteItemSchema,
  suiteItemParamsSchema,
  testSuiteParamsSchema,
  runTestSuiteSchema,
} from '../../../validators';

const router = Router();

router.use(authenticate(), tenantMiddleware);

router.post(
  '/',
  requirePermission(Permissions.TEST_CREATE),
  validate(createTestSuiteSchema),
  createTestSuite
);
router.get(
  '/',
  requirePermission(Permissions.TEST_READ),
  validate(listTestSuitesQuerySchema, 'query'),
  listTestSuites
);
router.get(
  '/:testSuiteId',
  requirePermission(Permissions.TEST_READ),
  validate(testSuiteParamsSchema, 'params'),
  getTestSuite
);
router.patch(
  '/:testSuiteId',
  requirePermission(Permissions.TEST_UPDATE),
  validate(testSuiteParamsSchema, 'params'),
  validate(updateTestSuiteSchema),
  updateTestSuite
);
router.delete(
  '/:testSuiteId',
  requirePermission(Permissions.TEST_DELETE),
  validate(testSuiteParamsSchema, 'params'),
  deleteTestSuite
);
router.post(
  '/:testSuiteId/run',
  requirePermission(Permissions.TEST_EXECUTE),
  validate(testSuiteParamsSchema, 'params'),
  validate(runTestSuiteSchema),
  runTestSuite
);
router.post(
  '/:testSuiteId/items',
  requirePermission(Permissions.TEST_UPDATE),
  validate(testSuiteParamsSchema, 'params'),
  validate(addSuiteItemSchema),
  addSuiteItem
);
router.delete(
  '/:testSuiteId/items/:suiteItemId',
  requirePermission(Permissions.TEST_UPDATE),
  validate(suiteItemParamsSchema, 'params'),
  removeSuiteItem
);

export default router;
