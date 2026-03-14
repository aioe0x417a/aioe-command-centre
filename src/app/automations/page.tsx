"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Zap,
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  ChevronRight,
  Calendar,
  ArrowRight,
  Activity,
  Filter,
} from "lucide-react";

type Tab = "workflows" | "schedules" | "history";

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "error";
  lastRun: string;
  nextRun: string;
  successRate: string;
  runsToday: number;
  source: string;
}

const workflows: Workflow[] = [
  { id: "wf-1", name: "Invoice Pipeline", description: "Gmail → PDF extract → Drive → ClickUp", status: "active", lastRun: "30 min ago", nextRun: "In 30 min", successRate: "99.2%", runsToday: 8, source: "invoice_ingestion.py" },
  { id: "wf-2", name: "KM Gmail Sync", description: "Labeled emails → NotebookLM notebooks", status: "active", lastRun: "1 hour ago", nextRun: "In 1 hour", successRate: "100%", runsToday: 12, source: "km_gmail_sync.py" },
  { id: "wf-3", name: "KM Drive Sync", description: "Modified Drive files → NotebookLM", status: "active", lastRun: "2 hours ago", nextRun: "In 1 hour", successRate: "98.5%", runsToday: 6, source: "km_drive_sync.py" },
  { id: "wf-4", name: "IT Board Pack", description: "Monthly IT report generation for leadership", status: "active", lastRun: "5 days ago", nextRun: "1 Apr 2026", successRate: "100%", runsToday: 0, source: "km_boardpack.py" },
  { id: "wf-5", name: "Daily Briefing", description: "Morning summary → Telegram", status: "active", lastRun: "Today 08:00", nextRun: "Tomorrow 08:00", successRate: "97.8%", runsToday: 1, source: "n8n" },
  { id: "wf-6", name: "ClickUp Sync", description: "Bidirectional task sync with AIOE", status: "active", lastRun: "15 min ago", nextRun: "In 15 min", successRate: "99.7%", runsToday: 42, source: "n8n" },
  { id: "wf-7", name: "Masswera Bot Relay", description: "Restricted IT ops scope + shadow forwarding", status: "active", lastRun: "45 min ago", nextRun: "On trigger", successRate: "100%", runsToday: 5, source: "masswera_bot.py" },
  { id: "wf-8", name: "Backup Verification", description: "Weekly backup integrity check", status: "paused", lastRun: "1 week ago", nextRun: "Paused", successRate: "100%", runsToday: 0, source: "n8n" },
];

interface ScheduleJob {
  name: string;
  cron: string;
  nextRun: string;
  enabled: boolean;
}

const scheduleJobs: ScheduleJob[] = [
  { name: "Invoice Pipeline", cron: "*/30 * * * *", nextRun: "15:30 SGT", enabled: true },
  { name: "KM Gmail Sync", cron: "0 * * * *", nextRun: "16:00 SGT", enabled: true },
  { name: "KM Drive Sync", cron: "30 * * * *", nextRun: "15:30 SGT", enabled: true },
  { name: "Daily Briefing", cron: "0 8 * * *", nextRun: "08:00 SGT tomorrow", enabled: true },
  { name: "Board Pack", cron: "0 9 1 * *", nextRun: "01 Apr 2026 09:00", enabled: true },
  { name: "ClickUp Sync", cron: "*/15 * * * *", nextRun: "15:15 SGT", enabled: true },
  { name: "Backup Verification", cron: "0 2 * * 0", nextRun: "Paused", enabled: false },
  { name: "Health Check", cron: "*/5 * * * *", nextRun: "15:05 SGT", enabled: true },
];

interface ExecutionLog {
  workflow: string;
  status: "success" | "failed" | "running";
  startedAt: string;
  duration: string;
  trigger: string;
}

