import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface AioeStatus {
  status: "idle" | "thinking" | "working" | "offline";
  currentTask: string | null;
  subAgents: number;
  lastHeartbeat: string;
  model: string | null;
}

export async function GET() {
  try {
    // Try to reach the real AIOE backend
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch("https://api.aioe.space/status", {
      signal: controller.signal,
      headers: { "Cache-Control": "no-cache" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        status: data.status || "idle",
        currentTask: data.current_task || data.currentTask || null,
        subAgents: data.sub_agents || data.subAgents || 0,
        lastHeartbeat: data.last_heartbeat || data.lastHeartbeat || new Date().toISOString(),
        model: data.model || null,
      } satisfies AioeStatus);
    }

    // API reachable but returned error
    return NextResponse.json({
      status: "idle",
      currentTask: null,
      subAgents: 0,
      lastHeartbeat: new Date().toISOString(),
      model: null,
    } satisfies AioeStatus);
  } catch {
    // API unreachable — AIOE is offline
    return NextResponse.json({
      status: "offline",
      currentTask: null,
      subAgents: 0,
      lastHeartbeat: new Date().toISOString(),
      model: null,
    } satisfies AioeStatus);
  }
}
