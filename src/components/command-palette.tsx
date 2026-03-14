"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  MessageSquare,
  Server,
  Activity,
  Users,
  Shield,
  Zap,
  Settings,
  FileText,
  ListTodo,
  StickyNote,
  ScrollText,
  Send,
  UserPlus,
  RefreshCw,
  BarChart3,
  ArrowRight,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  action: () => void;
  category: "navigation" | "action" | "search";
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const commands: CommandItem[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, category: "navigation", action: () => navigate("/") },
    { id: "activity", label: "Activity Log", icon: ScrollText, category: "navigation", action: () => navigate("/activity") },
    { id: "chat", label: "Chat", icon: MessageSquare, category: "navigation", action: () => navigate("/chat") },
    { id: "tasks", label: "Task Board", icon: ListTodo, category: "navigation", action: () => navigate("/tasks") },
    { id: "notes", label: "Notes", icon: StickyNote, category: "navigation", action: () => navigate("/notes") },
    { id: "documents", label: "Documents", icon: FileText, category: "navigation", action: () => navigate("/documents") },
    { id: "services", label: "Services", icon: Server, category: "navigation", action: () => navigate("/services") },
    { id: "monitoring", label: "Monitoring", icon: Activity, category: "navigation", action: () => navigate("/monitoring") },
    { id: "it-ops", label: "IT Operations", icon: Users, category: "navigation", action: () => navigate("/it-ops") },
    { id: "security", label: "Security", icon: Shield, category: "navigation", action: () => navigate("/security") },
    { id: "automations", label: "Automations", icon: Zap, category: "navigation", action: () => navigate("/automations") },
    { id: "settings", label: "Settings", icon: Settings, category: "navigation", action: () => navigate("/settings") },
    { id: "send-report", label: "Send Weekly IT Report", description: "Generate and send to CEO", icon: Send, category: "action", action: () => onClose() },
    { id: "onboard", label: "Onboard User", description: "Start GWS account lifecycle", icon: UserPlus, category: "action", action: () => navigate("/it-ops") },
    { id: "sync", label: "Sync All Data", description: "Trigger Gmail & Drive sync", icon: RefreshCw, category: "action", action: () => onClose() },
    { id: "metrics", label: "View Metrics", description: "Open monitoring dashboard", icon: BarChart3, category: "action", action: () => navigate("/monitoring") },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = {
    navigation: filtered.filter((c) => c.category === "navigation"),
    action: filtered.filter((c) => c.category === "action"),
  };

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && filtered.length > 0) {
      filtered[0].action();
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        {/* Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <kbd className="rounded bg-background px-1.5 py-0.5 text-[10px] text-muted">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {grouped.navigation.length > 0 && (
              <div>
                <p className="px-2 py-1.5 text-[10px] font-medium tracking-wider text-muted uppercase">
                  Pages
                </p>
                {grouped.navigation.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-cyan/10 hover:text-cyan"
                  >
                    <cmd.icon className="h-4 w-4 text-muted" />
                    <span>{cmd.label}</span>
                    <ArrowRight className="ml-auto h-3 w-3 text-muted opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {grouped.action.length > 0 && (
              <div className="mt-1">
                <p className="px-2 py-1.5 text-[10px] font-medium tracking-wider text-muted uppercase">
                  Actions
                </p>
                {grouped.action.map((cmd) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-purple/10 hover:text-purple"
                  >
                    <cmd.icon className="h-4 w-4 text-muted" />
                    <div className="text-left">
                      <p>{cmd.label}</p>
                      {cmd.description && (
                        <p className="text-xs text-muted">{cmd.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-muted">
                No results for &ldquo;{query}&rdquo;
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
