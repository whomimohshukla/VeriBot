import { Request, Response } from 'express';
import { userService } from '../../services/user/userService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { ok } from '../../utils/formatters';

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { name, avatar } = req.body as { name?: string; avatar?: string };
  const profile = await userService.updateProfile(req.user.id, { name, avatar });
  res.status(200).json(ok(profile));
};