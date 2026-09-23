import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Bot, ArrowRight, Sparkles, Shield, Zap, Brain, Bug, LineChart, GitBranch,
  Terminal, CheckCircle2, Star, GitPullRequestArrow, MessagesSquare, ListTodo,
  Play, Menu, X, Flame, Check, Plus, ArrowLeft, Eye, Lock, Database,
  Boxes, Network, MousePointerClick, Search, Cpu, RefreshCcw,
} from 'lucide-react';
import { FloatingNavbar } from '../components/FloatingNavbar';
import { GitHubIcon } from '../components/ui/social-icons';

const navLinks = [
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'How it works', href: '#how-it-works', id: 'how-it-works' },
  { label: 'AI Agents', href: '#agents', id: 'agents' },
  { label: 'Pricing', href: '#pricing', id: 'pricing' },
  { label: 'FAQ', href: '#faq', id: 'faq' },
];

const features = [
  {
    icon: Brain,
    title: 'AI Test Generation',
    description: 'VeriBot explores your app, maps flows, and writes resilient test suites automatically.',
    bullets: ['Natural-language authoring', 'Self-healing selectors', 'Edge-case discovery'],
  },
  {
    icon: Bug,
    title: 'Automatic Bug Detection',
    description: 'Every failure is analyzed and enriched with screenshots, video, and AI root-cause analysis.',
    bullets: ['Video + screenshot evidence', 'Severity auto-triage', 'One-click issue creation'],
  },
  {
    icon: LineChart,
    title: 'Live Quality Analytics',
    description: 'Track pass rates and flaky tests on a live dashboard. Know when you are safe to ship.',
    bullets: ['Flaky test detection', 'Release risk scoring', 'Weekly digests'],
  },
  {
    icon: GitBranch,
    title: 'Seamless CI/CD',
    description: 'Trigger runs from any pipeline. Isolated environments report results back instantly.',
    bullets: ['GitHub Actions-ready', 'Webhook-driven runs', 'Parallel execution'],
  },
];

const steps = [
  { step: '01', title: 'Connect your app', description: 'Add your URL or repo. VeriBot discovers pages and flows instantly.' },
  { step: '02', title: 'AI writes tests', description: 'Explore, map, and author a full QA suite with zero scripting.' },
  { step: '03', title: 'Run and ship', description: 'Parallel runs with rich evidence, then AI triage before you ship.' },
];

const agents = [
  { icon: Bot, name: 'Test Explorer', description: 'Maps your app and finds untested flows.', tag: 'Discovery' },
  { icon: Flame, name: 'Bug Hunter', description: 'Runs adversarial scenarios to shake out bugs first.', tag: 'Proactive QA' },
  { icon: LineChart, name: 'Regression Analyst', description: 'Detects flaky tests and isolates root causes.', tag: 'Reliability' },
  { icon: Terminal, name: 'Performance Auditor', description: 'Benchmarks load times and finds regressions.', tag: 'Performance' },
];

const plans = [
  {
    name: 'Starter', monthly: 0, cta: 'Start for free', highlight: false,
    description: 'For individual developers exploring AI testing.',
    features: ['500 runs / month', '1 project', 'AI test generation', 'Community support'],
  },
  {
    name: 'Pro', monthly: 79, cta: 'Start 14-day trial', highlight: true,
    description: 'For growing teams that ship fast with guardrails.',
    features: ['10,000 runs / month', 'Unlimited projects', 'All AI agents', 'Flaky analysis', 'Priority support'],
  },
  {
    name: 'Enterprise', monthly: null, cta: 'Contact sales', highlight: false,
    description: 'For organizations with advanced security and scale needs.',
    features: ['Unlimited runs', 'SSO & SAML', 'Dedicated infra', 'Custom AI tuning'],
  },
];

