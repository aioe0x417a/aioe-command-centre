"use client";

import { Bell, Search, User, Bot, Loader2, Cpu, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CommandPalette } from "./command-palette";

type AioeState = "idle" | "thinking" | "working" | "offline";

interface AioeStatus {
  status: AioeState;
  currentTask: string | null;
  subAgents: number;
  lastHeartbeat: string;
  model: string | null;
}

const stateConfig = {
  idle: { label: "Idle", icon: Bot, color: "text-muted", dot: "bg-muted", spin: false },
  thinking: { label: "Thinking...", icon: Loader2, color: "text-cyan", dot: "bg-cyan", spin: true },
  working: { label: "Working", icon: Cpu, color: "text-purple", dot: "bg-purple", spin: false },
  offline: { label: "Offline", icon: WifiOff, color: "text-danger", dot: "bg-danger", spin: false },
};

export function TopBar() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [aioeStatus, setAioeStatus] = useState<AioeStatus>({
    status: "idle",
    currentTask: null,
    subAgents: 0,
    lastHeartbeat: new Date().toISOString(),
    model: null,
  });

  // Poll AIOE status every 5 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/aioe-status");
        if (res.ok) {
          const data: AioeStatus = await res.json();
          setAioeStatus(data);
        }
      } catch {
        setAioeStatus((prev) => ({ ...prev, status: "offline" }));
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const config = stateConfig[aioeStatus.status];
  const StateIcon = config.icon;

  // Ctrl+K handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
        {/* Left: AIOE Status + Search */}
        <div className="flex items-center gap-4">
          {/* AIOE Status — real-time */}
          <div className={cn(
            "flex items-center gap-2.5 rounded-lg border bg-background px-3 py-1.5 transition-colors",
            aioeStatus.status === "offline" ? "border-danger/30" :
            aioeStatus.status === "working" ? "border-purple/30" :
            aioeStatus.status === "thinking" ? "border-cyan/30" :
            "border-border"
          )}>
            <div className="relative">
              <StateIcon
                className={cn(
                  "h-4 w-4",
                  config.color,
                  config.spin && "animate-spin"
                )}
              />
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-surface",
                  config.dot,
                  (aioeStatus.status === "thinking" || aioeStatus.status === "working") && "animate-pulse"
                )}
              />
            </div>
            <div className="flex flex-col">
              <span className={cn("text-xs font-semibold", config.color)}>
                AIOE {config.label}
              </span>
              {aioeStatus.currentTask && (
                <span className="max-w-[200px] truncate text-[9px] text-muted">
                  {aioeStatus.currentTask}
                </span>
              )}
              {aioeStatus.subAgents > 0 && (
                <span className="text-[9px] text-purple">
                  {aioeStatus.subAgents} sub-agent{aioeStatus.subAgents > 1 ? "s" : ""} active
                </span>
              )}
              {aioeStatus.status === "offline" && (
                <span className="text-[9px] text-danger">API unreachable</span>
              )}
              {aioeStatus.status === "idle" && !aioeStatus.currentTask && (
                <span className="text-[9px] text-muted">Waiting for tasks</span>
              )}
            </div>
            {aioeStatus.model && (
              <span className="rounded bg-purple/10 px-1.5 py-0.5 text-[9px] text-purple">
                {aioeStatus.model}
              </span>
            )}
          </div>

          {/* Search / Command Palette trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted transition-colors hover:border-cyan/30"
          >
            <Search className="h-4 w-4" />
            <span className="w-48 text-left">Search or command...</span>
            <kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-muted">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* System status */}
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-muted">All systems operational</span>
          </div>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyan" />
          </button>

          {/* User */}
          <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple/20">
              <User className="h-3 w-3 text-purple" />
            </div>
            <span className="text-sm font-medium">Azzay</span>
          </div>
        </div>
      </header>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </>
  );
}
