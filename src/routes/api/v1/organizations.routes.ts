import { Router } from 'express';
import {
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  inviteMember,
  removeMember,
  changeMemberRole,
  listMembers,
} from '../../../controllers/organizations';
import { authenticate, validate, requirePermission } from '../../../middleware';
import { Permissions } from '../../../constants/permissions';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationParamsSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  memberParamsSchema,
} from '../../../validators';

const router = Router();

router.use(authenticate());

router.post('/', validate(createOrganizationSchema), createOrganization);
router.get('/:organizationId', validate(getOrganizationParamsSchema, 'params'), getOrganization);
router.patch('/:organizationId', requirePermission(Permissions.ORG_MANAGE), validate(getOrganizationParamsSchema, 'params'), validate(updateOrganizationSchema), updateOrganization);
router.delete('/:organizationId', requirePermission(Permissions.ORG_MANAGE), validate(getOrganizationParamsSchema, 'params'), deleteOrganization);

router.post('/:organizationId/invitations', requirePermission(Permissions.ORG_MEMBER_MANAGE), validate(getOrganizationParamsSchema, 'params'), validate(inviteMemberSchema), inviteMember);
router.get('/:organizationId/members', requirePermission(Permissions.ORG_MEMBER_MANAGE), validate(getOrganizationParamsSchema, 'params'), listMembers);
router.patch('/:organizationId/members/:userId/role', requirePermission(Permissions.ORG_MEMBER_MANAGE), validate(getOrganizationParamsSchema, 'params'), validate(memberParamsSchema, 'params'), validate(updateMemberRoleSchema), changeMemberRole);
router.delete('/:organizationId/members/:userId', requirePermission(Permissions.ORG_MEMBER_MANAGE), validate(getOrganizationParamsSchema, 'params'), validate(memberParamsSchema, 'params'), removeMember);

export default router;