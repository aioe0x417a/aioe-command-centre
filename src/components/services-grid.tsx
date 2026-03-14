"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Service {
  name: string;
  status: "online" | "degraded" | "offline";
  uptime: string;
  latency?: string;
}

const services: Service[] = [
  { name: "AIOE API", status: "online", uptime: "99.9%", latency: "45ms" },
  { name: "Telegram Bot", status: "online", uptime: "99.8%", latency: "120ms" },
  { name: "n8n Workflows", status: "online", uptime: "99.5%", latency: "200ms" },
  { name: "Cloudflare Tunnel", status: "degraded", uptime: "98.2%", latency: "350ms" },
  { name: "ClickUp Sync", status: "online", uptime: "99.7%", latency: "180ms" },
  { name: "Gmail Sync", status: "online", uptime: "99.9%", latency: "90ms" },
  { name: "Invoice Pipeline", status: "online", uptime: "99.6%", latency: "250ms" },
  { name: "Trading Bots", status: "offline", uptime: "—", latency: "—" },
];

const statusConfig = {
  online: { dot: "bg-success", label: "Online", text: "text-success" },
  degraded: { dot: "bg-warning", label: "Degraded", text: "text-warning" },
  offline: { dot: "bg-danger", label: "Offline", text: "text-danger" },
};

export function ServicesGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="rounded-xl border border-border bg-surface"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-wide">Services</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span>6 online</span>
          <span className="text-border">·</span>
          <span>1 degraded</span>
          <span className="text-border">·</span>
          <span>1 offline</span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {services.map((service, i) => {
          const config = statusConfig[service.status];
          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-surface-hover"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    config.dot,
                    service.status === "online" && "animate-pulse"
                  )}
                />
                <span className="text-sm">{service.name}</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted">
                <span className={cn("font-medium", config.text)}>
                  {config.label}
                </span>
                <span className="w-12 text-right">{service.uptime}</span>
                <span className="w-14 text-right font-mono">{service.latency}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
