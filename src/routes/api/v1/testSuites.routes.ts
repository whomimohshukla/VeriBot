import { Router } from 'express';
import { createTestSuite } from '../../../controllers/testCases';
import { authenticate, tenantMiddleware, validate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';
import { createTestSuiteSchema } from '../../../validators';

const router = Router();

router.use(authenticate(), tenantMiddleware);

router.post(
  '/',
  requirePermission(Permissions.TEST_CREATE),
  validate(createTestSuiteSchema),
  createTestSuite
);

export default router;
