"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { toast } from "@/lib/use-toast";
import { ListSkeleton } from "@/components/skeleton";
import {
  Zap,
  Play,
  Pause,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Calendar,
  Activity,
} from "lucide-react";

type Tab = "workflows" | "schedules";

interface Job {
  id: string;
  name: string;
  schedule: string;
  timezone: string;
  message: string;
  enabled: boolean;
  last_run: string | null;
  last_status: string | null;
  created_at: string;
}

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function describeCron(cron: string): string {
  const parts = cron.split(" ");
  if (parts.length !== 5) return cron;
  const [min, hour, dom, mon, dow] = parts;
  if (min.startsWith("*/")) return `Every ${min.slice(2)} minutes`;
  if (hour.startsWith("*/")) return `Every ${hour.slice(2)} hours`;
  if (dom === "*" && mon === "*" && dow === "*") return `Daily at ${hour}:${min.padStart(2, "0")}`;
  if (dow !== "*") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${days[+dow] || dow} at ${hour}:${min.padStart(2, "0")}`;
  }
  return cron;
}

export default function AutomationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("workflows");
  const { data: jobs, loading, refresh } = useApi<Job[]>("/api/v1/jobs", { refreshInterval: 30000 });

  const displayJobs = jobs || [];
  const activeCount = displayJobs.filter((j) => j.enabled).length;

  const toggleJob = async (job: Job) => {
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/api/v1/jobs/${job.id}/toggle`)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !job.enabled }),
      });
      if (res.ok) {
        toast(`${job.name} ${job.enabled ? "paused" : "enabled"}`, job.enabled ? "warning" : "success");
        refresh();
      } else {
        toast("Failed to toggle job", "error");
      }
    } catch {
      toast("API error", "error");
    }
  };

  const tabs = [
    { id: "workflows" as Tab, label: "Workflows", icon: Zap },
    { id: "schedules" as Tab, label: "Schedule View", icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Automations</h1>
          <p className="text-sm text-muted">Scheduled jobs managed by AIOE</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted">{activeCount} active</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
            <Zap className="h-3.5 w-3.5 text-purple" />
            <span className="text-muted">{displayJobs.length} total</span>
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

      {loading ? (
        <ListSkeleton rows={6} />
      ) : activeTab === "workflows" ? (
        <div className="space-y-3">
          {displayJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="rounded-xl border border-border bg-surface px-5 py-4 transition-all hover:border-cyan/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("rounded-lg p-2", job.enabled ? "bg-success/10" : "bg-surface-hover")}>
                    <Zap className={cn("h-4 w-4", job.enabled ? "text-success" : "text-muted")} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{job.name}</h3>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        job.enabled ? "bg-success/10 text-success" : "bg-surface-hover text-muted"
                      )}>
                        {job.enabled ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted line-clamp-1">{job.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden text-right text-xs text-muted sm:block">
                    <p>{describeCron(job.schedule)}</p>
                    <p>Last: {formatDate(job.last_run)}</p>
                  </div>
                  {job.last_status && (
                    <div className="hidden sm:block">
                      {job.last_status === "ok" ? (
                        <CheckCircle className="h-4 w-4 text-success" />
                      ) : (
                        <XCircle className="h-4 w-4 text-danger" />
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => toggleJob(job)}
                    className={cn(
                      "rounded-lg p-2 transition-colors",
                      job.enabled ? "text-muted hover:bg-warning/10 hover:text-warning" : "text-muted hover:bg-success/10 hover:text-success"
                    )}
                  >
                    {job.enabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Schedule table view */
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="px-5 py-3 text-left font-medium">Job</th>
                  <th className="px-5 py-3 text-left font-medium">Cron</th>
                  <th className="px-5 py-3 text-left font-medium">Schedule</th>
                  <th className="px-5 py-3 text-left font-medium">Last Run</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Enabled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayJobs.map((job) => (
                  <tr key={job.id} className="transition-colors hover:bg-surface-hover">
                    <td className="px-5 py-3 font-medium">{job.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{job.schedule}</td>
                    <td className="px-5 py-3 text-xs text-muted">{describeCron(job.schedule)}</td>
                    <td className="px-5 py-3 text-xs text-muted">{formatDate(job.last_run)}</td>
                    <td className="px-5 py-3">
                      {job.last_status === "ok" ? (
                        <span className="text-xs text-success">OK</span>
                      ) : job.last_status ? (
                        <span className="text-xs text-danger">{job.last_status}</span>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => toggleJob(job)}
                        className={cn(
                          "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          job.enabled ? "bg-cyan" : "bg-border"
                        )}
                      >
                        <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform", job.enabled ? "translate-x-4" : "translate-x-1")} />
                      </button>
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
