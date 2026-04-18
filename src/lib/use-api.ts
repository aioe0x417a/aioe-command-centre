"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./use-auth";
import { getDemoData } from "./demo-data";

interface UseApiOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseApiResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
}

export function useApi<T>(path: string, opts: UseApiOptions = {}): UseApiResult<T> {
  const { refreshInterval, enabled = true } = opts;
  // Select demoMode outside the fetch callback so Zustand re-renders on flip.
  const demoMode = useAuth((s) => s.demoMode);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    // Demo-mode short-circuit: return seeded fixture if we have one.
    // Real network is never touched, so no loading spinner noise either.
    if (demoMode) {
      const seed = getDemoData<T>(path);
      setData(seed ?? null);
      setError(seed ? null : "demo-data-missing");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [path, enabled, demoMode]);

  useEffect(() => {
    fetchData();
    if (refreshInterval && enabled && !demoMode) {
      const id = setInterval(fetchData, refreshInterval);
      return () => clearInterval(id);
    }
  }, [fetchData, refreshInterval, enabled, demoMode]);

  return { data, error, loading, refresh: fetchData };
}
