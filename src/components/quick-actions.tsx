"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Send,
  FileText,
  UserPlus,
  RefreshCw,
  BarChart3,
  Database,
} from "lucide-react";

const actions = [
  {
    icon: Send,
    label: "Send Report",
    description: "Generate & send weekly IT report",
    accent: "cyan" as const,
  },
  {
    icon: FileText,
    label: "New SOP",
    description: "Create a new standard operating procedure",
    accent: "purple" as const,
  },
  {
    icon: UserPlus,
    label: "Onboard User",
    description: "Google Workspace account lifecycle",
    accent: "cyan" as const,
  },
  {
    icon: RefreshCw,
    label: "Sync Data",
    description: "Trigger Gmail & Drive sync to KM",
    accent: "purple" as const,
  },
  {
    icon: BarChart3,
    label: "View Metrics",
    description: "ITSM dashboard & ticket analytics",
    accent: "cyan" as const,
  },
  {
    icon: Database,
    label: "Query Data",
    description: "BigQuery data platform explorer",
    accent: "purple" as const,
  },
];

const accentStyles = {
  cyan: "border-cyan/20 hover:border-cyan/40 hover:bg-cyan/5",
  purple: "border-purple/20 hover:border-purple/40 hover:bg-purple/5",
};

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl border border-border bg-surface"
    >
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold tracking-wide">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4">
        {actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
            className={cn(
              "flex items-start gap-3 rounded-lg border bg-transparent p-3 text-left transition-all duration-200",
              accentStyles[action.accent]
            )}
          >
            <action.icon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                action.accent === "cyan" ? "text-cyan" : "text-purple"
              )}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">
                {action.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
