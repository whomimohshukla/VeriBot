import { Request, Response } from 'express';
import { organizationService } from '../../services/organization/organizationService';
import { UnauthorizedError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { created } from '../../utils/formatters';

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError(Messages.AUTH.UNAUTHORIZED);
  }
  const { name, slug, description, website, logo } = req.body as {
    name: string;
    slug?: string;
    description?: string;
    website?: string;
    logo?: string;
  };
  const organization = await organizationService.create({
    name,
    slug,
    description,
    website,
    logo,
    ownerUserId: req.user.id,
  });
  res.status(201).json(created(organization, { message: Messages.ORG.CREATED }));
};
