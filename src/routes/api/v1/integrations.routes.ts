import { Router } from 'express';
import {
  connectIntegration,
  getIntegration,
  disconnectIntegration,
  listIntegrations,
  testIntegration,
} from '../../../controllers/integrations';
import { authenticate, tenantMiddleware, validate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';
import { connectIntegrationSchema, integrationParamsSchema } from '../../../validators';

const router = Router();

router.use(authenticate(), tenantMiddleware);

router.post(
  '/',
  requirePermission(Permissions.INTEGRATION_MANAGE),
  validate(connectIntegrationSchema),
  connectIntegration
);
router.get('/', requirePermission(Permissions.INTEGRATION_READ), listIntegrations);
router.get(
  '/:integrationId',
  requirePermission(Permissions.INTEGRATION_READ),
  validate(integrationParamsSchema, 'params'),
  getIntegration
);
router.delete(
  '/:integrationId',
  requirePermission(Permissions.INTEGRATION_MANAGE),
  validate(integrationParamsSchema, 'params'),
  disconnectIntegration
);
router.post(
  '/:integrationId/test',
  requirePermission(Permissions.INTEGRATION_MANAGE),
  validate(integrationParamsSchema, 'params'),
  testIntegration
);

export default router;
