"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { toast } from "@/lib/use-toast";
import { CardSkeleton, ListSkeleton } from "@/components/skeleton";
import {
  Users,
  Ticket,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Zap,
  Server,
  ArrowRight,
  Briefcase,
  Target,
  Layers,
} from "lucide-react";
import Link from "next/link";

// ── Types ──
interface WorkloadMember { name: string; email: string | null; count: number }
interface StatusBreakdown { status: string; count: number }
interface WorkloadData { total_tasks: number; workload: WorkloadMember[]; by_status: StatusBreakdown[] }

interface TicketTask { id: string; name: string; status: string; priority: string; due_date: string | null; assignees: string[]; url: string }
interface TicketsData { list: string; tasks: TicketTask[]; synced_at?: string }

interface DailyTask { id: string; name: string; status: string; priority: string; due_date: string | null; assignees: string[]; url: string }
interface DailyData { list: string; tasks: DailyTask[] }

interface ServiceData { name: string; slug: string; running: boolean; pids: number[] }

interface JobData { id: string; name: string; schedule: string; enabled: boolean; last_run: string | null; last_status: string | null }

// ── Helpers ──
const statusColors: Record<string, string> = {
  open: "text-warning", "in progress": "text-cyan", done: "text-success", cancelled: "text-muted",
  important: "text-danger", "important - not urgent": "text-cyan", "urgent - not important": "text-warning", "low priority": "text-muted",
};

const priorityConfig: Record<string, { bg: string; text: string }> = {
  urgent: { bg: "bg-danger/10", text: "text-danger" },
  high: { bg: "bg-warning/10", text: "text-warning" },
  normal: { bg: "bg-cyan/10", text: "text-cyan" },
  low: { bg: "bg-surface-hover", text: "text-muted" },
};

function anim(delay: number) { return { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay } }; }

