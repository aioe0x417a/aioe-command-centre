"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Send,
  Bot,
  User,
  Paperclip,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Trash2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
}

const sampleMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "What's the status of our open ClickUp tickets this week?",
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Here's your ClickUp ticket summary for this week:\n\n**Open Tickets:** 12 total\n- 🔴 **High Priority:** 3 tickets\n  - IT-247: Firewall rule update for new VPN policy\n  - IT-251: Entra ID conditional access rollout\n  - IT-253: Email gateway migration testing\n- 🟡 **Medium Priority:** 6 tickets\n- 🟢 **Low Priority:** 3 tickets\n\n**Completed this week:** 8 tickets\n**Average resolution time:** 1.2 hours (within SLA)\n\nWant me to drill into any specific ticket or reassign priorities?",
    timestamp: new Date(Date.now() - 3500000),
    model: "claude-sonnet-4-6",
  },
  {
    id: "3",
    role: "user",
    content: "Generate the weekly IT report and send it to the CEO list",
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: "4",
    role: "assistant",
    content:
      "I've generated the Weekly IT Report for week ending 15 March 2026.\n\n**Report highlights:**\n- Service uptime: 99.7% across all systems\n- 20 tickets resolved (8 this week + 12 carried over)\n- Riffa'i onboarding: 67% complete (8/12 checklist items)\n- Invoice pipeline: 14 invoices processed automatically\n- Security: 0 incidents, patching 92% compliant\n\n✅ Report sent to CEO Weekly list (901816285268)\n✅ PDF archived to Drive IT Expenses folder\n\nAnything you'd like me to adjust before the Monday review?",
    timestamp: new Date(Date.now() - 1700000),
    model: "claude-opus-4-6",
  },
];

const modelOptions = [
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", desc: "Fast & reliable" },
  { id: "claude-opus-4-6", label: "Opus 4.6", desc: "Most capable" },
  { id: "claude-haiku-4-5", label: "Haiku 4.5", desc: "Quick lookups" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet-4-6");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate assistant response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'll look into that for you. This is a demo response — in the full version, this connects to the AIOE backend API at `api.aioe.space` for real-time processing.",
        timestamp: new Date(),
        model: selectedModel,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 1500);
  };

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold">Chat</h1>
          <p className="text-sm text-muted">Talk to AIOE — your AI operations assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:border-danger/30 hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </button>
          <div className="relative">
          <button
            onClick={() => setShowModelPicker(!showModelPicker)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-cyan/30"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple" />
            <span>{modelOptions.find((m) => m.id === selectedModel)?.label}</span>
            <ChevronDown className="h-3 w-3 text-muted" />
          </button>
          <AnimatePresence>
            {showModelPicker && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-border bg-surface p-1 shadow-xl"
              >
                {modelOptions.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelPicker(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                      selectedModel === model.id
                        ? "bg-cyan/10 text-cyan"
                        : "text-foreground hover:bg-surface-hover"
                    )}
                  >
                    <div>
                      <p className="font-medium">{model.label}</p>
                      <p className="text-xs text-muted">{model.desc}</p>
                    </div>
                    {selectedModel === model.id && (
                      <Check className="h-3.5 w-3.5 text-cyan" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto py-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan/10">
              <Bot className="h-8 w-8 text-cyan" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Start a conversation</h2>
            <p className="mt-1 max-w-sm text-sm text-muted">
              Ask AIOE anything — check ticket status, generate reports, manage users, run automations, or just chat.
            </p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "group flex gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan/10">
                  <Bot className="h-4 w-4 text-cyan" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-2xl rounded-xl px-4 py-3",
                  msg.role === "user"
                    ? "bg-purple/15 text-foreground"
                    : "border border-border bg-surface"
                )}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                </div>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="text-[10px] text-muted">
                    {msg.timestamp.toLocaleTimeString("en-SG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {msg.model && (
                      <span className="ml-2 text-purple">{msg.model}</span>
                    )}
                  </span>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="rounded p-1 text-muted hover:bg-surface-hover hover:text-foreground"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                      <button className="rounded p-1 text-muted hover:bg-surface-hover hover:text-foreground">
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple/15">
                  <User className="h-4 w-4 text-purple" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border pt-4">
        <div className="flex items-end gap-3 rounded-xl border border-border bg-surface p-3 transition-colors focus-within:border-cyan/30">
          <button className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground">
            <Paperclip className="h-4 w-4" />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AIOE anything..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "rounded-lg p-2 transition-all",
              input.trim()
                ? "bg-cyan text-background hover:bg-cyan/80"
                : "text-muted"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] text-muted">
          AIOE connects to api.aioe.space · Messages are processed by Claude
        </p>
      </div>
    </div>
  );
}
