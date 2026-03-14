"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  accent?: "cyan" | "purple" | "success" | "warning" | "danger";
}

const accentMap = {
  cyan: { bg: "bg-cyan/10", text: "text-cyan", glow: "glow-cyan" },
  purple: { bg: "bg-purple/10", text: "text-purple", glow: "glow-purple" },
  success: { bg: "bg-success/10", text: "text-success", glow: "" },
  warning: { bg: "bg-warning/10", text: "text-warning", glow: "" },
  danger: { bg: "bg-danger/10", text: "text-danger", glow: "" },
};

export function StatusCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent = "cyan",
}: StatusCardProps) {
  const colors = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:border-cyan/20",
        colors.glow && "hover:" + colors.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wider text-muted uppercase">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", colors.text)}>
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-success" : "text-danger"
                )}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", colors.bg)}>
          <Icon className={cn("h-5 w-5", colors.text)} />
        </div>
      </div>
    </motion.div>
  );
}
