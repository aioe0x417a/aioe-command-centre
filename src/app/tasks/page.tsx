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
  User,
  Clock,
  X,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface ClickUpTask {
  id: string;
  name: string;
  status: string;
  priority: string | null;
  due_date: string | null;
  assignees: string[];
  url: string;
}

// Map ClickUp Eisenhower statuses to Kanban columns
type Column = "urgent" | "important" | "delegate" | "low";

const columns: { id: Column; label: string; color: string; statuses: string[] }[] = [
  { id: "urgent", label: "Urgent & Important", color: "text-danger", statuses: ["important"] },
  { id: "important", label: "Important, Not Urgent", color: "text-cyan", statuses: ["important - not urgent"] },
  { id: "delegate", label: "Urgent, Not Important", color: "text-warning", statuses: ["urgent - not important", "urgent - not important "] },
  { id: "low", label: "Low Priority", color: "text-muted", statuses: ["low priority"] },
];

const priorityColors: Record<string, { color: string; bg: string; label: string }> = {
  urgent: { color: "text-danger", bg: "bg-danger/10", label: "Urgent" },
  high: { color: "text-warning", bg: "bg-warning/10", label: "High" },
  normal: { color: "text-cyan", bg: "bg-cyan/10", label: "Normal" },
  low: { color: "text-muted", bg: "bg-surface-hover", label: "Low" },
};

function getColumn(status: string): Column {
  const s = status.toLowerCase().trim();
  for (const col of columns) {
    if (col.statuses.includes(s)) return col.id;
  }
  return "urgent"; // default to first column
}

export default function TasksPage() {
  const { data: taskData, loading, refresh } = useApi<{ list: string; tasks: ClickUpTask[] }>(
    "/api/v1/tasks/today",
    { refreshInterval: 30000 }
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [addingTask, setAddingTask] = useState(false);

  const tasks = taskData?.tasks || [];

  const addTask = async () => {
    if (!newTitle.trim()) return;
    setAddingTask(true);
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/api/v1/tasks?name=${encodeURIComponent(newTitle)}`)}`, {
        method: "POST",
      });
      if (res.ok) {
        toast("Task created in ClickUp", "success");
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

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/api/v1/tasks/${taskId}/status`)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast("Task updated", "success");
        refresh();
      } else {
        toast("Failed to update task", "error");
      }
    } catch {
      toast("API error", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Task Board</h1>
          <p className="text-sm text-muted">
            {taskData?.list || "Daily Ops"} — {tasks.length} tasks from ClickUp
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { refresh(); toast("Refreshing tasks...", "info"); }}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-cyan/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-cyan/80"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Task
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
              placeholder="New task name — will be created in ClickUp Daily Ops..."
              autoFocus
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-cyan/30"
            />
            <button
              onClick={addTask}
              disabled={addingTask || !newTitle.trim()}
              className="rounded-lg bg-cyan px-3 py-2 text-sm font-medium text-background hover:bg-cyan/80 disabled:opacity-50"
            >
              {addingTask ? "Creating..." : "Add"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="rounded-lg p-2 text-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ListSkeleton key={i} rows={3} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
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
                <div className="min-h-[200px] space-y-2 p-3">
                  {colTasks.map((task, i) => {
                    const pConfig = priorityColors[task.priority || "normal"] || priorityColors.normal;
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className="rounded-lg border border-border bg-background p-3 transition-all hover:border-cyan/20"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">{task.name}</p>
                          <span className={cn("shrink-0 rounded px-1 py-0.5 text-[9px] font-medium", pConfig.bg, pConfig.color)}>
                            {pConfig.label}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-muted">
                            {task.assignees.length > 0 ? (
                              <>
                                <User className="h-3 w-3 text-purple" />
                                <span>{task.assignees[0]}</span>
                              </>
                            ) : (
                              <>
                                <Bot className="h-3 w-3 text-cyan" />
                                <span>Unassigned</span>
                              </>
                            )}
                          </div>
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1 text-muted transition-colors hover:text-cyan"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {/* Quick move buttons */}
                        <div className="mt-2 flex gap-1">
                          {columns
                            .filter((c) => c.id !== col.id)
                            .map((c) => (
                              <button
                                key={c.id}
                                onClick={() => updateStatus(task.id, c.statuses[0])}
                                className={cn("rounded px-1.5 py-0.5 text-[9px] transition-colors hover:bg-surface-hover", c.color)}
                                title={`Move to ${c.label}`}
                              >
                                → {c.label.split(",")[0]}
                              </button>
                            ))}
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
