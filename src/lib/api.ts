const API_BASE = process.env.NEXT_PUBLIC_AIOE_API_URL || "https://api.aioe.space";

export async function aioeGet<T>(path: string): Promise<T> {
  const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Types matching the backend schemas
export interface ServiceStatus {
  name: string;
  slug: string;
  running: boolean;
  pids: number[];
}

export interface SystemInfo {
  cpu_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  ram_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
  disk_percent: number;
  uptime_seconds: number;
}

export interface LogLine {
  source: string;
  lines: string[];
  error?: string;
}
