import { NextRequest, NextResponse } from "next/server";

// In-memory rate limiter (resets on deploy/restart — fine for this use case)
const attempts = new Map<string, { count: number; firstAttempt: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 1 minute window
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minute lockout

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const now = Date.now();

  // Check rate limit
  const record = attempts.get(ip);
  if (record) {
    // Currently locked out
    if (record.lockedUntil > now) {
      const waitSec = Math.ceil((record.lockedUntil - now) / 1000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${waitSec}s.` },
        { status: 429 }
      );
    }

    // Reset window if expired
    if (now - record.firstAttempt > WINDOW_MS) {
      record.count = 0;
      record.firstAttempt = now;
      record.lockedUntil = 0;
    }
  }

  const { password } = await req.json();
  const correctPassword = process.env.AIOE_DASHBOARD_PASSWORD;

  if (!correctPassword) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  if (password === correctPassword) {
    // Successful login — clear attempts
    attempts.delete(ip);
    return NextResponse.json({ ok: true });
  }

  // Failed attempt — increment counter
  if (!record) {
    attempts.set(ip, { count: 1, firstAttempt: now, lockedUntil: 0 });
  } else {
    record.count++;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + LOCKOUT_MS;
    }
  }

  const current = attempts.get(ip)!;
  const remaining = MAX_ATTEMPTS - current.count;

  return NextResponse.json(
    { error: remaining > 0 ? `Wrong password. ${remaining} attempts left.` : "Too many attempts. Locked for 5 minutes." },
    { status: remaining > 0 ? 401 : 429 }
  );
}
