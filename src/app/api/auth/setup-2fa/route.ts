import { NextRequest, NextResponse } from "next/server";
import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";

export async function POST(req: NextRequest) {
  // Require password to access 2FA setup
  const { password } = await req.json();
  const correctPassword = process.env.AIOE_DASHBOARD_PASSWORD;

  if (!correctPassword || password !== correctPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingSecret = process.env.AIOE_TOTP_SECRET;

  // Generate a new secret or use existing one
  const secret = existingSecret
    ? Secret.fromBase32(existingSecret)
    : new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: "AIOE",
    label: "Azzay",
    secret,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  });

  const uri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: { dark: "#39ff14", light: "#06060e" },
  });

  return NextResponse.json({
    secret: secret.base32,
    uri,
    qrDataUrl,
    configured: !!existingSecret,
  });
}
