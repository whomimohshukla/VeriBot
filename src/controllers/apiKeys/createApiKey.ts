import { Request, Response } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';
import { prisma } from '../../config/database';
import { tokenService } from '../../services/auth/tokenService';

export const createApiKey = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { name, expiresAt } = req.body as { name: string; expiresAt?: string };
  const plainKey = tokenService.generateApiKey();
  const hash = await tokenService.hashApiKey(plainKey);

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: req.user.id,
      name,
      key: hash,
      prefix: plainKey.slice(0, 8),
      lastUsedAt: null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });

  res.status(201).json(created({ ...apiKey, plainKey }, { message: Messages.API_KEY.CREATED }));
};