"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { toast } from "@/lib/use-toast";
import { ListSkeleton } from "@/components/skeleton";
import {
  Server,
  RefreshCw,
  Play,
  Square,
  ExternalLink,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string;
  status: "online" | "degraded" | "offline";
  uptime: string;
  latency: string;
  lastRestart: string;
  url?: string;
  logs: string[];
}

const services: Service[] = [
  {
    id: "aioe-api",
    name: "AIOE API",
    description: "FastAPI backend — core operations engine",
    status: "online",
    uptime: "99.9%",
    latency: "45ms",
    lastRestart: "3 days ago",
    url: "https://api.aioe.space",
    logs: [
      "[15:32:01] POST /chat/completions — 200 (142ms)",
      "[15:31:45] GET /health — 200 (12ms)",
      "[15:30:22] POST /tools/clickup/tasks — 200 (340ms)",
      "[15:29:58] WebSocket connection established — session_a8f2",
    ],
  },
  {
    id: "telegram-bot",
    name: "Telegram Bot",
    description: "bot.py + launcher.py watchdog — Azzay relay",
    status: "online",
    uptime: "99.8%",
    latency: "120ms",
    lastRestart: "12 hours ago",
    logs: [
      "[15:31:50] Message received from @Azzay11 — forwarding to Claude",
      "[15:31:48] Response sent — 1,240 tokens",
      "[15:30:10] Heartbeat OK",
    ],
  },
  {
    id: "n8n",
    name: "n8n Workflows",
    description: "Self-hosted workflow automation at n8n.aioe.space",
    status: "online",
    uptime: "99.5%",
    latency: "200ms",
    lastRestart: "2 days ago",
    url: "https://n8n.aioe.space",
    logs: [
      "[15:30:00] Workflow 'Invoice Pipeline' executed — success",
      "[15:15:00] Workflow 'Gmail Sync' executed — success",
      "[15:00:00] Workflow 'Drive Monitor' executed — success",
    ],
  },
  {
    id: "cf-tunnel",
    name: "Cloudflare Tunnel",
    description: "Proxies api.aioe.space to local machine",
    status: "degraded",
    uptime: "98.2%",
    latency: "350ms",
    lastRestart: "6 hours ago",
    logs: [
      "[15:28:00] ⚠ Connection unstable — latency spike to 580ms",
      "[15:27:45] Reconnection attempt #3 — success",
      "[15:27:30] ⚠ Tunnel disconnected — reconnecting...",
      "[15:20:00] Heartbeat OK — latency 120ms",
    ],
  },
  {
    id: "clickup-sync",
    name: "ClickUp Sync",
    description: "68 API functions — tasks, spaces, comments, goals",
    status: "online",
    uptime: "99.7%",
    latency: "180ms",
    lastRestart: "1 day ago",
    logs: [
      "[15:30:00] Sync complete — 3 tasks updated",
      "[15:15:00] Webhook received — task status changed",
    ],
  },
  {
    id: "gmail-sync",
    name: "Gmail Sync",
    description: "km_gmail_sync.py — labeled emails to NotebookLM",
    status: "online",
    uptime: "99.9%",
    latency: "90ms",
    lastRestart: "5 days ago",
    logs: [
      "[15:00:00] Sync cycle — 5 new emails indexed",
      "[14:00:00] Sync cycle — 0 new emails",
    ],
  },
  {
    id: "invoice-pipeline",
    name: "Invoice Pipeline",
    description: "invoice_ingestion.py — Gmail → PDF → Drive → ClickUp",
    status: "online",
    uptime: "99.6%",
    latency: "250ms",
    lastRestart: "2 days ago",
    logs: [
      "[15:30:00] Processed 3 invoices — all filed to Drive",
      "[15:29:55] PDF extracted: INV-2026-0342 — $1,240.00",
      "[15:29:50] PDF extracted: INV-2026-0341 — $890.00",
    ],
  },
  {
    id: "trading-bots",
    name: "Trading Bots",
    description: "MT5 — botv4-xau, botv5-btc, botv6-xau, botv7-btc",
    status: "offline",
    uptime: "—",
    latency: "—",
    lastRestart: "Stopped manually",
    logs: [
      "[12:00:00] All bots stopped by user",
      "[11:59:58] botv7-btc: closed position — +$12.40",
    ],
  },
];