// ── Component ──
export default function ITOpsPage() {
  const { data: workload, loading: wlLoading, refresh: refreshWl } = useApi<WorkloadData>("/api/v1/workload/team", { refreshInterval: 60000 });
  const { data: tickets, loading: tkLoading } = useApi<TicketsData>("/api/v1/tasks/tickets", { refreshInterval: 30000 });
  const { data: daily, loading: dlLoading } = useApi<DailyData>("/api/v1/tasks/today", { refreshInterval: 30000 });
  const { data: services } = useApi<ServiceData[]>("/api/v1/services", { refreshInterval: 15000 });
  const { data: jobs } = useApi<JobData[]>("/api/v1/jobs", { refreshInterval: 60000 });

  const wl = workload?.workload || [];
  const statuses = workload?.by_status || [];
  const totalTasks = workload?.total_tasks || 0;
  const tix = tickets?.tasks || [];
  const dailyTasks = daily?.tasks || [];
  const openTickets = tix.filter((t) => t.status.toLowerCase() !== "cancelled" && t.status.toLowerCase() !== "closed");
  const svcOnline = services?.filter((s) => s.running).length ?? 0;
  const svcTotal = services?.length ?? 0;
  const activeJobs = jobs?.filter((j) => j.enabled).length ?? 0;
  const maxWorkload = Math.max(...wl.map((m) => m.count), 1);

  // Priority breakdown from daily tasks
  const priorityCounts = dailyTasks.reduce((acc, t) => {
    const p = t.priority || "normal";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Status groups for the ring chart
  const activeStatuses = statuses.filter((s) => !["done", "cancelled", "closed", "complete"].includes(s.status.toLowerCase()));
  const totalActive = activeStatuses.reduce((s, x) => s + x.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">IT Operations</h1>
          <p className="text-sm text-muted">Executive overview — tasks, workload, tickets, and service health</p>
        </div>
        <button
          onClick={() => { refreshWl(); toast("Refreshing...", "info"); }}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-cyan/30"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      {wlLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {[
            { label: "Total Tasks", value: totalTasks, icon: Layers, color: "text-cyan", bg: "bg-cyan/10" },
            { label: "Open Tickets", value: openTickets.length, icon: Ticket, color: "text-warning", bg: "bg-warning/10" },
            { label: "Services", value: `${svcOnline}/${svcTotal}`, icon: Server, color: "text-success", bg: "bg-success/10" },
            { label: "Active Jobs", value: activeJobs, icon: Zap, color: "text-purple", bg: "bg-purple/10" },
            { label: "Unassigned", value: wl.find((m) => m.name === "Unassigned")?.count || 0, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              {...anim(i * 0.05)}
              className="rounded-xl border border-border bg-surface p-4 transition-all hover:border-cyan/20"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium tracking-wider text-muted uppercase">{kpi.label}</p>
                <div className={cn("rounded-lg p-1.5", kpi.bg)}>
                  <kpi.icon className={cn("h-3.5 w-3.5", kpi.color)} />
                </div>
              </div>
              <p className={cn("mt-2 text-2xl font-bold", kpi.color)}>{kpi.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── LEFT: Workload + Status Breakdown ── */}
        <div className="space-y-6 lg:col-span-2">

          {/* Team Workload */}
          <motion.div {...anim(0.1)} className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple" />
                <h3 className="text-sm font-semibold tracking-wide">Team Workload</h3>
              </div>
              <span className="text-xs text-muted">{totalTasks} tasks across team</span>
            </div>
            <div className="p-5 space-y-4">
              {wl.filter((m) => m.name !== "Unassigned").map((member, i) => {
                const pct = Math.round((member.count / maxWorkload) * 100);
                const isHeavy = member.count > totalTasks * 0.3;
                return (
                  <div key={member.name} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple/15 text-xs font-bold text-purple">
                          {member.name[0]}
                        </div>
                        <div>
                          <span className="text-sm font-medium">{member.name}</span>
                          {isHeavy && (
                            <span className="ml-2 rounded-full bg-warning/10 px-1.5 py-0.5 text-[9px] text-warning">Heavy load</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-cyan">{member.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-border/40">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                        className={cn(
                          "h-full rounded-full",
                          isHeavy ? "bg-warning" : "bg-cyan/60"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
              {/* Unassigned */}
              {wl.find((m) => m.name === "Unassigned") && (
                <div className="mt-2 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-danger" />
                      <span className="text-sm font-medium text-danger">Unassigned Tasks</span>
                    </div>
                    <span className="text-sm font-bold text-danger">{wl.find((m) => m.name === "Unassigned")?.count}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Task Status Breakdown — horizontal bar chart */}
          <motion.div {...anim(0.15)} className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan" />
                <h3 className="text-sm font-semibold tracking-wide">Task Status Breakdown</h3>
              </div>
              <span className="text-xs text-muted">{totalActive} active</span>
            </div>
            <div className="p-5">
              {/* Stacked bar */}
              <div className="mb-4 flex h-8 overflow-hidden rounded-lg">
                {activeStatuses.map((s, i) => {
                  const pct = totalActive > 0 ? (s.count / totalActive) * 100 : 0;
                  const colors = [
                    "bg-danger/80", "bg-warning/80", "bg-cyan/80", "bg-purple/80",
                    "bg-success/80", "bg-pink-500/80", "bg-orange-500/80", "bg-teal-500/80",
                  ];
                  return (
                    <motion.div
                      key={s.status}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
                      className={cn("h-full", colors[i % colors.length])}
                      title={`${s.status}: ${s.count}`}
                    />
                  );
                })}
              </div>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {activeStatuses.map((s, i) => {
                  const colors = [
                    "bg-danger/80", "bg-warning/80", "bg-cyan/80", "bg-purple/80",
                    "bg-success/80", "bg-pink-500/80", "bg-orange-500/80", "bg-teal-500/80",
                  ];
                  return (
                    <div key={s.status} className="flex items-center gap-2">
                      <div className={cn("h-2.5 w-2.5 rounded-sm", colors[i % colors.length])} />
                      <span className="text-xs capitalize text-muted">{s.status}</span>
                      <span className="ml-auto text-xs font-mono font-bold">{s.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Daily Ops Tasks */}
          <motion.div {...anim(0.2)} className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-cyan" />
                <h3 className="text-sm font-semibold tracking-wide">Daily Ops Tasks</h3>
              </div>
              <span className="text-xs text-muted">{dailyTasks.length} tasks</span>
            </div>
            {dlLoading ? (
              <div className="p-4"><ListSkeleton rows={5} /></div>
            ) : (
              <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                {dailyTasks.slice(0, 15).map((task) => {
                  const pc = priorityConfig[task.priority || "normal"] || priorityConfig.normal;
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-surface-hover"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn("h-2 w-2 rounded-full shrink-0", statusColors[task.status.toLowerCase()] ? "bg-current " + statusColors[task.status.toLowerCase()] : "bg-muted")} />
                        <div className="min-w-0">
                          <p className="text-sm truncate">{task.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] capitalize text-muted">{task.status}</span>
                            {task.assignees.length > 0 && (
                              <span className="text-[10px] text-purple">{task.assignees[0]}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", pc.bg, pc.text)}>
                          {task.priority || "normal"}
                        </span>
                        <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-cyan">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RIGHT column ── */}
        <div className="space-y-6">

          {/* Priority Distribution — donut style */}
          <motion.div {...anim(0.1)} className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold tracking-wide mb-4">Priority Distribution</h3>
            <div className="flex items-center justify-center">
              <div className="relative h-36 w-36">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="8" fill="none" className="text-border" />
                  {(() => {
                    const entries = Object.entries(priorityCounts);
                    const total = entries.reduce((s, [, c]) => s + c, 0) || 1;
                    const colorMap: Record<string, string> = { urgent: "#ff5252", high: "#ffab00", normal: "#39ff14", low: "#7a7a9e" };
                    let offset = 0;
                    return entries.map(([p, count]) => {
                      const pct = (count / total) * 238.76; // 2 * PI * 38
                      const el = (
                        <circle
                          key={p}
                          cx="50" cy="50" r="38"
                          stroke={colorMap[p] || "#39ff14"}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${pct} ${238.76 - pct}`}
                          strokeDashoffset={-offset}
                          strokeLinecap="round"
                        />
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{dailyTasks.length}</span>
                  <span className="text-[10px] text-muted">tasks</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Object.entries(priorityCounts).map(([p, count]) => {
                const pc = priorityConfig[p] || priorityConfig.normal;
                return (
                  <div key={p} className={cn("flex items-center justify-between rounded-lg px-3 py-2", pc.bg)}>
                    <span className={cn("text-xs capitalize", pc.text)}>{p}</span>
                    <span className={cn("text-sm font-bold", pc.text)}>{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* IT Tickets */}
          <motion.div {...anim(0.15)} className="rounded-xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-warning" />
                <h3 className="text-sm font-semibold tracking-wide">IT Tickets</h3>
              </div>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", openTickets.length > 0 ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}>
                {openTickets.length} open
              </span>
            </div>
            {tkLoading ? (
              <div className="p-4"><ListSkeleton rows={4} /></div>
            ) : (
              <div className="divide-y divide-border">
                {tix.map((ticket) => {
                  const isClosed = ticket.status.toLowerCase() === "cancelled" || ticket.status.toLowerCase() === "closed";
                  return (
                    <div key={ticket.id} className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface-hover">
                      <div className={cn("mt-1 shrink-0", isClosed ? "text-muted" : ticket.priority === "high" ? "text-warning" : "text-cyan")}>
                        {isClosed ? <XCircle className="h-3.5 w-3.5" /> : <Ticket className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-sm truncate", isClosed && "line-through text-muted")}>{ticket.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn("text-[10px] capitalize", statusColors[ticket.status.toLowerCase()] || "text-muted")}>{ticket.status}</span>
                          <span className={cn("rounded px-1 py-0.5 text-[9px] font-medium", (priorityConfig[ticket.priority] || priorityConfig.normal).bg, (priorityConfig[ticket.priority] || priorityConfig.normal).text)}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <a href={ticket.url} target="_blank" rel="noopener noreferrer" className="mt-1 shrink-0 text-muted hover:text-cyan">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div {...anim(0.2)} className="rounded-xl border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold tracking-wide">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: "Access & Identity", href: "/access-identity", icon: Users, desc: "Users, devices, approvals" },
                { label: "Services", href: "/services", icon: Server, desc: "Start, stop, monitor" },
                { label: "AI Tasks", href: "/tasks", icon: Zap, desc: "AIOE task queue" },
                { label: "Security", href: "/security", icon: AlertTriangle, desc: "Posture & alerts" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 transition-all hover:border-cyan/20 hover:bg-surface-hover"
                >
                  <link.icon className="h-4 w-4 text-cyan" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{link.label}</p>
                    <p className="text-[10px] text-muted">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-3 w-3 text-muted" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
