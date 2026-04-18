"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LoginScreen } from "./login-screen";
import { useAuth } from "@/lib/use-auth";
import {
  Zap,
  Activity,
  Bot,
  CheckCircle2,
  ShieldCheck,
  Workflow,
  MessageSquare,
  Ticket,
  ArrowRight,
  Sparkles,
} from "lucide-react";

/**
 * Public-facing marketing landing shown to unauthenticated visitors.
 * Single-page: hero → features → how-it-works → pricing → FAQ → CTA.
 * Pressing "Sign in" or "Start free trial" swaps in the existing LoginScreen.
 */
export function MarketingLanding() {
  const [showLogin, setShowLogin] = useState(false);
  const enterDemo = useAuth((s) => s.enterDemo);

  if (showLogin) {
    return (
      <div className="min-h-screen bg-background">
        <button
          onClick={() => setShowLogin(false)}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur transition hover:text-foreground hover:border-cyan/40"
          aria-label="Back to landing"
        >
          ← Back
        </button>
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Top nav ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/20 to-purple/20 ring-1 ring-cyan/30">
              <Zap className="h-4 w-4 text-cyan" />
            </div>
            <span className="text-sm font-semibold tracking-wide">AIOE</span>
            <span className="hidden text-xs text-muted-foreground md:inline">
              Command Centre
            </span>
          </div>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">
              Features
            </a>
            <a href="#how" className="transition hover:text-foreground">
              How it works
            </a>
            <a href="#pricing" className="transition hover:text-foreground">
              Pricing
            </a>
          </nav>
          <button
            onClick={() => setShowLogin(true)}
            className="rounded-lg border border-cyan/40 bg-cyan/5 px-4 py-1.5 text-sm font-medium text-cyan transition hover:bg-cyan/10"
          >
            Sign in
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.cyan/8%),transparent_50%),radial-gradient(ellipse_at_bottom_right,theme(colors.purple/6%),transparent_60%)]" />
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 text-xs text-cyan"
          >
            <Sparkles className="h-3 w-3" />
            <span>Your personal AI operations engine</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance bg-gradient-to-br from-white via-white to-white/60 bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl"
          >
            One command centre for your whole operation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Monitor services, triage tickets, review AI chats, run automations
            and see everything that matters — in one dark-mode dashboard your
            AI agents keep up to date for you.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button
              onClick={() => setShowLogin(true)}
              className="group inline-flex items-center gap-2 rounded-lg bg-cyan px-6 py-3 text-sm font-semibold text-background shadow-[0_0_30px_-5px_theme(colors.cyan/60%)] transition hover:bg-cyan/90"
            >
              Start 7-day free trial
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={enterDemo}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-5 py-3 text-sm font-medium text-foreground/90 transition hover:border-cyan/40 hover:bg-card/60"
            >
              Try live demo →
            </button>
            <a
              href="#features"
              className="text-sm text-muted-foreground underline-offset-4 transition hover:text-foreground hover:underline"
            >
              See what's inside ↓
            </a>
          </motion.div>
          <div className="mt-6 text-xs text-muted-foreground">
            No credit card required. Cancel anytime. Demo uses simulated data.
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Twelve command surfaces, one screen
            </h2>
            <p className="mt-4 text-muted-foreground">
              Pages your AI agents keep fresh while you sleep.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section id="how" className="border-y border-border/50 bg-card/20 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Live in under 5 minutes
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sign up, plug in your backend, let the agents do the rest.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="relative rounded-xl border border-border bg-card/40 p-6 backdrop-blur"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 text-sm font-semibold text-cyan">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-muted-foreground">
              One plan. Every feature. Cancel anytime.
            </p>
          </div>
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-cyan/30 bg-gradient-to-br from-cyan/5 via-card/40 to-purple/5 p-8 shadow-[0_0_60px_-20px_theme(colors.cyan/40%)]">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-bold">$19</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground">
              7-day free trial — no card required
            </div>
            <ul className="mt-8 space-y-3 text-sm">
              {PRICING_FEATURES.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowLogin(true)}
              className="mt-8 w-full rounded-lg bg-cyan py-3 text-sm font-semibold text-background shadow-[0_0_30px_-5px_theme(colors.cyan/60%)] transition hover:bg-cyan/90"
            >
              Start free trial →
            </button>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section className="border-t border-border/50 bg-card/10 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
            Frequently asked
          </h2>
          <div className="mt-10 space-y-4">
            {FAQ.map((q) => (
              <details
                key={q.q}
                className="group rounded-lg border border-border bg-card/40 p-4 open:border-cyan/30"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                  {q.q}
                  <span className="text-muted-foreground transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{q.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ─────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-gradient-to-br from-cyan/5 via-card/40 to-purple/5 p-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Stop chasing dashboards. Start commanding.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Your AI agents are already working. Give them one screen to
            report to.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-cyan px-6 py-3 text-sm font-semibold text-background shadow-[0_0_30px_-5px_theme(colors.cyan/60%)] transition hover:bg-cyan/90"
          >
            Start 7-day free trial
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row">
          <div>© 2026 AIOE Command Centre</div>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* Content */
/* ──────────────────────────────────────────────────────────────────── */

type Feature = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

function FeatureCard({ icon: Icon, title, body }: Feature) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45 }}
      className="group rounded-xl border border-border bg-card/40 p-6 backdrop-blur transition hover:border-cyan/40 hover:bg-card/60"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan/20 to-purple/20 ring-1 ring-cyan/30">
        <Icon className="h-5 w-5 text-cyan" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </motion.div>
  );
}

