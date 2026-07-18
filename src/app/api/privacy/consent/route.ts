import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });

    const db = await ensureDB();
    const { results: consents } = await db.prepare(
      "SELECT id, worker_id, consent_type, is_granted, ip_address, user_agent, granted_at, revoked_at, created_at FROM privacy_consent WHERE worker_id = ? ORDER BY created_at DESC"
    ).bind(workerId).all() as { results: any[] };

    return NextResponse.json({ consents: consents || [] });
  } catch (err) {
    console.error("Consent GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const { workerId, consentType, isGranted, ipAddress, userAgent } = body;

    if (!workerId || !consentType) {
      return NextResponse.json({ error: "workerId and consentType required" }, { status: 400 });
    }

    const db = await ensureDB();
    const now = new Date().toISOString();

    await db.prepare(
      "INSERT INTO privacy_consent (worker_id, consent_type, is_granted, ip_address, user_agent, granted_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(workerId, consentType, isGranted !== undefined ? (isGranted ? 1 : 0) : 1, ipAddress || null, userAgent || null, isGranted ? now : null, now).run();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Consent POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
