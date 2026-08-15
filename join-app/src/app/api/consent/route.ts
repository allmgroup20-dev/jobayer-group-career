import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { execute } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const { consentType = "onboarding", isGranted = 1 } = await request.json() as {
      consentType?: string; isGranted?: number;
    };

    const ipAddress = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || null;
    const userAgent = request.headers.get("user-agent") || null;

    const env = await getDB();
    await execute(env,
      `INSERT INTO privacy_consent (worker_id, consent_type, is_granted, ip_address, user_agent, granted_at, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [workerId, consentType, isGranted ? 1 : 0, ipAddress, userAgent]
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Consent error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
