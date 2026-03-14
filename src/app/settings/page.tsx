"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useThemeStore, themes } from "@/lib/use-theme";
import { useAuth } from "@/lib/use-auth";
import { toast } from "@/lib/use-toast";
import {
  Settings,
  Key,
  Bell,
  Palette,
  Globe,
  Database,
  Shield,
  LogOut,
  User,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";

type Section = "general" | "api-keys" | "notifications" | "appearance";

interface ApiKey {
  name: string;
  envVar: string;
  configured: boolean;
  lastUsed?: string;
}

const apiKeys: ApiKey[] = [
  { name: "Anthropic (Claude)", envVar: "ANTHROPIC_API_KEY", configured: true, lastUsed: "Just now" },
  { name: "OpenRouter", envVar: "OPENROUTER_API_KEY", configured: true, lastUsed: "2 hours ago" },
  { name: "Gemini", envVar: "GEMINI_API_KEY", configured: true, lastUsed: "Yesterday" },
  { name: "ClickUp", envVar: "CLICKUP_API_KEY", configured: true, lastUsed: "15 min ago" },
  { name: "Microsoft (Entra ID)", envVar: "MICROSOFT_CLIENT_SECRET", configured: true, lastUsed: "1 hour ago" },
  { name: "Google Workspace", envVar: "GOOGLE_SERVICE_ACCOUNT", configured: true, lastUsed: "30 min ago" },
  { name: "Lark Suite", envVar: "LARK_APP_SECRET", configured: true, lastUsed: "3 days ago" },
  { name: "n8n", envVar: "N8N_API_KEY", configured: true, lastUsed: "1 hour ago" },
];

const navSections = [
  { id: "general" as Section, label: "General", icon: Settings },
  { id: "api-keys" as Section, label: "API Keys", icon: Key },
  { id: "notifications" as Section, label: "Notifications", icon: Bell },
  { id: "appearance" as Section, label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("general");
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const { themeId, setTheme } = useThemeStore();
  const { logout } = useAuth();

  const handleSave = () => {
    setSaved(true);
    toast("Settings saved successfully", "success");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-sm text-muted">Configure AIOE Command Centre</p>
        </div>
        <div className="flex items-center gap-2">
        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            saved
              ? "bg-success/10 text-success"
              : "bg-cyan text-background hover:bg-cyan/80"
          )}
        >
          {saved ? (
            <>
              <CheckCircle className="h-3.5 w-3.5" /> Saved
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Save Changes
            </>
          )}
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Section nav */}
        <div className="space-y-1">
          {navSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                activeSection === section.id
                  ? "bg-cyan/10 text-cyan"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeSection === "general" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold">Profile</h3>
                <p className="mt-1 text-xs text-muted">Your AIOE identity</p>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-muted">Display Name</label>
                    <input
                      type="text"
                      defaultValue="Azzay"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-cyan/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">Email</label>
                    <input
                      type="email"
                      defaultValue="azhar@mtfa.org"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-cyan/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">Timezone</label>
                    <input
                      type="text"
                      defaultValue="Asia/Singapore (UTC+8)"
                      disabled
                      className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted">Telegram</label>
                    <input
                      type="text"
                      defaultValue="@Azzay11"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-cyan/30"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold">Backend Connection</h3>
                <p className="mt-1 text-xs text-muted">AIOE API configuration</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted">API Base URL</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue="https://api.aioe.space"
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-cyan/30"
                      />
                      <button className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted transition-colors hover:text-foreground">
                        <Globe className="h-3 w-3" /> Test
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-success/20 bg-success/5 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Connected via Cloudflare Tunnel</span>
                    </div>
                    <span className="text-xs text-muted">Latency: 45ms</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold">Default AI Model</h3>
                <p className="mt-1 text-xs text-muted">Model used for chat and operations</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { id: "claude-haiku-4-5", name: "Haiku 4.5", desc: "Fast, simple tasks" },
                    { id: "claude-sonnet-4-6", name: "Sonnet 4.6", desc: "Default, balanced" },
                    { id: "claude-opus-4-6", name: "Opus 4.6", desc: "Most capable" },
                  ].map((model) => (
                    <button
                      key={model.id}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all",
                        model.id === "claude-sonnet-4-6"
                          ? "border-cyan/30 bg-cyan/5"
                          : "border-border hover:border-cyan/20"
                      )}
                    >
                      <p className="text-sm font-medium">{model.name}</p>
                      <p className="mt-0.5 text-xs text-muted">{model.desc}</p>
                      {model.id === "claude-sonnet-4-6" && (
                        <span className="mt-2 inline-block rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] font-medium text-cyan">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "api-keys" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-surface">
              <div className="border-b border-border px-5 py-4">
                <h3 className="text-sm font-semibold">API Keys</h3>
                <p className="mt-1 text-xs text-muted">
                  Keys are stored in <code className="rounded bg-surface-hover px-1 py-0.5 text-[10px]">.env</code> in the parent directory
                </p>
              </div>
              <div className="divide-y divide-border">
                {apiKeys.map((key) => (
                  <div
                    key={key.envVar}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-surface-hover"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("rounded-lg p-2", key.configured ? "bg-success/10" : "bg-danger/10")}>
                        <Key className={cn("h-4 w-4", key.configured ? "text-success" : "text-danger")} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{key.name}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-muted">{key.envVar}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs text-muted">
                        {key.configured ? (
                          <>
                            <p className="text-success">Configured</p>
                            <p>Used: {key.lastUsed}</p>
                          </>
                        ) : (
                          <p className="text-danger">Not configured</p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setShowKeys((prev) => ({
                            ...prev,
                            [key.envVar]: !prev[key.envVar],
                          }))
                        }
                        className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                      >
                        {showKeys[key.envVar] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === "notifications" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-sm font-semibold">Notification Preferences</h3>
              <p className="mt-1 text-xs text-muted">Configure where and when you receive alerts</p>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Service status changes", desc: "When a service goes offline or recovers", enabled: true },
                  { label: "Security alerts", desc: "Failed logins, policy violations, threats", enabled: true },
                  { label: "Automation failures", desc: "When a scheduled workflow fails", enabled: true },
                  { label: "Daily briefing", desc: "Morning summary at 08:00 SGT", enabled: true },
                  { label: "Weekly report", desc: "IT metrics summary every Friday", enabled: true },
                  { label: "Low priority events", desc: "Device enrollments, routine changes", enabled: false },
                ].map((pref) => (
                  <div
                    key={pref.label}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{pref.label}</p>
                      <p className="mt-0.5 text-xs text-muted">{pref.desc}</p>
                    </div>
                    <button
                      className={cn(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                        pref.enabled ? "bg-cyan" : "bg-border"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform",
                          pref.enabled ? "translate-x-4" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-border p-4">
                <h4 className="text-xs font-medium text-muted">Delivery Channels</h4>
                <div className="mt-3 flex gap-3">
                  {[
                    { label: "Telegram", active: true },
                    { label: "Email", active: false },
                    { label: "Browser Push", active: false },
                  ].map((ch) => (
                    <button
                      key={ch.label}
                      className={cn(
                        "rounded-lg border px-4 py-2 text-sm transition-all",
                        ch.active
                          ? "border-cyan/30 bg-cyan/10 text-cyan"
                          : "border-border text-muted hover:border-cyan/20"
                      )}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "appearance" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold">Theme</h3>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        toast(`Theme changed to ${t.label}`, "success");
                      }}
                      className={cn(
                        "rounded-lg border p-3 text-left transition-all",
                        themeId === t.id ? "border-cyan/30" : "border-border hover:border-cyan/20"
                      )}
                    >
                      <div
                        className="mb-2 h-16 rounded-md"
                        style={{ backgroundColor: t.colors.background }}
                      />
                      <p className="text-sm font-medium">{t.label}</p>
                      {themeId === t.id && (
                        <span className="mt-1 inline-block rounded-full bg-cyan/10 px-2 py-0.5 text-[10px] text-cyan">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface p-6">
                <h3 className="text-sm font-semibold">Accent Colors</h3>
                <div className="mt-4 flex gap-3">
                  {[
                    { color: "#00f0ff", label: "Cyan", active: true },
                    { color: "#a855f7", label: "Purple", active: true },
                    { color: "#00e676", label: "Green", active: false },
                    { color: "#ff6b6b", label: "Red", active: false },
                    { color: "#ffd700", label: "Gold", active: false },
                  ].map((c) => (
                    <button
                      key={c.color}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all",
                        c.active ? "border-foreground/20" : "border-border hover:border-foreground/10"
                      )}
                    >
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[10px] text-muted">{c.label}</span>
                      {c.active && (
                        <CheckCircle className="h-3 w-3 text-success" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
