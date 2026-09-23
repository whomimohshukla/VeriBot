import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Brain,
  Bug,
  LineChart,
  GitBranch,
  Terminal,
  CheckCircle2,
  Star,
  GitPullRequestArrow,
  MessagesSquare,
  ListTodo,
  Play,
  Menu,
  X,
  Flame,
} from 'lucide-react';
import { useState } from 'react';
import { GitHubIcon } from '../components/ui/social-icons';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'AI Agents', href: '#agents' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

const heroStats = [
  { value: '99.9%', label: 'Test reliability' },
  { value: '10x', label: 'Faster test authoring' },
  { value: '40%', label: 'Fewer bugs shipped' },
  { value: '24/7', label: 'AI agents on duty' },
];

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Test Generation',
    description:
      'VeriBot explores your application, maps user flows, and writes comprehensive test cases automatically — no scripting required.',
    bullets: ['Natural-language test authoring', 'Self-healing selectors', 'Automatic edge-case discovery'],
  },
  {
    icon: Bug,
    title: 'Automatic Bug Detection',
    description:
      'Every test failure is analyzed, triaged, and enriched with screenshots, video, console logs, and AI root-cause analysis.',
    bullets: ['Video + screenshot evidence', 'Severity auto-triage', 'One-click GitHub issue creation'],
  },
  {
    icon: LineChart,
    title: 'Real-Time Quality Analytics',
    description:
      'Track pass rates, flaky tests, and release readiness on a live dashboard. Know exactly when you are safe to ship.',
    bullets: ['Flaky test detection', 'Release risk scoring', 'Weekly intelligent digests'],
  },
  {
    icon: GitBranch,
    title: 'Seamless CI/CD',
    description:
      'Trigger test runs from any pipeline. VeriBot spins up isolated environments and reports results back instantly.',
    bullets: ['GitHub Actions-ready', 'Webhook-driven runs', 'Parallel test execution'],
  },
  {
    icon: Shield,
    title: 'Enterprise-Grade Security',
    description:
      'SSO-ready authentication, granular RBAC, encrypted credentials, and full audit trails for every action.',
    bullets: ['Role-based access control', 'Complete audit log', 'SOC 2-pattern controls'],
  },
  {
    icon: Zap,
    title: 'Instant Feedback Loops',
    description:
      'From commit to results in minutes. Slack notifications and issue sync keep your whole team aligned.',
    bullets: ['Slack alerts', 'Jira integration', 'Webhooks for everything'],
  },
];

const steps = [
  {
    step: '01',
    title: 'Connect your application',
    description:
      'Add your app URL or connect your repo. VeriBot discovers pages, flows, and key user journeys instantly.',
  },
  {
    step: '02',
    title: 'AI generates your test suite',
    description:
      'Describe behaviors in plain language or let AI map flows automatically. VeriBot writes resilient, maintainable tests.',
  },
  {
    step: '03',
    title: 'Run, analyze, and ship',
    description:
      'Tests run in parallel with rich evidence. Bugs are triaged by AI and synced to your tracker. Ship with confidence.',
  },
];

const agents = [
  {
    icon: Bot,
    name: 'Test Explorer',
    description: 'Autonomously maps your application and discovers untested flows.',
    tag: 'Discovery',
  },
  {
    icon: Flame,
    name: 'Bug Hunter',
    description: 'Runs adversarial scenarios to shake out edge-case bugs before users do.',
    tag: 'Proactive QA',
  },
  {
    icon: LineChart,
    name: 'Regression Analyst',
    description: 'Detects flaky tests and isolates root causes before they block your pipeline.',
    tag: 'Reliability',
  },
  {
    icon: Terminal,
    name: 'Performance Auditor',
    description: 'Benchmarks load times and identifies performance regressions automatically.',
    tag: 'Performance',
  },
];

const testimonials = [
  {
    quote:
      'VeriBot cut our test-authoring time by 80%. The AI-generated suites catch bugs we used to ship to production.',
    name: 'Sarah Chen',
    role: 'VP of Engineering, FinApps',
    initials: 'SC',
  },
  {
    quote:
      'The AI root-cause analysis alone is worth it. We triage failures 10x faster and actually ship on Fridays now.',
    name: 'Marcus Reid',
    role: 'QA Lead, CloudScale',
    initials: 'MR',
  },
  {
    quote:
      'It machine-gunned through our app and found 6 critical bugs in the first week. Insane value for the price.',
    name: 'Priya Sharma',
    role: 'CTO, Cartly',
    initials: 'PS',
  },
];

