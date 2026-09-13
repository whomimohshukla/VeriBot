import { Permissions } from '../constants/permissions';

export const SEED_PERMISSIONS = Object.values(Permissions);

export type PermissionSeed = {
  key: string;
  description: string;
};

export const PERMISSION_SEEDS: PermissionSeed[] = [
  { key: Permissions.PROJECT_READ, description: 'View projects.' },
  { key: Permissions.PROJECT_CREATE, description: 'Create projects.' },
  { key: Permissions.PROJECT_UPDATE, description: 'Update projects.' },
  { key: Permissions.PROJECT_DELETE, description: 'Delete projects.' },
  { key: Permissions.APPLICATION_READ, description: 'View applications.' },
  { key: Permissions.APPLICATION_CREATE, description: 'Create applications.' },
  { key: Permissions.APPLICATION_UPDATE, description: 'Update applications.' },
  { key: Permissions.APPLICATION_DELETE, description: 'Delete applications.' },
  { key: Permissions.APPLICATION_SCAN, description: 'Scan applications.' },
  { key: Permissions.TEST_READ, description: 'View test cases and suites.' },
  { key: Permissions.TEST_CREATE, description: 'Create test cases and suites.' },
  { key: Permissions.TEST_UPDATE, description: 'Update test cases.' },
  { key: Permissions.TEST_DELETE, description: 'Delete test cases.' },
  { key: Permissions.TEST_EXECUTE, description: 'Run test executions.' },
  { key: Permissions.BUG_READ, description: 'View bugs.' },
  { key: Permissions.BUG_CREATE, description: 'Create bugs.' },
  { key: Permissions.BUG_UPDATE, description: 'Update bugs.' },
  { key: Permissions.BUG_DELETE, description: 'Delete bugs.' },
  { key: Permissions.AGENT_TRIGGER, description: 'Trigger AI agents.' },
  { key: Permissions.AGENT_READ, description: 'View agent runs.' },
  { key: Permissions.INTEGRATION_MANAGE, description: 'Manage integrations.' },
  { key: Permissions.INTEGRATION_READ, description: 'View integrations.' },
  { key: Permissions.WEBHOOK_MANAGE, description: 'Manage webhooks.' },
  { key: Permissions.WEBHOOK_READ, description: 'View webhooks.' },
  { key: Permissions.API_KEY_MANAGE, description: 'Manage API keys.' },
  { key: Permissions.ANALYTICS_READ, description: 'View analytics and reports.' },
  { key: Permissions.BILLING_MANAGE, description: 'Manage billing and subscription.' },
  { key: Permissions.ORG_MANAGE, description: 'Manage organization settings.' },
  { key: Permissions.ORG_MEMBER_MANAGE, description: 'Manage organization members.' },
];
