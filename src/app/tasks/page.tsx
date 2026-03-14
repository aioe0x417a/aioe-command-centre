"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Plus,
  Bot,
  User,
  Clock,
  X,
} from "lucide-react";

type Column = "backlog" | "todo" | "in_progress" | "done";
type Priority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: string;
  title: string;
  description?: string;
  column: Column;
  priority: Priority;
  assignee: "azzay" | "aioe";
  createdAt: string;
  updatedAt?: string;
}

const initialTasks: Task[] = [
  { id: "t1", title: "Set up DLP policies in Google Workspace", description: "Data protection score is at 55% — need DLP configured", column: "backlog", priority: "high", assignee: "aioe", createdAt: "2 days ago" },
  { id: "t2", title: "Audit Win10 devices for upgrade path", description: "3 devices still on Windows 10 EOL", column: "backlog", priority: "urgent", assignee: "aioe", createdAt: "3 days ago" },
  { id: "t3", title: "Build KM notebook for cybersecurity domain", column: "backlog", priority: "medium", assignee: "aioe", createdAt: "1 week ago" },
  { id: "t4", title: "Generate monthly board pack for March", description: "FY25/26 wrap-up — due before 1 April", column: "todo", priority: "high", assignee: "aioe", createdAt: "Today" },
  { id: "t5", title: "Review Riffa'i onboarding checklist", description: "8/12 items complete — follow up on remaining", column: "todo", priority: "medium", assignee: "azzay", createdAt: "Today" },
  { id: "t6", title: "Update firewall rules for new VPN policy", column: "in_progress", priority: "high", assignee: "aioe", createdAt: "Yesterday", updatedAt: "30 min ago" },
  { id: "t7", title: "Process March invoice batch", description: "14 invoices queued from Gmail", column: "in_progress", priority: "medium", assignee: "aioe", createdAt: "Today", updatedAt: "15 min ago" },
  { id: "t8", title: "Weekly IT report — Week 11", column: "done", priority: "medium", assignee: "aioe", createdAt: "Today", updatedAt: "2 hours ago" },
  { id: "t9", title: "Entra ID conditional access rollout", column: "done", priority: "high", assignee: "azzay", createdAt: "3 days ago", updatedAt: "Yesterday" },
  { id: "t10", title: "Gmail → NotebookLM sync pipeline", column: "done", priority: "low", assignee: "aioe", createdAt: "5 days ago", updatedAt: "4 days ago" },
];

const columns: { id: Column; label: string; color: string }[] = [
  { id: "backlog", label: "Backlog", color: "text-muted" },
  { id: "todo", label: "To Do", color: "text-cyan" },
  { id: "in_progress", label: "In Progress", color: "text-purple" },
  { id: "done", label: "Done", color: "text-success" },
];

