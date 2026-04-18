/**
 * Seeded demo-mode data. Returned by useApi() when demoMode is true.
 * Keys are the API paths (as passed to useApi). Values are plausible fixtures
 * that let a prospect click around the dashboard without a real backend.
 *
 * Rules for seed values:
 *   - Realistic shapes that match the authenticated responses.
 *   - No real names, emails, internal URLs, or secrets.
 *   - Timestamps = stable offsets from a fixed base so SSR/CSR hash matches.
 *
 * If you add a new useApi('/foo') call, add a seed here or the demo page will
 * just sit at loading=true.
 */

const BASE = "2026-03-15T09:00:00Z";

function iso(offsetMins: number): string {
  const t = new Date(BASE).getTime() + offsetMins * 60_000;
  return new Date(t).toISOString();
}

// Deterministic "random" pick from an index -- keeps SSR and CSR identical.
function pick<T>(i: number, arr: T[]): T {
  return arr[i % arr.length];
}

export const DEMO_DATA: Record<string, unknown> = {
  // ─── Services ────────────────────────────────────────────────────────
  "/api/v1/services": [
    { name: "api", running: true, healthy: true, uptime_sec: 342100 },
    { name: "agents", running: true, healthy: true, uptime_sec: 342050 },
    { name: "relay", running: true, healthy: true, uptime_sec: 341400 },
    { name: "pulse", running: true, healthy: true, uptime_sec: 341400 },
    { name: "masswera", running: true, healthy: true, uptime_sec: 341200 },
    { name: "nazmi", running: true, healthy: true, uptime_sec: 340900 },
    { name: "postgres", running: true, healthy: true, uptime_sec: 680400 },
    { name: "watchdog", running: true, healthy: true, uptime_sec: 86000 },
  ],

  // ─── Tasks (ClickUp-style) ───────────────────────────────────────────
  "/api/v1/tasks/tickets": {
    tasks: Array.from({ length: 12 }, (_, i) => ({
      id: `DEMO-${100 + i}`,
      name: pick(i, [
        "Follow up with vendor on quarterly invoice",
        "Review security policy for contractor access",
        "Prep Q2 board deck",
        "Audit OAuth token rotation schedule",
        "Reconcile SaaS spend against budget",
        "Draft incident postmortem",
        "Interview candidate for L1 support",
        "Renew SSL certificate for api.example",
      ]),
      status: pick(i, ["to do", "in progress", "to do", "in progress", "done"]),
      priority: pick(i, ["normal", "high", "normal", "urgent", "normal", "low"]),
      assignee: pick(i, ["you", "teammate", "you"]),
      due: iso(60 * 24 * (i + 1)),
    })),
  },

  // ─── Jobs / Automations ──────────────────────────────────────────────
  "/api/v1/jobs": Array.from({ length: 14 }, (_, i) => ({
    id: pick(i, [
      "daily-briefing", "health-check", "ticket-triage", "backup-scheduler",
      "cost-report", "log-rotator", "cert-renewal", "workload-sweep",
      "vendor-sla-check", "license-reclaim", "doc-index", "meeting-prep",
      "invoice-reminder", "usage-poll",
    ]),
    enabled: i % 5 !== 0,
    schedule: pick(i, ["0 */1 * * *", "0 8 * * *", "*/15 * * * *", "0 0 * * 1"]),
    last_run: iso(-60 * (i + 1)),
    last_outcome: pick(i, ["ok", "ok", "ok", "ok", "skip", "ok"]),
  })),

  // ─── Monitoring / dashboard ──────────────────────────────────────────
  "/api/v1/dashboard/overview": {
    services: { online: 7, total: 8 },
    tickets: { open: 8, high: 2 },
    jobs: { active: 11, total: 14 },
    system: { cpu: 12, mem: 34, disk: 18 },
  },

  // ─── Activity / action log ───────────────────────────────────────────
  "/api/v1/activity": Array.from({ length: 20 }, (_, i) => ({
    agent: pick(i, ["monitoring", "tasks", "security", "it_ops", "housekeeping"]),
    action: pick(i, [
      "surfaced 2 overdue tickets",
      "detected cert expiry in 14d",
      "re-ran stale health check",
      "flagged 1 unused SaaS seat",
      "indexed 6 new documents",
      "closed resolved alert",
    ]),
    result: 0,
    time: iso(-(i + 1) * 11),
  })),

  // ─── Chat history ────────────────────────────────────────────────────
  "/api/v1/chat/history": [
    { id: "1", role: "user", text: "What needs my attention today?", time: iso(-60) },
    {
      id: "2",
      role: "assistant",
      text: "Two items: (1) SSL cert for api.aioe expires in 14 days, (2) Quarterly invoice from MegaCorp overdue by 3 days. Want me to draft responses?",
      time: iso(-59),
    },
    { id: "3", role: "user", text: "Draft both.", time: iso(-58) },
    {
      id: "4",
      role: "assistant",
      text: "Drafts ready in your inbox as ⏳ queued. Review and send, or ask me to tweak the tone.",
      time: iso(-57),
    },
  ],

  // ─── Notes ───────────────────────────────────────────────────────────
  "/api/v1/notes": Array.from({ length: 8 }, (_, i) => ({
    id: `n-${i + 1}`,
    title: pick(i, [
      "Q2 planning — open questions",
      "Vendor shortlist",
      "Onboarding script v2",
      "Board pack outline",
      "Incident response checklist",
      "SaaS consolidation candidates",
    ]),
    snippet: "Demo content — real notes appear here when connected.",
    updated: iso(-60 * 24 * (i + 1)),
  })),

  // ─── Monitoring page ─────────────────────────────────────────────────
  "/api/v1/monitoring/alerts": [
    { id: "a1", severity: "info", text: "Demo alert: nightly backup completed OK", time: iso(-30) },
    { id: "a2", severity: "warning", text: "Demo alert: disk usage trend rising on web-2", time: iso(-120) },
  ],
};

/**
 * Returns seed data for the given path, or null if we don't have a seed.
 * Path may be the raw string from useApi (e.g. "/api/v1/services").
 */
export function getDemoData<T = unknown>(path: string): T | null {
  if (path in DEMO_DATA) return DEMO_DATA[path] as T;
  // Normalise: strip query string if present
  const cleaned = path.split("?")[0];
  if (cleaned in DEMO_DATA) return DEMO_DATA[cleaned] as T;
  return null;
}
