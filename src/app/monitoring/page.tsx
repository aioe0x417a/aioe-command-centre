"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Thermometer,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";

interface MetricCard {
  label: string;
  value: string;
  unit: string;
  change: string;
  positive: boolean;
  icon: typeof Activity;
  accent: "cyan" | "purple" | "success" | "warning";
}

const systemMetrics: MetricCard[] = [
  {
    label: "CPU Usage",
    value: "34",
    unit: "%",
    change: "−8%",
    positive: true,
    icon: Cpu,
    accent: "cyan",
  },
  {
    label: "Memory",
    value: "6.2",
    unit: "GB",
    change: "+0.4 GB",
    positive: false,
    icon: MemoryStick,
    accent: "purple",
  },
  {
    label: "Disk",
    value: "142",
    unit: "GB free",
    change: "−2.1 GB",
    positive: false,
    icon: HardDrive,
    accent: "warning",
  },
  {
    label: "Temperature",
    value: "62",
    unit: "°C",
    change: "Normal",
    positive: true,
    icon: Thermometer,
    accent: "success",
  },
];

interface ApiMetric {
  endpoint: string;
  method: string;
  calls: number;
  avgLatency: string;
  errorRate: string;
  status: "healthy" | "warning" | "error";
}

const apiMetrics: ApiMetric[] = [
  { endpoint: "/chat/completions", method: "POST", calls: 247, avgLatency: "1.2s", errorRate: "0.4%", status: "healthy" },
  { endpoint: "/tools/clickup/*", method: "ALL", calls: 189, avgLatency: "340ms", errorRate: "1.1%", status: "healthy" },
  { endpoint: "/tools/google/*", method: "ALL", calls: 156, avgLatency: "280ms", errorRate: "0.2%", status: "healthy" },
  { endpoint: "/tools/microsoft/*", method: "ALL", calls: 98, avgLatency: "420ms", errorRate: "2.3%", status: "warning" },
  { endpoint: "/health", method: "GET", calls: 1440, avgLatency: "12ms", errorRate: "0%", status: "healthy" },
  { endpoint: "/webhook/n8n", method: "POST", calls: 67, avgLatency: "180ms", errorRate: "0%", status: "healthy" },
];

const uptimeData = [
  { day: "Mon", pct: 100 },
  { day: "Tue", pct: 100 },
  { day: "Wed", pct: 99.8 },
  { day: "Thu", pct: 98.2 },
  { day: "Fri", pct: 99.9 },
  { day: "Sat", pct: 100 },
  { day: "Sun", pct: 99.7 },
];

const accentMap = {
  cyan: "text-cyan bg-cyan/10",
  purple: "text-purple bg-purple/10",
  success: "text-success bg-success/10",
  warning: "text-warning bg-warning/10",
};

export default function MonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Monitoring</h1>
        <p className="text-sm text-muted">System metrics, API performance, and uptime tracking</p>
      </div>

      {/* System metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-medium tracking-wider text-muted uppercase">
                  {metric.label}
                </p>
                <div className={cn("rounded-lg p-2", accentMap[metric.accent])}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">{metric.value}</span>
                <span className="text-sm text-muted">{metric.unit}</span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs">
                {metric.positive ? (
                  <ArrowDownRight className="h-3 w-3 text-success" />
                ) : (
                  <ArrowUpRight className="h-3 w-3 text-warning" />
                )}
                <span className={metric.positive ? "text-success" : "text-warning"}>
                  {metric.change}
                </span>
                <span className="text-muted">vs last hour</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Uptime bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-xl border border-border bg-surface p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide">Weekly Uptime</h3>
          <div className="flex items-center gap-1.5 text-xs text-success">
            <TrendingUp className="h-3 w-3" />
            <span>99.7% average</span>
          </div>
        </div>
        <div className="flex items-end gap-3">
          {uptimeData.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
              <div className="relative w-full">
                <div className="h-32 w-full rounded-md bg-border/30" />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.pct / 100) * 128}px` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={cn(
                    "absolute bottom-0 w-full rounded-md",
                    d.pct >= 99.5
                      ? "bg-cyan/60"
                      : d.pct >= 99
                        ? "bg-warning/60"
                        : "bg-danger/60"
                  )}
                />
              </div>
              <span className="text-[10px] text-muted">{d.day}</span>
              <span className="text-[10px] font-mono text-foreground">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* API Performance table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-xl border border-border bg-surface"
      >
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold tracking-wide">API Performance (24h)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="px-5 py-3 text-left font-medium">Endpoint</th>
                <th className="px-5 py-3 text-left font-medium">Method</th>
                <th className="px-5 py-3 text-right font-medium">Calls</th>
                <th className="px-5 py-3 text-right font-medium">Avg Latency</th>
                <th className="px-5 py-3 text-right font-medium">Error Rate</th>
                <th className="px-5 py-3 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apiMetrics.map((api) => (
                <tr
                  key={api.endpoint}
                  className="transition-colors hover:bg-surface-hover"
                >
                  <td className="px-5 py-3 font-mono text-xs">{api.endpoint}</td>
                  <td className="px-5 py-3">
                    <span className="rounded bg-surface-hover px-1.5 py-0.5 text-xs font-medium">
                      {api.method}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-mono">{api.calls.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-mono">{api.avgLatency}</td>
                  <td className="px-5 py-3 text-right font-mono">{api.errorRate}</td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        api.status === "healthy"
                          ? "bg-success/10 text-success"
                          : api.status === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-danger/10 text-danger"
                      )}
                    >
                      {api.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
