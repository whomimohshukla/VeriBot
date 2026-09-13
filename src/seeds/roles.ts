import { Roles } from '../constants/roles';

export const SEED_ROLES = Object.values(Roles);

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  OWNER: 'Full control over the organization and billing.',
  ADMIN: 'Manages organization resources, members, and settings.',
  QA_MANAGER: 'Owns the QA process, test cases, and bug triage.',
  DEVELOPER: 'Reads tests and runs executions; can create bugs.',
  TESTER: 'Creates tests, executes runs, and files bugs.',
  VIEWER: 'Read-only access to projects, tests, and analytics.',
};
