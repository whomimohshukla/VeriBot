import { Router } from 'express';
import { createApiKey, listApiKeys, revokeApiKey } from '../../../controllers/apiKeys';
import { authenticate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';

const router = Router();

router.use(authenticate());

router.post('/', requirePermission(Permissions.API_KEY_MANAGE), createApiKey);
router.get('/', requirePermission(Permissions.API_KEY_MANAGE), listApiKeys);
router.delete('/:apiKeyId', requirePermission(Permissions.API_KEY_MANAGE), revokeApiKey);

export default router;