const executionHistory: ExecutionLog[] = [
  { workflow: "ClickUp Sync", status: "success", startedAt: "15:00:01", duration: "2.3s", trigger: "Schedule" },
  { workflow: "Invoice Pipeline", status: "success", startedAt: "14:30:00", duration: "12.4s", trigger: "Schedule" },
  { workflow: "KM Gmail Sync", status: "success", startedAt: "14:00:00", duration: "8.1s", trigger: "Schedule" },
  { workflow: "ClickUp Sync", status: "success", startedAt: "14:45:01", duration: "1.9s", trigger: "Schedule" },
  { workflow: "Daily Briefing", status: "success", startedAt: "08:00:00", duration: "34.2s", trigger: "Schedule" },
  { workflow: "Masswera Bot Relay", status: "success", startedAt: "13:22:15", duration: "4.7s", trigger: "Webhook" },
  { workflow: "KM Drive Sync", status: "failed", startedAt: "12:30:00", duration: "45.0s", trigger: "Schedule" },
  { workflow: "ClickUp Sync", status: "success", startedAt: "12:15:01", duration: "2.1s", trigger: "Schedule" },
];

const statusConfig = {
  active: { color: "text-success", bg: "bg-success/10", label: "Active" },
  paused: { color: "text-warning", bg: "bg-warning/10", label: "Paused" },
  error: { color: "text-danger", bg: "bg-danger/10", label: "Error" },
};

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("workflows");

  const tabs = [
    { id: "workflows" as Tab, label: "Workflows", icon: Zap },
    { id: "schedules" as Tab, label: "Schedules", icon: Calendar },
    { id: "history" as Tab, label: "Execution History", icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Automations</h1>
          <p className="text-sm text-muted">Workflows, schedules, and execution history</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted">{workflows.filter((w) => w.status === "active").length} active</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <Zap className="h-3.5 w-3.5 text-purple" />
            <span className="text-muted">{workflows.reduce((sum, w) => sum + w.runsToday, 0)} runs today</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all",
              activeTab === tab.id ? "bg-cyan/10 text-cyan" : "text-muted hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "workflows" && (
        <div className="space-y-3">
          {workflows.map((wf, i) => {
            const config = statusConfig[wf.status];
            return (
              <motion.div
                key={wf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="rounded-xl border border-border bg-surface px-5 py-4 transition-all hover:border-cyan/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("rounded-lg p-2", config.bg)}>
                      <Zap className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{wf.name}</h3>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", config.bg, config.color)}>
                          {config.label}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">{wf.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden text-right text-xs text-muted sm:block">
                      <p>Last: {wf.lastRun}</p>
                      <p>Next: {wf.nextRun}</p>
                    </div>
                    <div className="hidden text-right text-xs sm:block">
                      <p className="text-success">{wf.successRate}</p>
                      <p className="text-muted">{wf.runsToday} today</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {wf.status === "active" ? (
                        <button className="rounded-lg p-2 text-muted transition-colors hover:bg-warning/10 hover:text-warning">
                          <Pause className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button className="rounded-lg p-2 text-muted transition-colors hover:bg-success/10 hover:text-success">
                          <Play className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {activeTab === "schedules" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 text-left font-medium">Job</th>
                  <th className="px-5 py-3 text-left font-medium">Cron</th>
                  <th className="px-5 py-3 text-left font-medium">Next Run</th>
                  <th className="px-5 py-3 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {scheduleJobs.map((job) => (
                  <tr key={job.name} className="transition-colors hover:bg-surface-hover">
                    <td className="px-5 py-3 font-medium">{job.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{job.cron}</td>
                    <td className="px-5 py-3 text-xs text-muted">{job.nextRun}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          job.enabled ? "bg-cyan" : "bg-border"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                            job.enabled ? "translate-x-4" : "translate-x-1"
                          )}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 text-left font-medium">Workflow</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Started</th>
                  <th className="px-5 py-3 text-left font-medium">Duration</th>
                  <th className="px-5 py-3 text-left font-medium">Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {executionHistory.map((exec, i) => (
                  <tr key={i} className="transition-colors hover:bg-surface-hover">
                    <td className="px-5 py-3 font-medium">{exec.workflow}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "flex items-center gap-1.5 text-xs font-medium",
                        exec.status === "success" ? "text-success" : exec.status === "failed" ? "text-danger" : "text-warning"
                      )}>
                        {exec.status === "success" ? <CheckCircle className="h-3 w-3" /> :
                          exec.status === "failed" ? <XCircle className="h-3 w-3" /> :
                            <RotateCcw className="h-3 w-3 animate-spin" />}
                        {exec.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{exec.startedAt}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{exec.duration}</td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[10px] text-muted">{exec.trigger}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
