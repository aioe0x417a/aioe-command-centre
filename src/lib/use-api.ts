"use client";

import { useState, useEffect, useCallback } from "react";

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
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
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
  }, [path, enabled]);

  useEffect(() => {
    fetchData();
    if (refreshInterval && enabled) {
      const id = setInterval(fetchData, refreshInterval);
      return () => clearInterval(id);
    }
  }, [fetchData, refreshInterval, enabled]);

  return { data, error, loading, refresh: fetchData };
}