const FEATURES: Feature[] = [
  {
    icon: Activity,
    title: "Live Monitoring",
    body: "Services, jobs, invariants — all streaming with ~30s refresh. See anomalies the moment your AI agents catch them.",
  },
  {
    icon: Ticket,
    title: "AI Tasks",
    body: "ClickUp-backed Kanban with priority and SLA signals. Agents surface what needs you; everything else runs itself.",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    body: "Unified chat over email, calendar, ops context. Ask in plain English, get real answers — not canned summaries.",
  },
  {
    icon: Workflow,
    title: "Automations",
    body: "Browse, enable, and schedule agents. Every run is logged. Drift gets self-healed before it becomes an incident.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Access",
    body: "2FA on login, session hardening, access-identity audit. Rate-limited login. Your command centre, locked down.",
  },
  {
    icon: Bot,
    title: "Agent Activity",
    body: "Flat log of every agent action. Filter, replay, verify. Your AI works for you — now you can watch it.",
  },
];

const STEPS = [
  {
    title: "Sign up",
    body: "30 seconds. Email and a password. Optional 2FA via any authenticator app.",
  },
  {
    title: "Connect your backend",
    body: "Point us at your ops endpoint or let us provision one. We never store long-term data.",
  },
  {
    title: "Command",
    body: "Your agents start populating the dashboard. You start making decisions instead of gathering information.",
  },
];

const PRICING_FEATURES = [
  "All 12 command surfaces",
  "Unlimited agent-reported events",
  "30s live refresh across every page",
  "2FA + audit log",
  "Email + priority support",
  "7-day free trial, cancel anytime",
];

const FAQ = [
  {
    q: "Is my data stored anywhere?",
    a: "The dashboard fetches on demand. Configuration (your API key, 2FA secret) lives encrypted in your browser. Nothing agent-sensitive is stored long-term on our side.",
  },
  {
    q: "Do I need my own backend?",
    a: "Yes — AIOE Command Centre is the front-end to your AI ops engine. It talks to any backend that speaks the AIOE API, or we can provision one for you during onboarding.",
  },
  {
    q: "Does it work on mobile?",
    a: "The dashboard is responsive. A native mobile experience is on the roadmap.",
  },
  {
    q: "How do I cancel?",
    a: "One click from Settings → Billing. You keep access until the end of the paid period. No questions asked.",
  },
];
