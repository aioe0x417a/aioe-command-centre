"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { ListSkeleton } from "@/components/skeleton";
import {
  ScrollText,
  Search,
  Filter,
  MessageSquare,
  Zap,
  FileText,
  Shield,
  Server,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Bot,
  Send,
  Database,
  Globe,
} from "lucide-react";

type LogType = "chat" | "automation" | "tool" | "document" | "security" | "system" | "task";

interface LogEntry {
  id: string;
  timestamp: string;
  type: LogType;
  action: string;
  detail: string;
  model?: string;
  duration?: string;
  status: "success" | "warning" | "error" | "info";
}

const mockLog: LogEntry[] = [
  { id: "1", timestamp: "15:32:01", type: "chat", action: "Message processed", detail: "Responded to query about ClickUp ticket status", model: "claude-sonnet-4-6", duration: "2.3s", status: "success" },
  { id: "2", timestamp: "15:30:00", type: "automation", action: "Invoice Pipeline executed", detail: "Processed 3 invoices — INV-0341, INV-0342, INV-0343 filed to Drive", duration: "12.4s", status: "success" },
  { id: "3", timestamp: "15:28:45", type: "tool", action: "ClickUp API call", detail: "GET /tasks — retrieved 12 open tickets for weekly summary", duration: "340ms", status: "success" },
  { id: "4", timestamp: "15:27:30", type: "system", action: "Cloudflare Tunnel reconnect", detail: "Connection dropped — automatic reconnection attempt #3 succeeded", duration: "4.2s", status: "warning" },
  { id: "5", timestamp: "15:15:00", type: "automation", action: "KM Gmail Sync executed", detail: "5 new labeled emails indexed to NotebookLM notebooks", duration: "8.1s", status: "success" },
  { id: "6", timestamp: "15:00:00", type: "system", action: "Heartbeat check", detail: "All services healthy — checked notes (0 new), synced dashboard, verified automations", duration: "1.8s", status: "success" },
  { id: "7", timestamp: "14:45:01", type: "automation", action: "ClickUp Sync executed", detail: "Bidirectional sync — 3 tasks updated, 1 new task created", duration: "1.9s", status: "success" },
  { id: "8", timestamp: "14:30:00", type: "document", action: "Report generated", detail: "Weekly IT Report — sent to CEO Weekly list (901816285268)", model: "claude-opus-4-6", duration: "34.2s", status: "success" },
  { id: "9", timestamp: "14:22:15", type: "chat", action: "Telegram relay", detail: "Processed voice note from @Azzay11 — transcribed and responded", model: "claude-sonnet-4-6", duration: "5.1s", status: "success" },
  { id: "10", timestamp: "14:15:00", type: "tool", action: "Google Workspace API", detail: "Listed 8 users in mtfa.org — MFA audit check completed", duration: "280ms", status: "success" },
  { id: "11", timestamp: "14:00:00", type: "system", action: "Heartbeat check", detail: "All services healthy — checked notes (1 new → actioned), synced dashboard", duration: "2.1s", status: "success" },
  { id: "12", timestamp: "13:45:00", type: "task", action: "Task completed", detail: "Moved 'Generate board pack template' from In Progress to Done", status: "success" },
  { id: "13", timestamp: "13:30:00", type: "security", action: "Security scan", detail: "Entra ID audit — detected 5 failed login attempts on siti@mtfa.org", duration: "6.8s", status: "warning" },
  { id: "14", timestamp: "13:22:00", type: "tool", action: "Microsoft Graph API", detail: "GET /users — pulled device compliance report from Intune", duration: "420ms", status: "success" },
  { id: "15", timestamp: "13:00:00", type: "system", action: "Heartbeat check", detail: "Cloudflare Tunnel degraded — latency 350ms — monitoring", duration: "1.5s", status: "warning" },
  { id: "16", timestamp: "12:30:00", type: "automation", action: "KM Drive Sync failed", detail: "Drive API rate limit exceeded — will retry on next heartbeat", duration: "45.0s", status: "error" },
  { id: "17", timestamp: "12:00:00", type: "task", action: "Task picked up", detail: "Started working on 'Generate board pack template' from backlog", status: "info" },
  { id: "18", timestamp: "08:00:00", type: "automation", action: "Daily Briefing sent", detail: "Morning summary delivered to Telegram — AI news, ClickUp tasks, calendar", model: "claude-sonnet-4-6", duration: "28.5s", status: "success" },
];

