import { Router, type Router as ExpressRouter } from "express";
import { requireAuth, requireOrgRole } from "../middleware/auth";
import {
	acceptInvitationController,
	changeMemberRoleController,
	createOrganizationController,
	deleteOrganizationController,
	getOrganizationController,
	inviteMemberController,
	listMembersController,
	listOrganizationsController,
	removeMemberController,
	updateOrganizationController,
} from "../features/organizations/controllers/organization.controller";

const router: ExpressRouter = Router();

router.use(requireAuth);
router.get(
	"/",
	listOrganizationsController,
);
router.post("/", createOrganizationController);
router.post("/accept-invite", acceptInvitationController);
router.get(
	"/:orgId",
	requireOrgRole([
		"OWNER",
		"ADMIN",
		"QA_MANAGER",
		"DEVELOPER",
		"TESTER",
		"VIEWER",
	]),
	getOrganizationController,
);
router.patch(
	"/:orgId",
	requireOrgRole(["OWNER", "ADMIN"]),
	updateOrganizationController,
);
router.delete(
	"/:orgId",
	requireOrgRole(["OWNER"]),
	deleteOrganizationController,
);
router.post(
	"/:orgId/members/invite",
	requireOrgRole(["OWNER", "ADMIN"]),
	inviteMemberController,
);
router.get(
	"/:orgId/members",
	requireOrgRole([
		"OWNER",
		"ADMIN",
		"QA_MANAGER",
		"DEVELOPER",
		"TESTER",
		"VIEWER",
	]),
	listMembersController,
);
router.patch(
	"/:orgId/members/:userId",
	requireOrgRole(["OWNER", "ADMIN"]),
	changeMemberRoleController,
);
router.delete(
	"/:orgId/members/:userId",
	requireOrgRole(["OWNER", "ADMIN"]),
	removeMemberController,
);

export default router;
