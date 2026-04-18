"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  authenticated: boolean;
  /** True when the visitor clicked "Try demo" on the landing page.
   *  Treated as authenticated for routing, but useApi swaps real fetches
   *  for seeded demo fixtures (see lib/demo-data.ts). */
  demoMode: boolean;
  login: (password: string, totp?: string) => Promise<boolean>;
  enterDemo: () => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      authenticated: false,
      demoMode: false,
      login: async (password: string, totp?: string) => {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, totp }),
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (res.ok && data.ok) {
          set({ authenticated: true, demoMode: false });
          return true;
        }

        // Server says password is correct but needs TOTP
        if (data.needsTotp) {
          throw new Error("TOTP_REQUIRED");
        }

        throw new Error(data.error || "Authentication failed");
      },
      enterDemo: () => set({ authenticated: true, demoMode: true }),
      logout: () => set({ authenticated: false, demoMode: false }),
    }),
    { name: "aioe-auth" }
  )
);
