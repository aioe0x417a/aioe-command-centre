"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  authenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      authenticated: false,
      login: async (password: string) => {
        try {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          });
          if (res.ok) {
            set({ authenticated: true });
            return true;
          }
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Authentication failed");
        } catch (e) {
          throw e;
        }
      },
      logout: () => set({ authenticated: false }),
    }),
    { name: "aioe-auth" }
  )
);
