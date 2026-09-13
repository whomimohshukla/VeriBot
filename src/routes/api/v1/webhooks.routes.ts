import { Router } from 'express';
import {
  createWebhook,
  getWebhook,
  updateWebhook,
  deleteWebhook,
  listWebhooks,
  testWebhook,
} from '../../../controllers/webhooks';
import { authenticate, tenantMiddleware, validate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';
import { createWebhookSchema, updateWebhookSchema, webhookParamsSchema } from '../../../validators';

const router = Router();

router.use(authenticate(), tenantMiddleware);

router.post('/', requirePermission(Permissions.WEBHOOK_MANAGE), validate(createWebhookSchema), createWebhook);
router.get('/', requirePermission(Permissions.WEBHOOK_READ), listWebhooks);
router.get(
  '/:webhookId',
  requirePermission(Permissions.WEBHOOK_READ),
  validate(webhookParamsSchema, 'params'),
  getWebhook
);
router.patch(
  '/:webhookId',
  requirePermission(Permissions.WEBHOOK_MANAGE),
  validate(webhookParamsSchema, 'params'),
  validate(updateWebhookSchema),
  updateWebhook
);
router.delete(
  '/:webhookId',
  requirePermission(Permissions.WEBHOOK_MANAGE),
  validate(webhookParamsSchema, 'params'),
  deleteWebhook
);
router.post(
  '/:webhookId/test',
  requirePermission(Permissions.WEBHOOK_MANAGE),
  validate(webhookParamsSchema, 'params'),
  testWebhook
);

export default router;
