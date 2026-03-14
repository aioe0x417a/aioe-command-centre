"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { toast } from "@/lib/use-toast";
import { ListSkeleton } from "@/components/skeleton";
import {
  Plus,
  Bot,
  Clock,
  X,
  ExternalLink,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

interface ClickUpTask {
  id: string;
  name: string;
  status: string;
  priority: string | null;
  due_date: string | null;
  date_done: string | null;
  date_updated: string | null;
  assignees: string[];
  url: string;
}

type Column = "backlog" | "in_progress" | "done";

const columns: { id: Column; label: string; color: string; matchStatuses: string[] }[] = [
  { id: "backlog", label: "Queued / To Do", color: "text-cyan", matchStatuses: ["to do", "open", "backlog", "planned", "important", "important - not urgent", "urgent - not important", "urgent - not important ", "low priority"] },
  { id: "in_progress", label: "In Progress", color: "text-purple", matchStatuses: ["in progress", "working", "active", "review"] },
  { id: "done", label: "Done", color: "text-success", matchStatuses: ["done"] },
];

function getColumn(status: string): Column {
  const s = status.toLowerCase().trim();
  for (const col of columns) {
    if (col.matchStatuses.some((ms) => s.includes(ms) || ms.includes(s))) return col.id;
  }
  return "backlog";
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

export default function TasksPage() {
  // Try the new aioe-ops endpoint first, fall back to today if not available
  const { data: aioeData, error: aioeError, loading: aioeLoading, refresh: aioeRefresh } = useApi<{ list: string; tasks: ClickUpTask[] }>(
    "/api/v1/tasks/aioe-ops?include_closed=true",
    { refreshInterval: 30000 }
  );
  const { data: fallbackData, loading: fallbackLoading, refresh: fallbackRefresh } = useApi<{ list: string; tasks: ClickUpTask[] }>(
    "/api/v1/tasks/today",
    { refreshInterval: 30000, enabled: !!aioeError }
  );

  const taskData = aioeError ? fallbackData : aioeData;
  const loading = aioeError ? fallbackLoading : aioeLoading;
  const refresh = aioeError ? fallbackRefresh : aioeRefresh;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  // Hide completed/closed/cancelled tasks — ClickUp automation moves done → complete after 24h
  const hiddenStatuses = ["complete", "closed", "cancelled", "resolved"];
  const tasks = (taskData?.tasks || []).filter((t) => {
    return !hiddenStatuses.includes(t.status.toLowerCase().trim());
  });

  const addTask = async () => {
    if (!newTitle.trim()) return;
    setAddingTask(true);
    try {
      // Create in AIOE Ops list
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/api/v1/tasks?name=${encodeURIComponent(newTitle)}&list_id=901816215696`)}`, {
        method: "POST",
      });
      if (res.ok) {
        toast("Task created in AIOE Ops", "success");
        setNewTitle("");
        setShowAddForm(false);
        refresh();
      } else {
        toast("Failed to create task", "error");
      }
    } catch {
      toast("API error", "error");
    } finally {
      setAddingTask(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">AI Tasks</h1>
          <p className="text-sm text-muted">
            AIOE Ops — {tasks.length} tasks · What AIOE is working on, queued, and completed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { refresh(); toast("Refreshing...", "info"); }}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-cyan/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-cyan/80"
          >
            <Plus className="h-3.5 w-3.5" />
            Queue Task
          </button>
        </div>
      </div>

      {/* Add task form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-cyan/30 bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Queue a task for AIOE — will be created in AIOE Ops (ClickUp)..."
              autoFocus
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-cyan/30"
            />
            <button
              onClick={addTask}
              disabled={addingTask || !newTitle.trim()}
              className="rounded-lg bg-cyan px-3 py-2 text-sm font-medium text-background hover:bg-cyan/80 disabled:opacity-50"
            >
              {addingTask ? "Creating..." : "Queue"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="rounded-lg p-2 text-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <ListSkeleton key={i} rows={4} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => getColumn(t.status) === col.id);
            return (
              <div key={col.id} className="rounded-xl border border-border bg-surface">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-semibold", col.color)}>{col.label}</span>
                    <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] text-muted">{colTasks.length}</span>
                  </div>
                </div>
                <div className="min-h-[200px] max-h-[600px] space-y-2 overflow-y-auto p-3">
                  {colTasks.map((task, i) => {
                    const isAutopilot = task.name.startsWith("[AUTOPILOT]");
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className="rounded-lg border border-border bg-background p-3 transition-all hover:border-cyan/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            {col.id === "done" && <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />}
                            <p className="text-sm font-medium leading-snug">
                              {isAutopilot && (
                                <span className="mr-1.5 rounded bg-purple/10 px-1 py-0.5 text-[9px] font-bold text-purple">AUTOPILOT</span>
                              )}
                              {task.name.replace("[AUTOPILOT] ", "")}
                            </p>
                          </div>
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded p-1 text-muted transition-colors hover:text-cyan"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted">
                          <Bot className="h-3 w-3 text-cyan" />
                          <span>AIOE</span>
                          <span className="rounded bg-surface-hover px-1 py-0.5 capitalize">{task.status}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <p className="py-8 text-center text-xs text-muted">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
