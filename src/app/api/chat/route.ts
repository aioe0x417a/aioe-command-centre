import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = process.env.AIOE_API_URL || "https://api.aioe.space";
const API_KEY = process.env.AIOE_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { message, model } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    if (!API_KEY) {
      return NextResponse.json(
        {
          response:
            "Chat is not connected yet — AIOE_API_KEY is not set in .env.local. " +
            "Once configured, this chat will connect to the real AIOE backend via WebSocket.",
          model: model || "demo",
        },
        { status: 200 }
      );
    }

    // Use WebSocket to get a streamed response, but for simplicity
    // we'll collect the full response and return it as JSON.
    // A full streaming implementation would use Server-Sent Events.
    const wsUrl = `${API_BASE.replace("https://", "wss://").replace("http://", "ws://")}/api/v1/ws/chat?token=${API_KEY}`;

    return new Promise<NextResponse>((resolve) => {
      let fullResponse = "";
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(NextResponse.json({ response: fullResponse || "Timeout waiting for response", model }));
        }
      }, 60000);

      // Dynamic import WebSocket for Node.js
      import("ws").then(({ default: WebSocket }) => {
        const ws = new WebSocket(wsUrl);

        ws.on("open", () => {
          ws.send(JSON.stringify({ type: "message", content: message }));
        });

        ws.on("message", (data: Buffer) => {
          try {
            const msg = JSON.parse(data.toString());
            if (msg.type === "chunk") {
              fullResponse += msg.content;
            } else if (msg.type === "done") {
              ws.close();
              clearTimeout(timeout);
              if (!resolved) {
                resolved = true;
                resolve(NextResponse.json({ response: fullResponse, model }));
              }
            } else if (msg.type === "error") {
              ws.close();
              clearTimeout(timeout);
              if (!resolved) {
                resolved = true;
                resolve(NextResponse.json({ response: `Error: ${msg.content}`, model }, { status: 500 }));
              }
            }
          } catch {
            // ignore parse errors
          }
        });

        ws.on("error", () => {
          clearTimeout(timeout);
          if (!resolved) {
            resolved = true;
            resolve(NextResponse.json({ response: "Failed to connect to AIOE backend", model }, { status: 503 }));
          }
        });
      }).catch(() => {
        clearTimeout(timeout);
        if (!resolved) {
          resolved = true;
          resolve(NextResponse.json(
            { response: "WebSocket client not available. Install the 'ws' package: pnpm add ws @types/ws", model },
            { status: 500 }
          ));
        }
      });
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
