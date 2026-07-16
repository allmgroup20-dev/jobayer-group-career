import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { action, credentialId, workerId, phone } = await request.json() as {
      action: "begin" | "complete"; credentialId?: string; workerId?: string; phone?: string;
    };

    const env = await getDB();

    if (action === "begin") {
      // Look up worker by phone or workerId
      let wid = workerId;
      if (!wid && phone) {
        const found = await query<{ worker_id: string }>(
          env, "SELECT worker_id FROM workers WHERE phone = ?", [phone]
        );
        if (found.length > 0) wid = found[0].worker_id;
      }
      if (!wid) return NextResponse.json({ error: "workerId or phone required" }, { status: 400 });
      const creds = await query<{ credential_id: string; device_name: string }>(
        env,
        "SELECT credential_id, device_name FROM biometric_credentials WHERE worker_id = ?",
        [wid]
      );
      if (creds.length === 0) {
        return NextResponse.json({ error: "No biometric credentials found" }, { status: 404 });
      }
      const challenge = btoa(crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + String.fromCharCode(b), ""));
      return NextResponse.json({
        challenge,
        credentials: creds.map((c) => ({ id: c.credential_id, deviceName: c.device_name })),
      });
    }

    if (action === "complete") {
      if (!credentialId) return NextResponse.json({ error: "credentialId required" }, { status: 400 });
      const creds = await query<{ worker_id: string }>(
        env,
        "SELECT worker_id FROM biometric_credentials WHERE credential_id = ?",
        [credentialId]
      );
      if (creds.length === 0) {
        return NextResponse.json({ error: "Credential not found" }, { status: 404 });
      }
      const wid = creds[0].worker_id;
      const token = generateToken(wid, process.env.JWT_SECRET || "default-secret");
      return NextResponse.json({ token, workerId: wid });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}