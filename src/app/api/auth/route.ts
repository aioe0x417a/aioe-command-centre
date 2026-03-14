import { NextRequest, NextResponse } from "next/server";
import { TOTP, Secret } from "otpauth";

// In-memory rate limiter
const attempts = new Map<string, { count: number; firstAttempt: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000;
const LOCKOUT_MS = 5 * 60 * 1000;

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

function getTOTP(): TOTP | null {
  const secretBase32 = process.env.AIOE_TOTP_SECRET;
  if (!secretBase32) return null;
  return new TOTP({
    issuer: "AIOE",
    label: "Azzay",
    secret: Secret.fromBase32(secretBase32),
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const now = Date.now();

  // Check rate limit
  const record = attempts.get(ip);
  if (record) {
    if (record.lockedUntil > now) {
      const waitSec = Math.ceil((record.lockedUntil - now) / 1000);
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${waitSec}s.` },
        { status: 429 }
      );
    }
    if (now - record.firstAttempt > WINDOW_MS) {
      record.count = 0;
      record.firstAttempt = now;
      record.lockedUntil = 0;
    }
  }

  const { password, totp: totpCode } = await req.json();
  const correctPassword = process.env.AIOE_DASHBOARD_PASSWORD;

  if (!correctPassword) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Step 1: Verify password
  if (password !== correctPassword) {
    return failAttempt(ip, now);
  }

  // Step 2: Verify TOTP if configured
  const totp = getTOTP();
  if (totp) {
    if (!totpCode) {
      // Password correct, but need TOTP code
      return NextResponse.json({ needsTotp: true });
    }
    const valid = totp.validate({ token: totpCode, window: 1 });
    if (valid === null) {
      return failAttempt(ip, now);
    }
  }

  // Success
  attempts.delete(ip);
  return NextResponse.json({ ok: true });
}

function failAttempt(ip: string, now: number) {
  const record = attempts.get(ip);
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
    { error: remaining > 0 ? `Wrong credentials. ${remaining} attempts left.` : "Too many attempts. Locked for 5 minutes." },
    { status: remaining > 0 ? 401 : 429 }
  );
}