const faqs = [
  { q: 'How does VeriBot generate tests with AI?', a: 'VeriBot maps pages and interactions, then writes resilient Playwright test cases. Describe behavior in plain language and the AI authors the rest.' },
  { q: 'Do I need to write any code?', a: 'No. Tests are generated automatically)Skip. Failures include screenshots, video, and AI-written root-cause summaries.' },
  { q: 'Which apps does it support?', a: 'Any web app. It runs on Playwright, integrates with GitHub, GitLab, Slack, Jira, and CI/CD via webhooks.' },
  { q: 'How accurate is the AI bug analysis?', a: 'It combines structured evidence with AI reasoning to triage failures with far fewer false positives.' },
];

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden antialiased">
      <FloatingNavbar />

      {/* ===== HERO (split L/R, no gradients) ===== */}
      <section id="home" className="relative min-h-screen flex items-center">
        <div className="dotted-grid absolute inset-0 opacity-40 pointer-events-none" />
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-28 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* LEFT: big animated headline */}
            <div>
              <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-zinc-300">
                <Sparkles className="h-3 w-3 text-red-400" /> AI-Powered QA Automation
              </motion.p>

              <motion.h1 initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15,duration:0.6}}
                className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                <span className="block">Test</span>
                <span className="block text-white">your app</span>
                <span className="block">
                  with <span className="text-red-500">AI</span>
                </span>
              </motion.h1>

              <motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
                className="mt-6 max-w-md text-lg text-zinc-400">
                VeriBot explores your product, writes comprehensive tests, and hands you AI root-cause analysis before anything breaks.
              </motion.p>

              <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.45}}
                className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 hover:-translate-y-0.5 transition-all group">
                  Start testing free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button onClick={() => scrollTo('how-it-works')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-base font-semibold text-zinc-200 hover:bg-white/5 hover:border-white/25 transition-all">
                  <Play className="h-5 w-5 text-red-400" /> See how it works
                </button>
              </motion.div>
            </div>

            {/* RIGHT: dotted ER / flow diagram (Eraser-style animated) */}
            <motion.div initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} transition={{delay:0.35,duration:0.6}}
              className="relative rounded-2xl border border-white/12 bg-black/60 p-5 overflow-hidden">
              <div className="dotted-grid absolute inset-0 opacity-30 pointer-events-none" />
              <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Network className="h-4 w-4 text-red-400" /> Test architecture
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    <RefreshCcw className="h-3 w-3" /> live
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Entity rows connected by dotted lines */}
                  {[
                    { icon: Boxes, name: 'Application', sub: 'app.veribot.ai' },
                    { icon: Database, name: 'Test Suite', sub: '12 suites · 340 cases' },
                    { icon: Cpu, name: 'AI Agents', sub: 'explore · bug-hunt · analyze' },
                    { icon: MousePointerClick, name: 'Executed Steps', sub: '32 pass · 0 fail · 2 flaky' },
                    { icon: Bot, name: 'Analyzed Bugs', sub: '6 reported · root cause found' },
                  ].map((row, i) => {
                    const Icon = row.icon;
                    return (
                      <motion.div key={row.name} initial={{opacity:0,x:14}} animate={{opacity:1,x:0}} transition={{delay:0.5+i*0.12}}
                        className="group flex items-center gap-3 rounded-xl border border-white/12 bg-black/70 px-4 py-3 hover:border-red-500/40 hover:bg-black transition-all">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5">
                          <Icon className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{row.name}</p>
                          <p className="text-xs text-zinc-500">{row.sub}</p>
                        </div>
                        {i < 4 && <ChevronDown className="h-3 w-3 text-zinc-600" />}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {[['VeriBot','AI engine'],['Playwright','runner'],['CI/CD','ready']].map(([a,b]) => (
                    <div key={a} className="rounded-lg border border-white/10 bg-black/60 px-2 py-2">
                      <p className="text-xs font-bold text-white">{a}</p>
                      <p className="text-[10px] text-zinc-500">{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-red-500 uppercase tracking-widest">Features</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">Everything your QA team needs</h2>
            <p className="mt-4 text-lg text-zinc-400">Replace scattered test scripts and manual QA with one intelligent platform.</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="group rounded-2xl border border-white/10 bg-black/50 p-6 hover:border-red-500/40 hover:bg-black transition-all">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/12 bg-white/5 group-hover:border-red-500/30">
                    <Icon className="h-6 w-6 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{f.description}</p>
                  <ul className="mt-4 space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 lg:py-32 border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-red-500 uppercase tracking-widest">How it works</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">From zero to tested in three steps</h2>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-white/10 bg-black/50 p-8 hover:border-red-500/40 transition-colors">
                <span className="text-5xl font-extrabold text-white/15">{s.step}</span>
                <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
                <p className="mt-3 text-sm text-zinc-400">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== AI AGENTS ===== */}
      <section id="agents" className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-red-500 uppercase tracking-widest">AI Agents</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">A team of AI agents working around the clock</h2>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {agents.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.name} className="group rounded-2xl border border-white/10 bg-black/50 p-6 hover:border-red-500/40 hover:bg-black transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/5 group-hover:border-red-500/40">
                      <Icon className="h-5 w-5 text-red-400" />
                    </div>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{a.tag}</span>
                  </div>
                  <h3 className="mt-4 font-bold">{a.name}</h3>
                  <p className="mt-2 text-sm text-zinc-400">{a.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 lg:py-32 border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold text-red-500 uppercase tracking-widest">Pricing</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-zinc-400">Start free. Scale when you are ready.</p>
          </div>
          <div className="mt-16 grid gap-6 lg:grid-cols-3 items-stretch">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative flex flex-col rounded-2xl border p-8 ${plan.highlight ? 'border-red-500/50 bg-white/[0.03] shadow-2xl shadow-red-900/20' : 'border-white/10 bg-black/50'}`}>
                {plan.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-1 text-xs font-bold text-white">Most popular</span>}
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="mt-1 text-sm text-zinc-400">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  {plan.monthly === null ? <span className="text-4xl font-extrabold">Custom</span> : (<><span className="text-4xl font-extrabold">${plan.monthly}</span><span className="text-sm text-zinc-500">/ month</span></>)}
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (<li key={f} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />{f}</li>))}
                </ul>
                <Link to="/auth/register" className={`mt-8 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold ${plan.highlight ? 'bg-red-600 text-white hover:bg-red-500' : 'border border-white/15 text-white hover:bg-white/5'}`}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold text-red-500 uppercase tracking-widest">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">Questions? Answered.</h2>
          </div>
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <div key={f.q} className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-white/5 transition-colors">
                  <span className="font-semibold">{f.q}</span>
                  <span className={`text-red-500 transition-transform ${openFaq === i ? 'rotate-45' : ''}`}><Plus className="h-4 w-4" /></span>
                </button>
                {openFaq === i && <div className="px-6 pb-5 text-sm text-zinc-400 border-t border-white/10 pt-4">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-10">
            <div className="max-w-sm">
              <a className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600"><Bot className="h-5 w-5 text-white" /></div>

              </a>
              <p className="mt-4 text-sm text-zinc-400">AI-Powered QA Automation. Let agents generate, run, and analyze your tests.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
              <div><h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Product</h4><ul className="mt-4 space-y-3 text-sm">{[['Features','#features'],['Pricing','#pricing'],['FAQ','#faq']].map(([l,h])=>(<li key={l}><a href={h} className="text-zinc-500 hover:text-white">{l}</a></li>))}</ul></div>
              <div><h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">AI</h4><ul className="mt-4 space-y-3 text-sm">{[['Test Explorer','#agents'],['Bug Hunter','#agents'],['Regression Analyst','#agents']].map(([l,h])=>(<li key={l}><a href={h} className="text-zinc-500 hover:text-white">{l}</a></li>))}</ul></div>
              <div><h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Company</h4><ul className="mt-4 space-y-3 text-sm">{[['GitHub','https://github.com'],['Slack','#'],['Jira','#']].map(([l,h])=>(<li key={l}><a href={h} target={l==='GitHub'?'_blank':''} rel="noreferrer" className="text-zinc-500 hover:text-white">{l}</a></li>))}</ul></div>
            </div>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
            <p className="text-xs text-zinc-500">&copy; 2026 VeriBot, Inc. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-zinc-500"><a href="#" className="hover:text-white">Privacy</a><a href="#" className="hover:text-white">Terms</a><a href="#" className="hover:text-white">Security</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