const typeConfig: Record<LogType, { icon: typeof Bot; color: string; bg: string; label: string }> = {
  chat: { icon: MessageSquare, color: "text-cyan", bg: "bg-cyan/10", label: "Chat" },
  automation: { icon: Zap, color: "text-purple", bg: "bg-purple/10", label: "Automation" },
  tool: { icon: Globe, color: "text-foreground", bg: "bg-surface-hover", label: "Tool" },
  document: { icon: FileText, color: "text-success", bg: "bg-success/10", label: "Document" },
  security: { icon: Shield, color: "text-warning", bg: "bg-warning/10", label: "Security" },
  system: { icon: Server, color: "text-muted", bg: "bg-surface-hover", label: "System" },
  task: { icon: CheckCircle, color: "text-cyan", bg: "bg-cyan/10", label: "Task" },
};

const statusColors = {
  success: "text-success",
  warning: "text-warning",
  error: "text-danger",
  info: "text-cyan",
};

export default function ActivityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<LogType | "all">("all");

  // Fetch real bot logs
  const { data: logData, loading } = useApi<{ source: string; lines: string[] }>(
    "/api/v1/system/logs?source=bot&lines=200",
    { refreshInterval: 15000 }
  );

  // Convert real log lines to activity entries
  const realEntries: LogEntry[] = (logData?.lines || [])
    .filter((line) => line.trim().length > 0)
    .map((line, i) => {
      const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
      const isError = /error|fail|exception/i.test(line);
      const isWarning = /warn|⚠|retry|timeout|rate.limit/i.test(line);
      const isChat = /message from|response sent|telegram|forwarding/i.test(line);
      const isAutomation = /workflow|pipeline|sync|schedule|cron|heartbeat|invoice/i.test(line);
      const isSecurity = /security|audit|login|mfa|password/i.test(line);
      const isTask = /task|clickup|ticket/i.test(line);
      const type: LogType = isError ? "system" : isSecurity ? "security" : isChat ? "chat" : isAutomation ? "automation" : isTask ? "task" : isWarning ? "system" : "tool";
      const status = isError ? "error" as const : isWarning ? "warning" as const : "success" as const;
      return {
        id: `real-${i}`,
        timestamp: timeMatch?.[1] || "",
        type,
        action: line.replace(/^\d{4}-\d{2}-\d{2}\s+/, "").replace(/\d{2}:\d{2}:\d{2}[,.\d]*\s*/, "").replace(/\[.*?\]\s*/, "").slice(0, 80),
        detail: line,
        status,
      };
    })
    .reverse(); // newest first

  const displayLog = realEntries.length > 0 ? realEntries : mockLog;

  const filtered = displayLog.filter((entry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.detail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || entry.type === filterType;
    return matchesSearch && matchesType;
  });

  const typeFilters: (LogType | "all")[] = ["all", "chat", "automation", "tool", "document", "security", "system", "task"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Activity Log</h1>
        <p className="text-sm text-muted">Everything AIOE has done — chronological, searchable, auditable</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus-within:border-cyan/30">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                filterType === t ? "bg-cyan/10 text-cyan" : "text-muted hover:text-foreground"
              )}
            >
              {t === "all" ? "All" : typeConfig[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 rounded-xl border border-border bg-surface px-5 py-3 text-xs">
        <span className="text-muted">Log:</span>
        <span className="text-success">{displayLog.filter((e) => e.status === "success").length} successful</span>
        <span className="text-warning">{displayLog.filter((e) => e.status === "warning").length} warnings</span>
        <span className="text-danger">{displayLog.filter((e) => e.status === "error").length} errors</span>
        <span className="ml-auto text-muted">{displayLog.length} entries {realEntries.length > 0 ? "(live)" : "(mock)"}</span>
      </div>

      {/* Log entries */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="divide-y divide-border">
          {filtered.map((entry, i) => {
            const config = typeConfig[entry.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
                className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface-hover"
              >
                <div className={cn("mt-0.5 rounded-md p-1.5", config.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-medium", statusColors[entry.status])}>
                      {entry.action}
                    </span>
                    <span className={cn("rounded px-1 py-0.5 text-[9px] font-medium uppercase", config.bg, config.color)}>
                      {config.label}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted leading-relaxed">{entry.detail}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-muted">
                    <span className="font-mono">{entry.timestamp}</span>
                    {entry.model && <span className="text-purple">{entry.model}</span>}
                    {entry.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {entry.duration}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