const priorityConfig: Record<Priority, { color: string; bg: string; label: string }> = {
  low: { color: "text-muted", bg: "bg-surface-hover", label: "Low" },
  medium: { color: "text-cyan", bg: "bg-cyan/10", label: "Med" },
  high: { color: "text-warning", bg: "bg-warning/10", label: "High" },
  urgent: { color: "text-danger", bg: "bg-danger/10", label: "Urgent" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");

  // Drag state
  const dragItem = useRef<{ taskId: string; fromCol: Column; fromIdx: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ col: Column; idx: number } | null>(null);

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: `t${Date.now()}`,
      title: newTitle,
      column: "todo",
      priority: newPriority,
      assignee: "aioe",
      createdAt: "Just now",
    };
    setTasks((prev) => [...prev, task]);
    setNewTitle("");
    setShowAddForm(false);
  };

  const getColumnTasks = (col: Column) => tasks.filter((t) => t.column === col);

  const handleDragStart = (taskId: string, col: Column, idx: number) => {
    dragItem.current = { taskId, fromCol: col, fromIdx: idx };
  };

  const handleDragOverCard = (e: React.DragEvent, col: Column, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ col, idx });
  };

  const handleDragOverColumn = (e: React.DragEvent, col: Column) => {
    e.preventDefault();
    // Only set drop target to end of column if not hovering over a card
    const colTasks = getColumnTasks(col);
    setDropTarget({ col, idx: colTasks.length });
  };

  const handleDrop = (targetCol: Column, targetIdx: number) => {
    if (!dragItem.current) return;
    const { taskId } = dragItem.current;

    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      // Remove dragged task
      const without = prev.filter((t) => t.id !== taskId);
      const updatedTask = { ...task, column: targetCol, updatedAt: "Just now" };

      // Get tasks in the target column (after removal)
      const colTasks = without.filter((t) => t.column === targetCol);
      const otherTasks = without.filter((t) => t.column !== targetCol);

      // Insert at position
      const clampedIdx = Math.min(targetIdx, colTasks.length);
      colTasks.splice(clampedIdx, 0, updatedTask);

      return [...otherTasks, ...colTasks];
    });

    dragItem.current = null;
    setDropTarget(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDropTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Task Board</h1>
          <p className="text-sm text-muted">Queue work for AIOE — drag tasks between and within columns</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-cyan/80"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </button>
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
              placeholder="What should AIOE work on?"
              autoFocus
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-cyan/30"
            />
            <div className="flex gap-1">
              {(Object.keys(priorityConfig) as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-medium transition-all",
                    newPriority === p
                      ? cn(priorityConfig[p].bg, priorityConfig[p].color)
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
            <button
              onClick={addTask}
              className="rounded-lg bg-cyan px-3 py-2 text-sm font-medium text-background hover:bg-cyan/80"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-lg p-2 text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {columns.map((col) => {
          const colTasks = getColumnTasks(col.id);
          return (
            <div
              key={col.id}
              className="rounded-xl border border-border bg-surface"
              onDragOver={(e) => handleDragOverColumn(e, col.id)}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(col.id, colTasks.length);
              }}
            >
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-semibold", col.color)}>
                    {col.label}
                  </span>
                  <span className="rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] text-muted">
                    {colTasks.length}
                  </span>
                </div>
              </div>
              <div className="min-h-[200px] space-y-2 p-3">
                {colTasks.map((task, i) => {
                  const pConfig = priorityConfig[task.priority];
                  const isDropHere =
                    dropTarget?.col === col.id && dropTarget?.idx === i;

                  return (
                    <div key={task.id}>
                      {/* Drop indicator line */}
                      {isDropHere && (
                        <div className="mb-1 h-0.5 rounded-full bg-cyan" />
                      )}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        draggable
                        onDragStart={() => handleDragStart(task.id, col.id, i)}
                        onDragOver={(e) => handleDragOverCard(e, col.id, i)}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDrop(col.id, i);
                        }}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "cursor-grab rounded-lg border border-border bg-background p-3 transition-all hover:border-cyan/20 active:cursor-grabbing",
                          dragItem.current?.taskId === task.id && "opacity-40"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium leading-snug">{task.title}</p>
                          <span className={cn("shrink-0 rounded px-1 py-0.5 text-[9px] font-medium", pConfig.bg, pConfig.color)}>
                            {pConfig.label}
                          </span>
                        </div>
                        {task.description && (
                          <p className="mt-1.5 text-xs text-muted leading-relaxed">{task.description}</p>
                        )}
                        <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
                          <div className="flex items-center gap-1">
                            {task.assignee === "aioe" ? (
                              <Bot className="h-3 w-3 text-cyan" />
                            ) : (
                              <User className="h-3 w-3 text-purple" />
                            )}
                            <span>{task.assignee === "aioe" ? "AIOE" : "Azzay"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            <span>{task.updatedAt || task.createdAt}</span>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
                {/* Drop indicator at end of column */}
                {dropTarget?.col === col.id && dropTarget?.idx === colTasks.length && (
                  <div className="mt-1 h-0.5 rounded-full bg-cyan" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
