import { Request, Response } from 'express';
import { userService } from '../../services/user/userService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const profile = await userService.getProfile(req.user.id);
  res.status(200).json(ok(profile));
};