import { Router, raw } from 'express';
import {
  getSubscription,
  updateSubscriptionPlan,
  getUsage,
  billingWebhook,
} from '../../../controllers/billing';
import { authenticate, tenantMiddleware, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';

const router = Router();

router.post('/webhooks/stripe', raw({ type: 'application/json' }), billingWebhook);

router.use(authenticate(), tenantMiddleware);

router.get('/subscription', getSubscription);
router.patch('/subscription', requirePermission(Permissions.BILLING_MANAGE), updateSubscriptionPlan);
router.get('/usage', getUsage);

export default router;