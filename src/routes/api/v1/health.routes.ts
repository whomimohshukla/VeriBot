import { Router } from 'express';
import { health } from '../../../controllers/health';
import { apiRateLimiter } from '../../../middleware';

const router = Router();

router.get('/', apiRateLimiter, health);
router.get('/live', apiRateLimiter, health);
router.get('/ready', apiRateLimiter, health);

export default router;
