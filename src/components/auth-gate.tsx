"use client";

import { useAuth } from "@/lib/use-auth";
import { LoginScreen } from "./login-screen";
import { useEffect, useState } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { authenticated } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand to hydrate from localStorage before rendering
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-cyan" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