const plans = [
  {
    name: 'Starter',
    monthly: 0,
    description: 'For individual developers exploring AI testing.',
    features: ['500 test runs / month', '1 project', 'AI test generation', 'Community support'],
    cta: 'Start for free',
    highlight: false,
  },
  {
    name: 'Pro',
    monthly: 79,
    description: 'For growing teams that ship fast and want quality guardrails.',
    features: [
      '10,000 test runs / month',
      'Unlimited projects',
      'All AI agents',
      'Slack & GitHub integrations',
      'Flaky test analysis',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    monthly: null,
    description: 'For organizations with advanced security and scale needs.',
    features: [
      'Unlimited test runs',
      'SSO & SAML',
      'Dedicated infrastructure',
      'Custom AI model tuning',
      'SLA & onboarding',
    ],
    cta: 'Contact sales',
    highlight: false,
  },
];

const faqs = [
  {
    q: 'How does VeriBot generate tests with AI?',
    a: 'VeriBot explores your application like a human tester: it maps pages, interactions, and flows, then writes resilient Playwright-based test cases. You can also describe desired behavior in plain language and VeriBot authors the test for you.',
  },
  {
    q: 'Do I need to write any code?',
    a: 'No. VeriBot is designed for QA engineers, PMs, and developers alike. Tests are generated automatically, and failures come with screenshots, video, and AI-written root-cause summaries.',
  },
  {
    q: 'Which frameworks and apps does it support?',
    a: 'VeriBot works with any web application. It runs on Playwright under the hood, integrates with GitHub, GitLab, Slack, Jira, and any CI/CD tool via webhooks and REST APIs.',
  },
  {
    q: 'How accurate is the AI bug analysis?',
    a: 'VeriBot combines structured test evidence (logs, DOM snapshots, network activity) with AI reasoning to produce actionable root-cause analysis. Teams consistently report triaging failures 10x faster with far fewer false positives than heuristic-only tools.',
  },
  {
    q: 'Is my source code and app data secure?',
    a: 'Yes. Credentials are encrypted at rest and in transit, access is governed by granular role-based permissions, and every action is recorded in an immutable audit log. Enterprise plans can run in dedicated infrastructure.',
  },
  {
    q: 'Can I try it before paying?',
    a: 'Absolutely. The Starter plan is free forever, and Pro includes a 14-day full-feature trial with no credit card required.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

const stagger = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '-80px' },
  variants: {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  },
};

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="#" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                <span className="gradient-text">VeriBot</span>
              </span>
            </a>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/auth/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all hover:shadow-primary/35"
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl">
            <div className="container px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 mt-3 pt-3 border-t border-border/60">
                <Link
                  to="/auth/login"
                  className="flex-1 text-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary/50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  className="flex-1 text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Start for free
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute top-40 -left-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
          <div className="absolute top-64 -right-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)',
              backgroundSize: '36px 36px',
              maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 10%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Introducing AI Agents for QA
              <span className="hidden sm:inline text-primary/70">→</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
          >
            AI that tests your app
            <br />
            <span className="gradient-text">so your users never find bugs</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            VeriBot explores your product, writes comprehensive tests, runs them on every
            deploy, and hands you AI root-cause analysis before anything breaks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/auth/register"
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/40 transition-all"
            >
              Start testing free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-card/50 px-8 py-4 text-base font-semibold hover:bg-secondary/50 transition-colors"
            >
              <Play className="h-5 w-5 text-primary" />
              See how it works
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            Free forever plan · No credit card required · Set up in 5 minutes
          </motion.p>

          {/* Mock dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mx-auto mt-16 max-w-5xl"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 via-purple-500/10 to-sky-500/20 blur-2xl" />
            <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-500/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <span className="h-3 w-3 rounded-full bg-green-500/80" />
                <div className="ml-4 flex items-center gap-2 rounded-md bg-secondary/60 px-3 py-1 text-xs text-muted-foreground">
                  <Terminal className="h-3 w-3" />
                  app.veribot.ai — Quality Dashboard
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 sm:p-6">
                <div className="col-span-2 grid grid-cols-3 gap-4">
                  {[
                    { label: 'Pass rate', value: '98.4%', accent: 'text-emerald-400' },
                    { label: 'Tests this week', value: '1,284', accent: 'text-sky-400' },
                    { label: 'Bugs caught', value: '37', accent: 'text-amber-400' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-background/60 p-4 text-left">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className={`mt-1 text-2xl font-bold ${s.accent}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-background/60 p-4 text-left">
                  <p className="text-xs text-muted-foreground mb-3">Test trends</p>
                  <div className="flex h-28 items-end gap-1.5">
                    {[45, 62, 55, 78, 70, 88, 96].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-primary/60 to-primary"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 rounded-xl border border-border bg-background/60 p-4 text-left">
                  <p className="text-xs text-muted-foreground mb-3">AI bug analysis</p>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2">
                      <p className="text-xs font-medium text-emerald-400">✓ Root cause identified</p>
                    </div>
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
                      <p className="text-xs font-medium text-red-400">⚠ Critical bug: checkout flow</p>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
                      <p className="text-xs font-medium text-amber-400">~ Flaky test: pricing page</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...stagger}
            className="mx-auto mt-20 grid max-w-4xl grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {heroStats.map((stat) => (
              <motion.div key={stat.label} variants={{ hidden: {}, show: {} }} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold gradient-text">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== LOGOS ===== */}
      <section className="border-y border-border/60 bg-secondary/20 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
            Trusted by QA teams at modern product companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {['Acme Corp', 'CloudScale', 'FinApps', 'Cartly', 'ByteWorks', 'NordStack'].map((name) => (
              <span key={name} className="text-lg font-bold text-foreground/80 tracking-tight">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 lg:py-32 scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Features</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
              Everything your QA team needs, <span className="gradient-text">on autopilot</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              VeriBot replaces scattered test scripts, manual QA workflows, and flaky tooling with one intelligent platform.
            </p>
          </motion.div>

          <motion.div
            {...stagger}
            className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={{ hidden: {}, show: {} }}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white shadow-lg shadow-primary/25">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  <ul className="mt-4 space-y-2">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="relative py-24 lg:py-32 scroll-mt-16 bg-secondary/20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">How it works</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
              From zero to fully tested in <span className="gradient-text">three steps</span>
            </h2>
          </motion.div>

          <motion.div {...stagger} className="mt-16 grid gap-8 lg:grid-cols-3">
            {steps.map((s) => (
              <motion.div
                key={s.step}
                variants={{ hidden: {}, show: {} }}
                className="relative rounded-2xl border border-border bg-card p-8"
              >
                <span className="text-5xl font-extrabold text-primary/20">{s.step}</span>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== AI AGENTS ===== */}
      <section id="agents" className="py-24 lg:py-32 scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">AI Agents</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
              A team of AI agents, <span className="gradient-text">working around the clock</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Deploy specialized agents that continuously probe, analyze, and protect your product.
            </p>
          </motion.div>

          <motion.div {...stagger} className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <motion.div
                  key={agent.name}
                  variants={{ hidden: {}, show: {} }}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {agent.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 font-bold">{agent.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{agent.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 lg:py-32 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Loved by engineers</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
              Teams ship faster with <span className="gradient-text">VeriBot</span>
            </h2>
          </motion.div>

          <motion.div {...stagger} className="mt-16 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <motion.figure
                key={t.name}
                variants={{ hidden: {}, show: {} }}
                className="flex flex-col rounded-2xl border border-border bg-card p-8"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground/90">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-sm font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 lg:py-32 scroll-mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">Pricing</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
              Simple, transparent <span className="gradient-text">pricing</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">Start free. Scale when you're ready.</p>
          </motion.div>

          <motion.div {...stagger} className="mt-16 grid gap-6 lg:grid-cols-3 items-stretch">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={{ hidden: {}, show: {} }}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.highlight
                    ? 'border-primary/60 bg-card shadow-2xl shadow-primary/20 lg:scale-[1.03]'
                    : 'border-border bg-card'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-purple-600 px-4 py-1 text-xs font-bold text-white shadow-lg">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  {plan.monthly === null ? (
                    <span className="text-4xl font-extrabold">Custom</span>
                  ) : (
                    <>
                      <span className="text-4xl font-extrabold">${plan.monthly}</span>
                      <span className="text-sm text-muted-foreground">/ month</span>
                    </>
                  )}
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth/register"
                  className={`mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90'
                      : 'border border-border hover:bg-secondary/50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== INTEGRATIONS STRIP ===== */}
      <section className="border-y border-border/60 bg-secondary/20 py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground mb-8">
            Fits right into your stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: GitPullRequestArrow, label: 'GitHub' },
              { icon: MessagesSquare, label: 'Slack' },
              { icon: ListTodo, label: 'Jira' },
              { icon: Terminal, label: 'GitHub Actions' },
              { icon: GitBranch, label: 'Webhooks' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 lg:py-32 scroll-mt-16">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">Questions? Answered.</h2>
          </motion.div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={faq.q}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-secondary/30"
                >
                  <span className="font-semibold">{faq.q}</span>
                  <span className={`text-primary transition-transform ${openFaq === i ? 'rotate-45' : ''}`}>
                    <PlusIcon />
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
        </div>
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp} className="mx-auto max-w-2xl">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              Ready to ship with <span className="gradient-text">confidence?</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of developers who let VeriBot find their bugs before users do.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/auth/register"
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90 transition-all"
              >
                Get started free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border px-8 py-4 text-base font-semibold hover:bg-secondary/50 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/60 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <a href="#" className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-extrabold gradient-text">VeriBot</span>
              </a>
              <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
                AI-Powered QA Automation. Let intelligent agents generate, run, and analyze your tests so you can ship with confidence.
              </p>
              <div className="mt-6 flex gap-3">
                <a href="#" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <GitHubIcon className="h-4 w-4" />
                </a>
                <a href="#" aria-label="Twitter" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <span className="text-sm font-bold">𝕏</span>
                </a>
                <a href="#" aria-label="LinkedIn" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                  <span className="text-sm font-bold">in</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Product</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {['Features', 'AI Agents', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (
                  <li key={item}>
                    <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {['About', 'Blog', 'Careers', 'Contact', 'Press'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resources</h4>
              <ul className="mt-4 space-y-3 text-sm">
                {['Documentation', 'API Reference', 'Community', 'Status', 'Security'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-8">
            <p className="text-xs text-muted-foreground">© 2026 VeriBot, Inc. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}