const statusConfig = {
  online: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
    label: "Online",
  },
  degraded: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
    label: "Degraded",
  },
  offline: {
    icon: WifiOff,
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/20",
    label: "Offline",
  },
};

export default function ServicesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Fetch real service status from API (refresh every 15s)
  const { data: liveServices, loading, refresh } = useApi<{ name: string; slug: string; running: boolean; pids: number[] }[]>(
    "/api/v1/services",
    { refreshInterval: 15000 }
  );

  // Merge live data into mock services for display
  const mergedServices = services.map((s) => {
    const live = liveServices?.find((ls) => s.name.toLowerCase().includes(ls.slug?.toLowerCase?.() || "___"));
    if (live) {
      return {
        ...s,
        status: live.running ? ("online" as const) : ("offline" as const),
      };
    }
    return s;
  });

  const onlineCount = mergedServices.filter((s) => s.status === "online").length;
  const degradedCount = mergedServices.filter((s) => s.status === "degraded").length;
  const offlineCount = mergedServices.filter((s) => s.status === "offline").length;

  const handleServiceAction = async (slug: string, action: "start" | "stop") => {
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/api/v1/services/${slug}/${action}`)}`, { method: "POST" });
      if (res.ok) {
        toast(`Service ${action}ed successfully`, "success");
        refresh();
      } else {
        toast(`Failed to ${action} service`, "error");
      }
    } catch {
      toast("API unreachable", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold">Services</h1>
          <p className="text-sm text-muted">Monitor and manage all AIOE services</p>
        </div>
        <ListSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Services</h1>
          <p className="text-sm text-muted">Monitor and manage all AIOE services</p>
        </div>
        <button
          onClick={() => { refresh(); toast("Refreshing services...", "info"); }}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm transition-colors hover:border-cyan/30 hover:bg-surface-hover"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh All
        </button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-6 rounded-xl border border-border bg-surface px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium">{onlineCount} Online</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning" />
          <span className="text-sm font-medium">{degradedCount} Degraded</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-danger" />
          <span className="text-sm font-medium">{offlineCount} Offline</span>
        </div>
        <div className="ml-auto text-xs text-muted">
          Last checked: just now
        </div>
      </div>

      {/* Service cards */}
      <div className="space-y-3">
        {services.map((service, i) => {
          const config = statusConfig[service.status];
          const StatusIcon = config.icon;
          const isExpanded = expanded === service.id;

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className={cn(
                "rounded-xl border bg-surface transition-all",
                isExpanded ? "border-cyan/30" : "border-border"
              )}
            >
              <div
                className="flex cursor-pointer items-center justify-between px-5 py-4"
                onClick={() => setExpanded(isExpanded ? null : service.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("rounded-lg p-2", config.bg)}>
                    <Server className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{service.name}</h3>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          config.bg,
                          config.color
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {service.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden items-center gap-6 text-xs text-muted sm:flex">
                    <div className="flex items-center gap-1.5">
                      <Wifi className="h-3 w-3" />
                      <span>{service.latency}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      <span>{service.uptime}</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border"
                >
                  <div className="px-5 py-4">
                    <div className="mb-4 flex items-center gap-3">
                      <button className="flex items-center gap-1.5 rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-medium text-success transition-colors hover:bg-success/20">
                        <Play className="h-3 w-3" /> Restart
                      </button>
                      <button className="flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/20">
                        <Square className="h-3 w-3" /> Stop
                      </button>
                      {service.url && (
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-cyan/30 hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" /> Open
                        </a>
                      )}
                      <span className="ml-auto text-xs text-muted">
                        Last restart: {service.lastRestart}
                      </span>
                    </div>
                    <div className="rounded-lg bg-background p-3 font-mono text-xs">
                      <p className="mb-2 text-[10px] font-sans tracking-wider text-muted uppercase">
                        Recent Logs
                      </p>
                      {service.logs.map((log, j) => (
                        <p
                          key={j}
                          className={cn(
                            "py-0.5 leading-relaxed",
                            log.includes("⚠")
                              ? "text-warning"
                              : "text-muted"
                          )}
                        >
                          {log}
                        </p>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
