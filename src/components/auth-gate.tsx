"use client";

import { useAuth } from "@/lib/use-auth";
import { MarketingLanding } from "./marketing-landing";
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
    // Public visitors see the marketing landing. It has an inline "Sign in"
    // button that swaps in the existing LoginScreen without a route change.
    return <MarketingLanding />;
  }

  return <>{children}</>;
}
