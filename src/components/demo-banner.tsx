"use client";

import { useAuth } from "@/lib/use-auth";
import { Sparkles, X } from "lucide-react";

/**
 * Persistent banner shown whenever demoMode is active. Makes the demo state
 * obvious to the visitor + surfaces a clear "Sign up to connect real data" CTA.
 * Mounted in layout.tsx so it sits above every page.
 */
export function DemoBanner() {
  const demoMode = useAuth((s) => s.demoMode);
  const logout = useAuth((s) => s.logout);

  if (!demoMode) return null;

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-cyan/30 bg-gradient-to-r from-cyan/10 via-cyan/5 to-purple/10 px-4 py-1.5 text-xs backdrop-blur">
      <Sparkles className="h-3.5 w-3.5 text-cyan" />
      <span className="text-foreground/80">
        You're exploring a <span className="font-semibold text-cyan">demo</span>.
        All data is simulated.
      </span>
      <span className="text-muted-foreground">·</span>
      <button
        onClick={logout}
        className="font-medium text-cyan underline-offset-2 transition hover:underline"
      >
        Exit demo
      </button>
      <button
        onClick={logout}
        aria-label="Exit demo"
        className="ml-1 rounded p-0.5 text-muted-foreground transition hover:text-foreground"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
