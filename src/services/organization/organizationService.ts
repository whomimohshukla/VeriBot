import type { MembershipRole, Organization, Membership } from '@prisma/client';
import { organizationRepository } from '../../repositories/organization.repository';
import { userRepository } from '../../repositories/user.repository';
import { NotFoundError, ConflictError, ForbiddenError } from '../../utils/errors';
import { Messages } from '../../constants/messages';
import { canManageRole } from '../../constants/roles';
import { toSlug } from '../../utils/helpers';
import { logger } from '../../config/logger';

export interface CreateOrganizationParams {
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  logo?: string;
  ownerUserId: string;
}

export interface UpdateOrganizationParams {
  name?: string;
  description?: string;
  website?: string;
  logo?: string;
}

export interface InviteMemberParams {
  organizationId: string;
  email: string;
  role: MembershipRole;
  invitedByUserId: string;
}

export const organizationService = {
  async create(params: CreateOrganizationParams): Promise<Organization> {
    let slug = params.slug ?? toSlug(params.name);
    if (!slug) slug = `org-${params.ownerUserId.slice(0, 8)}`;
    let uniqueSlug = slug;
    for (let i = 1; i < 20; i++) {
      const existing = await organizationRepository.findBySlug(uniqueSlug);
      if (!existing) break;
      uniqueSlug = `${slug}-${i}`;
    }

    const organization = await organizationRepository.create({
      name: params.name,
      slug: uniqueSlug,
      description: params.description,
      website: params.website,
      logo: params.logo,
    });

    await organizationRepository.addMember({
      organizationId: organization.id,
      userId: params.ownerUserId,
      role: 'OWNER',
    });

    logger.info({ organizationId: organization.id }, 'organization created');
    return organization;
  },

  async get(organizationId: string): Promise<Organization> {
    const organization = await organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError(Messages.ORG.NOT_FOUND);
    }
    return organization;
  },

  async update(organizationId: string, params: UpdateOrganizationParams): Promise<Organization> {
    const existing = await organizationRepository.findById(organizationId);
    if (!existing) {
      throw new NotFoundError(Messages.ORG.NOT_FOUND);
    }
    return organizationRepository.update(organizationId, {
      name: params.name ?? undefined,
      description: params.description ?? undefined,
      website: params.website ?? undefined,
      logo: params.logo ?? undefined,
    });
  },

  async softDelete(organizationId: string): Promise<void> {
    const existing = await organizationRepository.findById(organizationId);
    if (!existing) {
      throw new NotFoundError(Messages.ORG.NOT_FOUND);
    }
    await organizationRepository.softDelete(organizationId);
  },

  async listMembers(organizationId: string) {
    return organizationRepository.listMembers(organizationId);
  },

  async inviteMember(params: InviteMemberParams): Promise<Membership> {
    const organization = await organizationRepository.findById(params.organizationId);
    if (!organization) {
      throw new NotFoundError(Messages.ORG.NOT_FOUND);
    }

    const actor = await organizationRepository.findMembership(params.organizationId, params.invitedByUserId);
    if (!actor) {
      throw new ForbiddenError(Messages.ORG.MEMBER_NOT_FOUND);
    }
    if (!canManageRole(actor.role, params.role)) {
      throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
    }

    let user;
    const existingUser = await userRepository.findActiveByEmail(params.email);
    if (existingUser) {
      user = existingUser;
    } else {
      user = await userRepository.create({ email: params.email });
    }

    const membership = await organizationRepository.findMembership(params.organizationId, user.id);
    if (membership) {
      throw new ConflictError(Messages.ORG.MEMBER_NOT_FOUND);
    }

    return organizationRepository.addMember({
      organizationId: params.organizationId,
      userId: user.id,
      role: params.role,
    });
  },

  async removeMember(organizationId: string, targetUserId: string, actorUserId: string): Promise<void> {
    const targetMembership = await organizationRepository.findMembership(organizationId, targetUserId);
    if (!targetMembership) {
      throw new NotFoundError(Messages.ORG.MEMBER_NOT_FOUND);
    }

    const actorMembership = await organizationRepository.findMembership(organizationId, actorUserId);
    if (!actorMembership) {
      throw new ForbiddenError(Messages.ORG.MEMBER_NOT_FOUND);
    }
    if (!canManageRole(actorMembership.role, targetMembership.role)) {
      throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
    }
    if (targetMembership.role === 'OWNER' && targetUserId !== actorUserId) {
      throw new ForbiddenError(Messages.ORG.LAST_OWNER);
    }

    if (targetMembership.role === 'OWNER') {
      const ownerCount = await organizationRepository.countOwners(organizationId);
      if (ownerCount <= 1) {
        throw new ConflictError(Messages.ORG.LAST_OWNER);
      }
    }

    await organizationRepository.softDeleteMember(targetMembership.id);
  },

  async changeMemberRole(
    organizationId: string,
    targetUserId: string,
    newRole: MembershipRole,
    actorUserId: string
  ): Promise<void> {
    const targetMembership = await organizationRepository.findMembership(organizationId, targetUserId);
    if (!targetMembership) {
      throw new NotFoundError(Messages.ORG.MEMBER_NOT_FOUND);
    }

    const actorMembership = await organizationRepository.findMembership(organizationId, actorUserId);
    if (!actorMembership) {
      throw new ForbiddenError(Messages.ORG.MEMBER_NOT_FOUND);
    }
    if (
      !canManageRole(actorMembership.role, targetMembership.role) ||
      !canManageRole(actorMembership.role, newRole)
    ) {
      throw new ForbiddenError(Messages.AUTH.FORBIDDEN);
    }

    if (targetMembership.role === 'OWNER' && newRole !== 'OWNER') {
      const ownerCount = await organizationRepository.countOwners(organizationId);
      if (ownerCount <= 1) {
        throw new ConflictError(Messages.ORG.LAST_OWNER);
      }
    }

    await organizationRepository.updateMemberRole(targetMembership.id, newRole);
  },

  async listForUser(userId: string): Promise<Array<{ organization: Organization; role: MembershipRole }>> {
    const memberships = await organizationRepository.listMembershipsForUser(userId);
    return memberships.map((membership) => ({
      organization: membership.organization,
      role: membership.role,
    }));
  },
};
