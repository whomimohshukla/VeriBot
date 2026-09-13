import { Request, Response } from 'express';
import { tokenService } from '../../services/auth/tokenService';
import { userRepository } from '../../repositories/user.repository';
import { passwordService } from '../../services/auth/passwordService';
import { signToken, verifyToken } from '../../utils/jwt';
import { ok } from '../../utils/formatters';
import { NotFoundError } from '../../utils/errors';
import { Messages } from '../../constants/messages';

export const requestResetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };
  const user = await userRepository.findActiveByEmail(email);
  if (user) {
    const token = signToken({ sub: user.id, orgId: '', roles: [], type: 'access' }, 'access');
    const url = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password?token=${token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[email:dev] password reset link for ${email}: ${url}`);
    }
  }
  res.status(200).json(ok(null, { message: Messages.AUTH.RESET_EMAIL_SENT }));
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body as { token: string; password: string };
  const payload = verifyToken(token, 'access');
  const user = await userRepository.findActiveById(payload.sub);
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  const passwordHash = await passwordService.hash(password);
  await userRepository.update(user.id, { passwordHash });
  await tokenService.revokeAllForUser(user.id);
  res.status(200).json(ok(null, { message: Messages.AUTH.PASSWORD_RESET }));
};