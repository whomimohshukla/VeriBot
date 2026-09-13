import { Request, Response } from 'express';
import { organizationService } from '../../services/organization/organizationService';
import { ok } from '../../utils/formatters';
import { Messages } from '../../constants/messages';

export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  const { organizationId } = req.params as { organizationId: string };
  const { name, description, website, logo } = req.body as {
    name?: string;
    description?: string;
    website?: string;
    logo?: string;
  };
  const organization = await organizationService.update(organizationId, {
    name,
    description,
    website,
    logo,
  });
  res.status(200).json(ok(organization, { message: Messages.ORG.UPDATED }));
};
