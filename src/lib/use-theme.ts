"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  border: string;
}

export interface ThemeConfig {
  id: string;
  label: string;
  colors: ThemeColors;
}

export const themes: ThemeConfig[] = [
  {
    id: "cyberpunk-dark",
    label: "Cyberpunk Dark",
    colors: { background: "#06060e", surface: "#0d0d1a", surfaceHover: "#14142a", border: "#1a1a3e" },
  },
  {
    id: "midnight-blue",
    label: "Midnight Blue",
    colors: { background: "#0a1628", surface: "#0f1d32", surfaceHover: "#162844", border: "#1e3a5f" },
  },
  {
    id: "pure-dark",
    label: "Pure Dark",
    colors: { background: "#000000", surface: "#0a0a0a", surfaceHover: "#141414", border: "#1e1e1e" },
  },
];

interface ThemeStore {
  themeId: string;
  setTheme: (id: string) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themeId: "cyberpunk-dark",
      setTheme: (id) => set({ themeId: id }),
    }),
    { name: "aioe-theme" }
  )
);

export function applyTheme(themeId: string) {
  const theme = themes.find((t) => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--background", theme.colors.background);
  root.style.setProperty("--surface", theme.colors.surface);
  root.style.setProperty("--surface-hover", theme.colors.surfaceHover);
  root.style.setProperty("--border", theme.colors.border);
}
