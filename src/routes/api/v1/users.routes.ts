import { Router } from 'express';
import { getProfile, updateProfile, deleteAccount } from '../../../controllers/users';
import { changePassword } from '../../../controllers/auth';
import { authenticate, validate } from '../../../middleware';
import { changePasswordSchema } from '../../../validators';

const router = Router();

router.use(authenticate());

router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.post('/me/change-password', validate(changePasswordSchema), changePassword);
router.delete('/me', deleteAccount);

export default router;