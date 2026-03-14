"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStore {
  authenticated: boolean;
  login: (password: string, totp?: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      authenticated: false,
      login: async (password: string, totp?: string) => {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, totp }),
        });
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (res.ok && data.ok) {
          set({ authenticated: true });
          return true;
        }

        // Server says password is correct but needs TOTP
        if (data.needsTotp) {
          throw new Error("TOTP_REQUIRED");
        }

        throw new Error(data.error || "Authentication failed");
      },
      logout: () => set({ authenticated: false }),
    }),
    { name: "aioe-auth" }
  )
);
