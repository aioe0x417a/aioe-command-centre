"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { toast } from "@/lib/use-toast";
import { ListSkeleton } from "@/components/skeleton";
import {
  StickyNote,
  Send,
  Pin,
  Clock,
  Trash2,
} from "lucide-react";

interface Note {
  id: string;
  text: string;
  pinned: boolean;
  created_at: string;
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  return d.toLocaleDateString("en-SG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function NotesPage() {
  const [newNote, setNewNote] = useState("");
  const { data: notes, loading, refresh } = useApi<Note[]>("/api/v1/notes", { refreshInterval: 15000 });

  const addNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent("/api/v1/notes")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newNote }),
      });
      if (res.ok) {
        toast("Note created", "success");
        setNewNote("");
        refresh();
      } else {
        toast("Failed to create note", "error");
      }
    } catch {
      toast("API error", "error");
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/api/v1/notes/${id}`)}`, { method: "DELETE" });
      if (res.ok || res.status === 204) {
        toast("Note deleted", "info");
        refresh();
      } else {
        toast("Failed to delete", "error");
      }
    } catch {
      toast("API error", "error");
    }
  };

  const togglePin = async (note: Note) => {
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(`/api/v1/notes/${note.id}`)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !note.pinned }),
      });
      if (res.ok) {
        toast(note.pinned ? "Unpinned" : "Pinned", "info");
        refresh();
      }
    } catch {
      toast("API error", "error");
    }
  };

  const displayNotes = notes || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Notes</h1>
        <p className="text-sm text-muted">
          Drop notes for AIOE to pick up — synced with the backend in real-time
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
                Notes are stored on the AIOE backend and checked on every heartbeat
              </p>
              <button
                onClick={addNote}
                disabled={!newNote.trim()}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  newNote.trim() ? "bg-cyan text-background hover:bg-cyan/80" : "bg-surface-hover text-muted"
                )}
              >
                <Send className="h-3 w-3" />
                Send Note
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notes list */}
      {loading ? (
        <ListSkeleton rows={4} />
      ) : displayNotes.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-12 text-center">
          <StickyNote className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-sm text-muted">No notes yet — write one above</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {displayNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "rounded-xl border bg-surface transition-all hover:border-cyan/20",
                  note.pinned ? "border-cyan/30" : "border-border"
                )}
              >
                <div className="flex items-start gap-3 px-5 py-4">
                  <div className={cn("mt-0.5 rounded-md p-1.5", note.pinned ? "bg-cyan/10" : "bg-surface-hover")}>
                    {note.pinned ? <Pin className="h-3.5 w-3.5 text-cyan" /> : <StickyNote className="h-3.5 w-3.5 text-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.text}</p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatDate(note.created_at)}</span>
                      {note.pinned && <span className="rounded-full bg-cyan/10 px-1.5 py-0.5 text-cyan">Pinned</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePin(note)}
                      className={cn(
                        "rounded-lg p-1.5 transition-colors",
                        note.pinned ? "text-cyan hover:bg-cyan/10" : "text-muted hover:bg-surface-hover hover:text-foreground"
                      )}
                    >
                      <Pin className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="rounded-lg p-1.5 text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
