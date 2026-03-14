"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bug,
  Fingerprint,
  Globe,
  ArrowRight,
} from "lucide-react";

interface SecurityScore {
  category: string;
  score: number;
  maxScore: number;
  status: "good" | "warning" | "critical";
  details: string;
}

const securityScores: SecurityScore[] = [
  { category: "Identity & Access", score: 82, maxScore: 100, status: "good", details: "MFA enabled for 6/8 users" },
  { category: "Endpoint Protection", score: 65, maxScore: 100, status: "warning", details: "2 devices non-compliant, 1 unencrypted" },
  { category: "Patch Compliance", score: 92, maxScore: 100, status: "good", details: "92% of devices patched within SLA" },
  { category: "Email Security", score: 88, maxScore: 100, status: "good", details: "SPF, DKIM, DMARC configured" },
  { category: "Data Protection", score: 55, maxScore: 100, status: "critical", details: "DLP policies not yet configured" },
  { category: "Network Security", score: 78, maxScore: 100, status: "warning", details: "Firewall rules under review" },
];

interface SecurityAlert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  source: string;
  time: string;
  acknowledged: boolean;
}

const alerts: SecurityAlert[] = [
  { id: "SA-001", severity: "high", title: "Failed login attempts detected — siti@mtfa.org (5 attempts)", source: "Entra ID", time: "1 hour ago", acknowledged: false },
  { id: "SA-002", severity: "medium", title: "Conditional access policy bypass — legacy auth protocol", source: "Entra ID", time: "3 hours ago", acknowledged: false },
  { id: "SA-003", severity: "low", title: "New device enrolled — NAZ-LAPTOP-01", source: "Intune", time: "6 hours ago", acknowledged: true },
  { id: "SA-004", severity: "medium", title: "Unusual Google Drive sharing activity — ahmad@mtfa.org shared 12 files externally", source: "Google Workspace", time: "Yesterday", acknowledged: false },
  { id: "SA-005", severity: "critical", title: "Windows 10 End-of-Life — 3 devices still running Win10", source: "Intune", time: "2 days ago", acknowledged: true },
  { id: "SA-006", severity: "low", title: "SSL certificate renewal due in 14 days — api.aioe.space", source: "Cloudflare", time: "2 days ago", acknowledged: true },
];

const severityConfig = {
  critical: { color: "text-danger", bg: "bg-danger/10", border: "border-danger/20", icon: XCircle },
  high: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20", icon: AlertTriangle },
  medium: { color: "text-cyan", bg: "bg-cyan/10", border: "border-cyan/20", icon: Eye },
  low: { color: "text-muted", bg: "bg-surface-hover", border: "border-border", icon: CheckCircle },
};

const complianceChecks = [
  { name: "MFA Enforcement", status: true, note: "6/8 users — 2 pending" },
  { name: "Conditional Access", status: true, note: "3 policies active" },
  { name: "Device Encryption", status: false, note: "5/7 encrypted" },
  { name: "Password Policy", status: true, note: "Complexity + 90-day rotation" },
  { name: "Admin MFA", status: true, note: "All admins enforced" },
  { name: "DLP Policies", status: false, note: "Not configured" },
  { name: "Audit Logging", status: true, note: "Entra + Google enabled" },
  { name: "Backup Verification", status: true, note: "Weekly tested" },
];

export default function SecurityPage() {
  const overallScore = Math.round(
    securityScores.reduce((sum, s) => sum + s.score, 0) / securityScores.length
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Security</h1>
        <p className="text-sm text-muted">Security posture, alerts, and compliance tracking</p>
      </div>

      {/* Overall score + score cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center rounded-xl border border-border bg-surface p-6"
        >
          <div className="relative flex h-28 w-28 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" fill="none" className="text-border" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${overallScore * 2.64} 264`}
                strokeLinecap="round"
                className={
                  overallScore >= 80 ? "text-success" : overallScore >= 60 ? "text-warning" : "text-danger"
                }
              />
            </svg>
            <span className="absolute text-2xl font-bold">{overallScore}</span>
          </div>
          <p className="mt-3 text-sm font-medium">Security Score</p>
          <p className="text-xs text-muted">Across 6 categories</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-3">
          {securityScores.map((score, i) => (
            <motion.div
              key={score.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted">{score.category}</p>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    score.status === "good"
                      ? "bg-success/10 text-success"
                      : score.status === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-danger/10 text-danger"
                  )}
                >
                  {score.score}%
                </span>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score.score}%` }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                  className={cn(
                    "h-full rounded-full",
                    score.status === "good"
                      ? "bg-success"
                      : score.status === "warning"
                        ? "bg-warning"
                        : "bg-danger"
                  )}
                />
              </div>
              <p className="mt-2 text-[10px] text-muted">{score.details}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Alerts */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-xl border border-border bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="text-sm font-semibold tracking-wide">Security Alerts</h3>
              <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-medium text-danger">
                {alerts.filter((a) => !a.acknowledged).length} unacknowledged
              </span>
            </div>
            <div className="divide-y divide-border">
              {alerts.map((alert) => {
                const config = severityConfig[alert.severity];
                const Icon = config.icon;
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-surface-hover",
                      !alert.acknowledged && "bg-surface-hover/50"
                    )}
                  >
                    <div className={cn("mt-0.5 rounded-md p-1.5", config.bg)}>
                      <Icon className={cn("h-3.5 w-3.5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{alert.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                        <span className={cn("rounded px-1 py-0.5 text-[10px] font-medium uppercase", config.bg, config.color)}>
                          {alert.severity}
                        </span>
                        <span>{alert.source}</span>
                        <span>·</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <button className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground">
                        Ack
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Compliance checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-xl border border-border bg-surface"
        >
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold tracking-wide">Compliance Checks</h3>
          </div>
          <div className="divide-y divide-border">
            {complianceChecks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-surface-hover"
              >
                <div className="flex items-center gap-3">
                  {check.status ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-danger" />
                  )}
                  <div>
                    <p className="text-sm">{check.name}</p>
                    <p className="text-[10px] text-muted">{check.note}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
