"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/use-auth";
import { Zap, Lock, Eye, EyeOff } from "lucide-react";

export function LoginScreen() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const ok = await login(password);
    if (!ok) {
      setError(true);
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan/10">
            <Zap className="h-8 w-8 text-cyan" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-wider text-cyan glow-cyan-text">
            AIOE
          </h1>
          <p className="mt-1 text-sm text-muted">Command Centre</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Lock className="h-4 w-4" />
              <span>Enter password to continue</span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Password"
                autoFocus
                className="w-full rounded-lg border border-border bg-background px-4 py-3 pr-10 text-sm outline-none transition-colors focus:border-cyan/30 placeholder:text-muted"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-danger"
              >
                Wrong password. Try again.
              </motion.p>
            )}

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full rounded-lg bg-cyan py-3 text-sm font-semibold text-background transition-colors hover:bg-cyan/80 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Enter Command Centre"}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-[10px] text-muted">
          AIOE Command Centre · Secured Access
        </p>
      </motion.div>
    </div>
  );
}
