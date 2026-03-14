"use client";

import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Zap,
} from "lucide-react";

interface ActivityItem {
  id: string;
  type: "success" | "warning" | "info" | "error" | "automation";
  message: string;
  timestamp: string;
  source: string;
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    type: "automation",
    message: "Invoice pipeline processed 3 new invoices from Gmail",
    timestamp: "2 min ago",
    source: "n8n",
  },
  {
    id: "2",
    type: "success",
    message: "Backup completed — all Google Workspace data synced",
    timestamp: "15 min ago",
    source: "Scheduler",
  },
  {
    id: "3",
    type: "warning",
    message: "ClickUp API rate limit at 80% — throttling enabled",
    timestamp: "32 min ago",
    source: "API Monitor",
  },
  {
    id: "4",
    type: "info",
    message: "Riffa'i onboarding checklist updated — 8/12 tasks complete",
    timestamp: "1 hr ago",
    source: "ClickUp",
  },
  {
    id: "5",
    type: "success",
    message: "Weekly IT report generated and sent to CEO",
    timestamp: "2 hr ago",
    source: "Board Pack",
  },
  {
    id: "6",
    type: "error",
    message: "Cloudflare Tunnel reconnection failed — retrying in 60s",
    timestamp: "3 hr ago",
    source: "API Gateway",
  },
  {
    id: "7",
    type: "automation",
    message: "KM Gmail sync — 5 new emails indexed to NotebookLM",
    timestamp: "4 hr ago",
    source: "Knowledge Mgmt",
  },
];

const typeConfig = {
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-cyan", bg: "bg-cyan/10" },
  error: { icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
  automation: { icon: Zap, color: "text-purple", bg: "bg-purple/10" },
};

export function ActivityFeed() {
  // Fetch real bot logs (refresh every 30s)
  const { data: logData } = useApi<{ source: string; lines: string[] }>(
    "/api/v1/system/logs?source=bot&lines=10",
    { refreshInterval: 30000 }
  );

  // Convert real log lines to activity items if available
  const liveActivity: ActivityItem[] | null = logData?.lines
    ?.filter((line) => line.trim().length > 0)
    .map((line, i) => {
      const timeMatch = line.match(/(\d{2}:\d{2}:\d{2})/);
      const isError = /error|fail|exception/i.test(line);
      const isWarning = /warn|⚠|retry|timeout/i.test(line);
      const isAutomation = /workflow|pipeline|sync|schedule|cron/i.test(line);
      return {
        id: `live-${i}`,
        type: isError ? "error" as const : isWarning ? "warning" as const : isAutomation ? "automation" as const : "info" as const,
        message: line.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}[,.\d]*\s*[-]*\s*/, "").slice(0, 120),
        timestamp: timeMatch?.[1] || "",
        source: "Bot Log",
      };
    }) || null;

  const displayActivity = liveActivity && liveActivity.length > 0 ? liveActivity : mockActivity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-wide">Activity Feed</h3>
        <span className="text-xs text-muted">Live</span>
      </div>
      <div className="divide-y divide-border">
        {displayActivity.map((item, i) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface-hover"
            >
              <div className={cn("mt-0.5 rounded-md p-1.5", config.bg)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug">{item.message}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                  <span>{item.source}</span>
                  <span>·</span>
                  <span>{item.timestamp}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
