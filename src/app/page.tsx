"use client";

import { StatusCard } from "@/components/status-card";
import { ActivityFeed } from "@/components/activity-feed";
import { QuickActions } from "@/components/quick-actions";
import { ServicesGrid } from "@/components/services-grid";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import {
  Server,
  Ticket,
  Zap,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Bot,
  User,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/* ── Heartbeat data — seeded deterministically to avoid hydration mismatch ── */
function generateHeartbeats() {
  return Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const min = i % 2 === 0 ? "00" : "30";
    // Deterministic "random" based on index — same on server and client
    const seed = ((i * 7 + 13) * 31) % 100;
    return {
      time: `${hour.toString().padStart(2, "0")}:${min}`,
      status: seed > 6 ? ("ok" as const) : seed > 3 ? ("partial" as const) : ("missed" as const),
      action:
        seed > 70
          ? "Synced data"
          : seed > 40
            ? "Checked notes"
            : seed > 20
              ? "Ran automation"
              : "Health check",
    };
  });
}
const heartbeats = generateHeartbeats();

/* ── Scheduled deliverables ── */
const deliverables = [
  { name: "Daily Briefing", schedule: "Every day 08:00", lastDelivered: "Today 08:00", nextDue: "Tomorrow 08:00", status: "delivered" },
  { name: "Weekly IT Report", schedule: "Every Friday", lastDelivered: "14 Mar 2026", nextDue: "21 Mar 2026", status: "delivered" },
  { name: "Monthly Board Pack", schedule: "1st of each month", lastDelivered: "1 Mar 2026", nextDue: "1 Apr 2026", status: "upcoming" },
  { name: "Security Audit", schedule: "Every Monday", lastDelivered: "10 Mar 2026", nextDue: "17 Mar 2026", status: "upcoming" },
];

/* ── Telegram preview messages ── */
const telegramMessages = [
  { id: "1", role: "user" as const, text: "What's the status on Riffa'i's onboarding?", time: "14:22" },
  { id: "2", role: "assistant" as const, text: "Riffa'i's onboarding is at 67% — 8 of 12 items complete. Remaining: MFA setup, ClickUp access, printer config, L1 SOP review.", time: "14:22" },
  { id: "3", role: "user" as const, text: "Generate the weekly report and send to CEO", time: "14:30" },
  { id: "4", role: "assistant" as const, text: "Done. Weekly IT Report for Week 11 sent to CEO Weekly list. PDF archived to Drive.", time: "14:31" },
];

