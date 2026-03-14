"use client";

import { useEffect } from "react";
import { useThemeStore, applyTheme } from "@/lib/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeId = useThemeStore((s) => s.themeId);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId]);

  return <>{children}</>;
}
