# VeriBot 🤖

VeriBot is an AI-powered QA SaaS platform that autonomously explores web applications, generates tests, runs them in a browser, analyzes failures, detects bugs, and helps engineers fix issues with AI-assisted workflows.

**Main purpose:** turn an untested web app into a continuously verified, regression-safe product. VeriBot discovers your app's pages and flows, generates and executes E2E tests in a real browser, hunts down flaky and failing behavior with AI root-cause analysis + a self-accumulating vector knowledge base, files bugs (optionally straight into GitHub), and reports quality trends so a small team gets enterprise-grade QA with no manual test writing.

This project is designed as a strong portfolio-grade SaaS product and a serious real-world engineering challenge. It combines full-stack development, browser automation, AI agents, DevOps, and production architecture.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Start Development Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd VeriBot

# Install dependencies
npm install
cd web && npm install && cd ..

# Start Docker services (PostgreSQL & Redis)
docker compose up -d postgres redis

# Run database migrations
npm run prisma:migrate

# Start both backend and frontend
./start-dev.sh
```

**Backend API:** `http://localhost:4000`  
**Frontend App:** `http://localhost:5173`

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd web && npm run dev
```

## ✅ Project Status

### **Backend: 90% Complete** 🟢
- ✅ Authentication (JWT, OAuth GitHub)
- ✅ User & Organization Management
- ✅ Projects & Applications
- ✅ Test Cases & Test Runs
- ✅ Bug Management
- ✅ AI-Powered Features (Test Gen, Analysis, Fix Suggestions)
- ✅ Integrations (GitHub, Jira, Slack)
- ✅ Email Notifications (SendGrid)
- ✅ Billing & Subscriptions (Stripe)
- ✅ Analytics & Reporting
- ✅ Browser Automation (Playwright)
- ✅ Workflow Discovery
- ✅ Flaky Test Detection
- ✅ Release Risk Scoring

### **Frontend: 100% Complete** 🎉
- ✅ Modern React 18 + TypeScript
- ✅ Dark Theme with Purple Accent
- ✅ Authentication Pages (Login/Register)
- ✅ Dashboard with Charts & Analytics
- ✅ Projects Management
- ✅ Test Runs Viewer
- ✅ Bug Tracker
- ✅ Responsive Design (Mobile/Tablet/Desktop)
- ✅ Animations & Loading States
- ✅ Toast Notifications
- ✅ API Integration with React Query
- ✅ State Management (Zustand)
- ✅ Production Build Ready

**See:** [FRONTEND_IMPLEMENTATION_COMPLETE.md](./FRONTEND_IMPLEMENTATION_COMPLETE.md)

## Why this project is strong

This project demonstrates a complete product stack:

- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL + Prisma
- **Queues:** Redis + BullMQ
- **Browser automation:** Playwright
- **AI:** LLMs, agents, tool calling, RAG, pgvector
- **Integrations:** GitHub, Jira, Slack
- **Infrastructure:** Docker, Kubernetes, Terraform, AWS
- **SaaS features:** Authentication, organizations, RBAC, billing, analytics

This is not just a chatbot or a toy demo. It is a production-style AI QA platform.

---

## Product vision

The customer provides:

- website URL
- test credentials
- optional GitHub repository
- optional requirements

The system then:

1. explores the app automatically
2. maps pages, flows, and actions
3. creates AI-generated test cases
4. runs them using Playwright
5. captures screenshots, logs, and network traces
6. analyzes failures with AI
7. detects bugs and root causes
8. creates GitHub issues or work items
9. suggests or applies code fixes
10. validates the fix with regression testing
11. produces a quality dashboard and release risk score

---

## Problem it solves

Most QA teams still rely on repetitive manual testing and brittle scripts. This product aims to reduce that burden by using AI to:

- discover app flows automatically
- produce regression tests faster
- explain failures better
- surface root-cause analysis
- reduce time-to-fix for engineering teams

---

## Core user journey

```text
User signs up
  ↓
Creates an organization
  ↓
Creates a project
  ↓
Adds application URL
  ↓
Adds test credentials
  ↓
AI explorer scans the app
  ↓
App map is generated
  ↓
AI generates tests
  ↓
Playwright executes tests
  ↓
Results, screenshots, logs, and bug reports are created
  ↓
AI analyzes failures and suggests fixes
  ↓
Engineer reviews and approves
  ↓
Regression validation and dashboard reporting
```

---

## Complete product flow structure

This is the end-to-end flow as actually implemented in the codebase — every step below is backed by a live API route and UI screen.

```text
1.  Sign up / sign in
      └─ Auth: register + email verification gate, JWT access + refresh tokens,
          optional 2FA, role-based permissions, organization membership

