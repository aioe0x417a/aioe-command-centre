"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  StickyNote,
  Plus,
  Send,
  Eye,
  CheckCircle,
  Clock,
  Bot,
  X,
  Trash2,
} from "lucide-react";

type NoteStatus = "new" | "seen" | "actioned";

interface Note {
  id: string;
  content: string;
  status: NoteStatus;
  createdAt: string;
  seenAt?: string;
  actionedAt?: string;
  aiResponse?: string;
}

const initialNotes: Note[] = [
  {
    id: "n1",
    content: "Remember to include FY26/27 budget projections in the next board pack. Finance team is expecting IT capex numbers by end of March.",
    status: "actioned",
    createdAt: "2 days ago",
    seenAt: "2 days ago",
    actionedAt: "Yesterday",
    aiResponse: "Noted. I've added a budget projections section to the board pack template and will pull capex data from the ClickUp IT Expenses space when generating.",
  },
  {
    id: "n2",
    content: "Check if Ahmad's external Drive sharing is legitimate — Security flagged 12 files shared externally yesterday.",
    status: "seen",
    createdAt: "Yesterday",
    seenAt: "Yesterday",
    aiResponse: "I've reviewed the sharing activity. 8 of 12 files are in the 'Community Outreach' folder which has historically been shared externally. The other 4 are in 'Internal Docs' which is unusual. I recommend reviewing those 4 — want me to generate a detailed report?",
  },
  {
    id: "n3",
    content: "Masswera mentioned the printer on 3rd floor is jamming again. Can you create a ticket in ClickUp for Riffa'i to handle?",
    status: "actioned",
    createdAt: "Yesterday",
    seenAt: "Yesterday",
    actionedAt: "Yesterday",
    aiResponse: "Done. Created ClickUp ticket IT-258: '3rd Floor Printer Jam — Recurring Issue' assigned to Riffa'i with medium priority. Linked to previous ticket IT-231 for context.",
  },
  {
    id: "n4",
    content: "Schedule a team meeting for next Monday 10am to review Q4 IT priorities before FY26/27 starts.",
    status: "new",
    createdAt: "Just now",
  },
  {
    id: "n5",
    content: "The n8n webhook for invoice pipeline seems slow today. Can you check if there's a rate limit issue?",
    status: "new",
    createdAt: "30 min ago",
  },
];

const statusConfig = {
  new: { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "New — Pending" },
  seen: { icon: Eye, color: "text-cyan", bg: "bg-cyan/10", label: "Seen by AIOE" },
  actioned: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "Actioned" },
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState("");
  const [filterStatus, setFilterStatus] = useState<NoteStatus | "all">("all");

  const addNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `n${Date.now()}`,
      content: newNote,
      status: "new",
      createdAt: "Just now",
    };
    setNotes((prev) => [note, ...prev]);
    setNewNote("");
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = notes.filter(
    (n) => filterStatus === "all" || n.status === filterStatus
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Notes</h1>
        <p className="text-sm text-muted">
          Drop notes for AIOE to pick up — async communication without Telegram
        </p>
      </div>

      {/* Compose */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple/15 mt-0.5">
            <StickyNote className="h-4 w-4 text-purple" />
          </div>
          <div className="flex-1">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  addNote();
                }
              }}
              placeholder="Write a note for AIOE... (Enter to send, Shift+Enter for new line)"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-cyan/30 placeholder:text-muted"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-muted">
                AIOE checks for new notes every heartbeat (30 min)
              </p>
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  newNote.trim()
                    ? "bg-cyan text-background hover:bg-cyan/80"
                    : "bg-surface-hover text-muted"
                )}
              >
                <Send className="h-3 w-3" />
                Send Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
        {(["all", "new", "seen", "actioned"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all",
              filterStatus === s ? "bg-cyan/10 text-cyan" : "text-muted hover:text-foreground"
            )}
          >
            {s === "all" ? `All (${notes.length})` : `${statusConfig[s].label} (${notes.filter((n) => n.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((note) => {
            const config = statusConfig[note.status];
            const Icon = config.icon;
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border border-border bg-surface transition-all hover:border-cyan/20"
              >
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className={cn("mt-0.5 rounded-md p-1.5", config.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", config.bg, config.color)}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-muted">{note.createdAt}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">{note.content}</p>
                  </div>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* AI Response */}
                {note.aiResponse && (
                  <div className="border-t border-border bg-surface-hover/50 px-5 py-3">
                    <div className="flex items-start gap-2.5">
                      <Bot className="mt-0.5 h-4 w-4 text-cyan" />
                      <div>
                        <p className="text-[10px] font-medium text-cyan">AIOE Response</p>
                        <p className="mt-1 text-xs text-muted leading-relaxed">
                          {note.aiResponse}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
