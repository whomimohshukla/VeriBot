// ===== Common =====
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    message?: string;
    items?: T[];
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== Auth =====
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthResult {
  user: User;
  organization: { id: string; name: string; slug: string } | null;
  tokens: TokenPair;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  organizationName?: string;
}

// ===== Organization =====
export type MembershipRole = 'OWNER' | 'ADMIN' | 'QA_MANAGER' | 'DEVELOPER' | 'TESTER' | 'VIEWER';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: string;
}

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  role: MembershipRole;
  joinedAt: string;
  user?: Pick<User, 'id' | 'email' | 'name' | 'avatar' | 'emailVerified'>;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: MembershipRole;
  status: string;
  createdAt: string;
}

// ===== App / Project =====
export interface Project {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  status: string;
  testSuites: number;
  testCases: number;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}

export interface Application {
  id: string;
  projectId: string;
  name: string;
  baseUrl: string;
  description: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
}

export type TestCaseType = 'FUNCTIONAL' | 'HAPPY_PATH' | 'NEGATIVE' | 'EDGE_CASE' | 'REGRESSION' | 'SMOKE';
export type TestStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'SKIPPED';

export interface TestStep {
  id?: string;
  action: string;
  selector?: string;
  value?: string;
  url?: string;
}

export interface TestCase {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  type: TestCaseType;
  priority: string;
  status: string;
  steps: TestStep[];
  tags: string[];
  createdById: string;
  isGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TestRunStatus = 'PENDING' | 'QUEUED' | 'RUNNING' | 'PASSED' | 'FAILED' | 'ERRORED' | 'CANCELLED';

export interface TestRun {
  id: string;
  projectId: string;
  suiteId?: string | null;
  status: TestRunStatus;
  triggerType: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  erroredTests: number;
  duration: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdById?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  testCase?: TestCase;
}

export interface TestResult {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: TestStatus;
  duration: number | null;
  errorMessage: string | null;
  screenshotUrl: string | null;
  videoUrl: string | null;
  consoleLogs: string[];
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  testCase: TestCase;
}

// ===== Bugs =====
export type BugSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BugPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type BugStatus = 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED' | 'CLOSED' | 'WONT_FIX';

export interface Bug {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  severity: BugSeverity;
  priority: BugPriority;
  status: BugStatus;
  assigneeId: string | null;
  createdById: string | null;
  testResultId: string | null;
  evidence: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
  creator?: User | null;
}

// ===== Analytics =====
export interface DashboardStats {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  totalRuns: number;
  activeProjects: number;
  openBugs: number;
  criticalBugs: number;
}

export interface TestTrendPoint {
  date: string;
  passed: number;
  failed: number;
  total: number;
}

export interface FlakyTest {
  testCaseId: string;
  testCaseTitle: string;
  totalRuns: number;
  passCount: number;
  failCount: number;
  flakyScore: number;
  rootCauseAnalysis: string;
  lastOccurred: string;
  pattern: string;
}

export interface AnalyticsSummary {
  testsRun: number;
  passRate: number;
  bugsFound: number;
  activeProjects: number;
  avgRunDuration: number;
  trends: TestTrendPoint[];
  flakyTests: FlakyTest[];
}

// ===== Agents =====
export type AgentType = 'TEST_EXPLORER' | 'BUG_HUNTER' | 'REGRESSION_ANALYST' | 'PERFORMANCE_AUDITOR' | 'CODE_QUALITY';
export type AgentStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  description: string;
  status: AgentStatus;
  configuration: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentRun {
  id: string;
  agentId: string;
  projectId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  result: Record<string, unknown> | null;
}

// ===== Integrations / Webhooks =====
export type IntegrationType = 'GITHUB' | 'SLACK' | 'JIRA' | 'SENTRY' | 'CIRCLE_CI';

export interface Integration {
  id: string;
  organizationId: string;
  type: IntegrationType;
  name: string;
  isActive: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Webhook {
  id: string;
  organizationId: string;
  url: string;
  secret: string | null;
  events: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  status: 'SUCCESS' | 'FAILED' | 'RETRYING';
  responseCode: number | null;
  attempts: number;
  createdAt: string;
}

// ===== API Keys =====
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  createdAt: string;
}

// ===== Billing =====
export interface BillingPlan {
  key: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  testRunLimit: number;
  features: string[];
}

export interface Billing {
  id: string;
  organizationId: string;
  plan: string;
  status: string;
  testRunsUsed: number;
  testRunLimit: number;
  renewalDate: string | null;
}

// ===== Audit =====
export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string | null;
  actionType: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: { name: string | null; email: string } | null;
}