2.  Set up organization + project
      └─ Projects page → create project + add app (URL, environment, auth hints)

3.  Add infrastructure & integrations
      └─ Applications, test credentials, environments, test suites
      └─ Integrations: GitHub (report bugs automatically), Jira, Slack,
          Sentry, CircleCI (config is encrypted at rest)

4.  AI app discovery (OPTIONAL)
      └─ Explorer agent crawls the app URL → app map + suggested workflows

5.  Test authoring
      └─ Hand-written test cases (steps as JSON) or AI-generated via
          the test-generation agent → saved to a test suite

6.  Run tests
      └─ Runs are queued (BullMQ) and executed in a real browser (Playwright)
      └─ Runs record pass/fail/skip per case, duration, screenshots, console
          logs, network + DOM snapshots, and triggerType metadata
          (MANUAL / SCHEDULED / API / CI)

7.  Analyze failures (AI, optional)
      └─ Failure analyzer agent (LangGraph-style state-graph orchestrator)
          produces root cause, category, confidence, suggested fix
      └─ pgvector RAG: enriched with historically similar past failures;
          every finished analysis is stored back in the vector knowledge base

8.  Bug management
      └─ Bugs are created from failing runs (auto) or manually
      └─ Bug lifecycle: severity / priority / assignee / comments / status
      └─ GitHub integration: bug is auto-mirrored as a GitHub issue, or
          pushed on demand via "Report on GitHub" (idempotent, keeps issue URL)

9.  Flaky detection + healing (AI, optional)
      └─ Flaky test records detect flakiness scores over repeated runs
      └─ Healing agent proposes repaired selectors for flaky locators

10. Review, approve, report
      └─ Quality dashboard: pass rate, trends, flaky/failing hotspots
      └─ Analytics & reports; run replay and CI results (CircleCI)

11. Secure platform loops
      └─ Billing (Stripe plans), rate limiting, audit/notifications
      └─ Scheduled + CI/CD-triggered runs keep regression coverage continuous
```

### Request lifecycle (backend)

```text
 HTTP request
   → CORS + security headers
   → rate limiter
   → JWT authenticate + tenant middleware (resolves org + permissions)
   → route-level validator (Zod)
   → controller (business rules + permissions check)
   → service layer (AI agents, test runner, billing, GitHub, etc.)
   → repository / Prisma
   → PostgreSQL (+ pgvector) / Redis / BullMQ queues / worker pool

 Background workers
   → run-test jobs execute in Playwright
   → failure-analysis jobs run the agent graph
   → notification + billing jobs update state asynchronously
```

---

## High-level system design

```text
                          USER
                            │
                            ▼
                   ┌─────────────────┐
                   │   Next.js Web   │
                   │   Dashboard     │
                   └────────┬────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │  Express API    │
                   │  Node.js + TS   │
                   └───────┬─────────┘
                           │
        ┌──────────────────┼──────────────────────┐
        │                  │                      │
        ▼                  ▼                      ▼
   Auth Service      Project Service        AI Service
        │                  │                      │
        │                  │             ┌────────┴────────┐
        │                  │             │   AI Agents     │
        │                  │             │   Explorer      │
        │                  │             │   Test Gen      │
        │                  │             │   Analyzer      │
        │                  │             │   Fix Agent     │
        │                  │             └────────┬────────┘
        │                  │                      │
        └──────────────────┼──────────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Redis + BullMQ │
                    └──────┬───────┘
                           │
     ┌─────────────────────┼─────────────────────┐
     ▼                     ▼                     ▼
 AI Worker           Test Worker          Report Worker
     │                     │                     │
     ▼                     ▼                     ▼
LLM Tools            Playwright          Quality Reports
                     Browser            GitHub/Jira/Slack

                           │
                           ▼
                    PostgreSQL + Prisma
                           │
                    pgvector + Redis
                           │
                           ▼
                    S3 / object storage
```

---

## Effective project structure

The repo is a single Node package with the frontend under `web/`. The diagram below shows the layout it most closely resembles.

```text
VeriBot/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   │   └── types/
│   │
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── validators/
│   ├── workers/
│   ├── config/
│   └── server.ts
├── web/            # React + TypeScript frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── lib/
├── docs/           # design docs & guides
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

---

## How the current repo maps to the product

The repo uses a single-package layout with a separate frontend under `web/`:

- `src/` → backend API/service layer, queued workers, AI agents, Prisma schema
- `web/` → React + TypeScript frontend (Vite, React Router, React Query)
- `prisma/` → Prisma schema and migrations (PostgreSQL + pgvector)
- `src/workers/` → BullMQ/Redis background processing (test runs, agent runs, reports, scheduled runs)