export default function Dashboard() {
  // Real data for status cards
  const { data: services } = useApi<{ name: string; running: boolean }[]>("/api/v1/services", { refreshInterval: 15000 });
  const { data: ticketsData } = useApi<{ tasks: { id: string; status: string; priority: string }[] }>("/api/v1/tasks/tickets", { refreshInterval: 60000 });
  const { data: jobs } = useApi<{ id: string; enabled: boolean }[]>("/api/v1/jobs", { refreshInterval: 60000 });

  const svcOnline = services?.filter((s) => s.running).length ?? 6;
  const svcTotal = services?.length ?? 8;
  const svcOffline = svcTotal - svcOnline;
  const tickets = ticketsData?.tasks || [];
  const openTickets = tickets.filter((t) => t.status.toLowerCase() !== "closed" && t.status.toLowerCase() !== "cancelled").length;
  const highPriority = tickets.filter((t) => t.priority === "high" || t.priority === "urgent").length;
  const activeJobs = jobs?.filter((j) => j.enabled).length ?? 14;
  const totalJobs = jobs?.length ?? 14;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold">
          Good evening, <span className="text-cyan glow-cyan-text">Azzay</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Saturday, 15 March 2026 · SGT (UTC+8)
        </p>
      </motion.div>

      {/* Status cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Services Online"
          value={`${svcOnline}/${svcTotal}`}
          subtitle={svcOffline > 0 ? `${svcOffline} offline` : "All systems go"}
          icon={Server}
          accent="cyan"
        />
        <StatusCard
          title="Open Tickets"
          value={openTickets}
          subtitle={`${highPriority} high priority`}
          icon={Ticket}
          trend={highPriority > 0 ? { value: `${highPriority} urgent`, positive: false } : undefined}
          accent="warning"
        />
        <StatusCard
          title="Automations"
          value={`${activeJobs}/${totalJobs}`}
          subtitle="Scheduled jobs"
          icon={Zap}
          trend={{ value: `${activeJobs} active`, positive: true }}
          accent="purple"
        />
        <StatusCard
          title="Avg Response"
          value="1.2h"
          subtitle="Target: 2h SLA"
          icon={Clock}
          trend={{ value: "15%", positive: true }}
          accent="success"
        />
      </div>

      {/* Heartbeat Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="rounded-xl border border-border bg-surface p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide">AIOE Heartbeat — Last 24h</h3>
          <div className="flex items-center gap-3 text-[10px] text-muted">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan" /> OK</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Partial</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" /> Missed</span>
          </div>
        </div>
        <div className="flex items-end gap-[3px]">
          {heartbeats.map((hb, i) => (
            <div key={i} className="group relative flex-1">
              <div
                className={cn(
                  "h-6 w-full rounded-[2px] transition-all hover:opacity-80",
                  hb.status === "ok" ? "bg-cyan/40" : hb.status === "partial" ? "bg-warning/60" : "bg-danger/60"
                )}
              />
              <div className="absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-background px-2 py-1 text-[9px] text-foreground shadow-lg group-hover:block">
                <p className="font-mono">{hb.time}</p>
                <p className="text-muted">{hb.action}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] text-muted font-mono">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>Now</span>
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          <ServicesGrid />

          {/* Telegram Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan" />
                <h3 className="text-sm font-semibold tracking-wide">Recent Telegram</h3>
              </div>
              <Link href="/chat" className="flex items-center gap-1 text-xs text-cyan transition-colors hover:text-cyan/80">
                Open Chat <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {telegramMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-2.5 px-5 py-3">
                  <div className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                    msg.role === "user" ? "bg-purple/15" : "bg-cyan/10"
                  )}>
                    {msg.role === "user" ? (
                      <User className="h-3 w-3 text-purple" />
                    ) : (
                      <Bot className="h-3 w-3 text-cyan" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                    <span className="text-[10px] text-muted">{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <ActivityFeed />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <QuickActions />

          {/* Scheduled Deliverables */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple" />
                <h3 className="text-sm font-semibold tracking-wide">Scheduled Deliverables</h3>
              </div>
            </div>
            <div className="divide-y divide-border">
              {deliverables.map((d) => (
                <div key={d.name} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-surface-hover">
                  <div>
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-[10px] text-muted">{d.schedule}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Next: {d.nextDue}</p>
                    <div className="mt-0.5 flex items-center justify-end gap-1">
                      {d.status === "delivered" ? (
                        <CheckCircle className="h-3 w-3 text-success" />
                      ) : (
                        <Clock className="h-3 w-3 text-warning" />
                      )}
                      <span className={cn("text-[10px]", d.status === "delivered" ? "text-success" : "text-warning")}>
                        {d.status === "delivered" ? "Last: " + d.lastDelivered : "Upcoming"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Team Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="rounded-xl border border-border bg-surface"
          >
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold tracking-wide">IT Team</h3>
            </div>
            <div className="space-y-3 p-4">
              {[
                { name: "Masswera", role: "IT Ops Executive", status: "active" },
                { name: "Nazmi", role: "IT Project Executive", status: "active" },
                { name: "Riffa'i", role: "IT Support (L1)", status: "onboarding" },
              ].map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple/15 text-xs font-bold text-purple">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        member.status === "active" ? "bg-success" : "bg-warning animate-pulse"
                      }`}
                    />
                    <span className="text-xs capitalize text-muted">{member.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
