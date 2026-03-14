import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE = process.env.AIOE_API_URL || "https://api.aioe.space";
const API_KEY = process.env.AIOE_API_KEY || "";

async function proxyRequest(req: NextRequest, method: string) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const fetchOpts: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        Authorization: API_KEY ? `Bearer ${API_KEY}` : "",
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
      },
    };

    if (method === "POST" || method === "PATCH" || method === "PUT") {
      try {
        const body = await req.text();
        if (body) fetchOpts.body = body;
      } catch {
        // no body
      }
    }

    const res = await fetch(`${API_BASE}${path}`, fetchOpts);
    clearTimeout(timeout);

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "AIOE API unreachable" },
      { status: 503 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, "POST");
}

export async function PATCH(req: NextRequest) {
  return proxyRequest(req, "PATCH");
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, "PUT");
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, "DELETE");
}