---

## Core platform modules

### 1. Authentication and authorization

- user signup/login
- organization management
- team and RBAC
- project permissions
- API keys
- OAuth integrations

### 2. Project and application management

- create project
- add website URLs
- add environments
- store test credentials securely
- track app metadata

### 3. AI app explorer

- discover pages
- understand flows
- map user journeys
- inspect DOM structure
- detect forms, buttons, tables, and modals

### 4. Test generation

- generate smoke tests
- happy-path tests
- negative tests
- edge-case tests
- regression tests

### 5. Browser runner

- launch browser contexts
- automate actions
- handle login flows
- capture evidence
- support desktop/mobile breakpoints

### 6. Failure analysis

- collect screenshots and logs
- analyze DOM / console / network data
- root-cause analysis with LLM
- severity and confidence scoring

### 7. Bug management

- create issues from failures
- sync with GitHub/Jira/Slack
- open bug records with evidence
- assign issues to users

### 8. AI fix agent

- explore repository
- locate relevant code
- create patch suggestions
- validate via tests
- create PR draft

### 9. Quality dashboard

- pass/fail trends
- execution history
- flaky test analysis
- performance and accessibility metrics
- release risk insights

---

## Data model

Core entities should include:

- User
- Organization
- Team and Role
- Project
- Application
- Environment
- TestUser
- TestCase
- TestSuite
- TestRun
- TestResult
- Screenshot
- Video
- Bug
- BugComment
- Attachment
- AgentRun
- AITrace
- Integration
- Webhook
- Subscription
- Usage
- AuditLog

---

## Recommended stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui or similar

### Backend

- Node.js
- Express
- TypeScript
- Zod validation
- JWT/session auth

### Data layer

- PostgreSQL
- Prisma
- Redis
- pgvector

### Automation

- Playwright
- Browser contexts
- screenshots and traces

### AI layer

- OpenAI or other LLM provider
- LangGraph.js for agents
- embeddings and vector search
- tool calling and structured outputs

### DevOps

- Docker
- GitHub Actions
- AWS
- Terraform
- Kubernetes later
- Prometheus + Grafana + OpenTelemetry

---

## Deployment strategy

This should not be deployed as one giant app unless the project is intentionally built as a single bundle.

For a monorepo like this, the best architecture is:

### Frontend

- deploy the web app on Vercel or Netlify

### API backend

- deploy the Express API on Railway, Render, AWS ECS, or EC2

### Worker services

- deploy the worker on Railway, AWS ECS, or a separate VM/container

### Database

- deploy PostgreSQL externally using Supabase, Neon, Railway Postgres, or AWS RDS

### Queue and caching

- Redis on Upstash, Redis Cloud, or managed Redis service

### Storage

- object storage like S3 for screenshots, videos, and attachments

### Production pattern

```text
Browser users -> Web app -> API -> PostgreSQL/Redis
                                  -> Worker -> Playwright
                                  -> AI services
                                  -> S3 storage
```

This is the recommended production deployment model for this repo.

---

## Roadmap

> Status (2026-09-25): Phases 1-4 of the roadmap below are **implemented** end-to-end (auth, orgs, projects/apps, test cases/suites/runs, Playwright execution, AI test generation/failure analysis with Gemini/HuggingFace/mock providers, bug detection, GitHub issue mirroring, webhooks, scheduling). Phase 5 (AI fix flow) and Phase 6 (enterprise quality features) are partially implemented (flaky-tests detection, release-risk scoring, embeddings) with the remaining checklist items below still open.

## Phase 1: Foundation and MVP

- [x] create backend + frontend structure
- [ ] set up shared TypeScript config
- [ ] configure pnpm workspace
- [ ] build core API and health checks
- [ ] configure PostgreSQL and Prisma
- [ ] define core domain models
- [ ] implement auth and user management
- [ ] implement organizations and RBAC
- [ ] create project and application entities
- [ ] build dashboard shell for web app

## Phase 2: Browser automation and app discovery

- [ ] integrate Playwright
- [ ] build browser automation runner
- [ ] open URL and interact with page
- [ ] record page structure and actions
- [ ] generate application map
- [ ] capture screenshots and logs
- [ ] store test evidence

## Phase 3: AI test generation and execution

- [ ] connect LLM provider
- [ ] generate test cases from app map and requirements
- [ ] validate structured outputs with Zod
- [ ] queue test runs with BullMQ
- [ ] run tests in worker
- [ ] collect pass/fail results
- [ ] display results in dashboard

## Phase 4: Failure analysis and bug detection

- [ ] analyze console logs and DOM state
- [ ] summarize root causes with AI
- [ ] classify bug severity
- [ ] create bug records
- [ ] attach evidence and screenshots
- [ ] connect GitHub issue creation

## Phase 5: AI fix flow

- [ ] connect repository data
- [ ] index repos for semantic search
- [ ] locate candidate fix locations
- [ ] generate code patch suggestions
- [ ] validate through test execution
- [ ] create PR workflow draft
- [ ] require human approval for risky actions

## Phase 6: Enterprise quality features

- [ ] flaky test detection
- [ ] regression suite selection
- [ ] coverage overview
- [ ] accessibility checks
- [ ] API testing support
- [ ] performance monitoring
- [ ] security scanning basic checks

## Phase 7: SaaS production readiness

- [ ] billing and subscription logic
- [ ] usage tracking and quotas
- [ ] webhooks
- [ ] Slack and Jira integrations
- [ ] monitoring and metrics
- [ ] audit logs and security policies
- [ ] deployment automation

## Phase 8: Cloud and platform scale

- [ ] Dockerize services
- [ ] CI/CD via GitHub Actions
- [ ] deploy to staging and production
- [ ] add Terraform for infrastructure
- [ ] add Kubernetes later for scale
- [ ] implement OpenTelemetry and Grafana

---

## Recommended implementation order

The best path is not to build everything at once.

### Step 1: build the foundation

- auth
- orgs
- projects
- apps
- database models
- API scaffolding

### Step 2: build the browser automation base

- Playwright integration
- run a simple page automation script
- collect evidence

### Step 3: add AI analysis

- generate test cases
- analyze failures
- convert failure to bug

### Step 4: build the worker system

- queue management
- async jobs
- retries and job state tracking

### Step 5: add GitHub and code fix flow

- repo access
- code search
- patch generation
- PR workflow

### Step 6: add production polish

- dashboards
- monitoring
- billing
- deployment
- scaling

This staged order is what makes the project achievable.

---

## Project checklist

### Foundation

- [ ] monorepo architecture is created
- [ ] root workspace config is working
- [ ] API app is booting
- [ ] web app is booting
- [ ] worker app is booting
- [ ] Prisma schema is defined
- [ ] database connection works
- [ ] environment variables are configured

### Authentication

- [ ] sign up flow
- [ ] login flow
- [ ] session handling
- [ ] password hashing
- [ ] organizations
- [ ] permissions and roles

### Product features

- [ ] project creation
- [ ] app creation
- [ ] website URL tracking
- [ ] test user management
- [ ] app exploration
- [ ] page discovery
- [ ] test generation
- [ ] test execution
- [ ] evidence capture
- [ ] failure analysis
- [ ] bug creation

### AI features

- [ ] LLM integration
- [ ] structured generation schema
- [ ] tool calling system
- [ ] result evaluation
- [ ] fix suggestion workflow
- [ ] human approval gate

### Integrations

- [ ] GitHub auth and repo sync
- [ ] Jira integration
- [ ] Slack notifications
- [ ] webhooks

### Production

- [ ] Docker setup
- [ ] CI/CD pipeline
- [ ] staging environment
- [ ] production environment
- [ ] monitoring and logs
- [ ] alerting
- [ ] cost tracking

---

## Recommended final naming

The repo name is already VeriBot, and it fits the product well.

A good project identity would be:

- VeriBot
- VeriQA
- QAutonomous
- AutonomIQ
- BuildVerify
- CheckPilot

For this project, VeriBot is the strongest and simplest name because it is memorable and aligned with the concept of automated verification.

---

## Final recommendation

This is a very good project to build because it combines:

- SaaS product thinking
- monorepo architecture
- backend service design
- AI engineering
- browser automation
- deployment and infra

It is ambitious, but it is exactly the kind of project that is portfolio-worthy if built in phases.

The key is to avoid starting with Kubernetes and multi-agent complexity. Start with:

- auth
- projects
- app input
- Playwright exploration
- AI-generated tests
- result dashboard

Then add agent workflows, GitHub integration, worker queues, and production deployment.

---

## Best first milestone

The best first milestone is:

```text
User signs up
  ↓
creates a project
  ↓
adds a website URL
  ↓
AI or Playwright explores the site
  ↓
collects discovered pages
  ↓
shows them in a dashboard
```

That is the first real product milestone and the foundation for everything else.

---

## The product story for your portfolio

A recruiter or hiring manager should read your project story as:

> Built a full-stack AI QA SaaS platform that automatically explores web applications, generates tests, executes them with Playwright, analyzes failures, detects bugs, and supports AI-assisted remediation workflows.

That is a much stronger portfolio story than a simple AI demo.
# VeriBot
