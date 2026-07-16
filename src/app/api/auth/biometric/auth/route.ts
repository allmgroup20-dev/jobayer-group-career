import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { generateCompanyToken } from "@/lib/auth/company-auth";

export async function POST(request: NextRequest) {
  try {
    const { action, credentialId, workerId, phone, userType } = await request.json() as {
      action: "begin" | "complete"; credentialId?: string; workerId?: string; phone?: string; userType?: string;
    };

    const env = await getDB();

    if (action === "begin") {
      let wid = workerId;
      const ut = userType || "worker";

      if (ut === "worker") {
        if (!wid && phone) {
          const found = await query<{ worker_id: string }>(
            env, "SELECT worker_id FROM workers WHERE phone = ?", [phone]
          );
          if (found.length > 0) wid = found[0].worker_id;
        }
      }
      // For company, workerId param is used as the username directly

      if (!wid) return NextResponse.json({ error: "Identifier required" }, { status: 400 });

      const creds = await query<{ credential_id: string; device_name: string }>(
        env,
        "SELECT credential_id, device_name FROM biometric_credentials WHERE worker_id = ? AND user_type = ?",
        [wid, ut]
      );
      if (creds.length === 0) {
        return NextResponse.json({ error: "No biometric credentials found" }, { status: 404 });
      }
      const challenge = btoa(crypto.getRandomValues(new Uint8Array(32)).reduce((s, b) => s + String.fromCharCode(b), ""));
      return NextResponse.json({
        challenge,
        credentials: creds.map((c) => ({ id: c.credential_id, deviceName: c.device_name })),
        userType: ut,
      });
    }

    if (action === "complete") {
      if (!credentialId) return NextResponse.json({ error: "credentialId required" }, { status: 400 });
      const creds = await query<{ worker_id: string; user_type: string }>(
        env,
        "SELECT worker_id, user_type FROM biometric_credentials WHERE credential_id = ?",
        [credentialId]
      );
      if (creds.length === 0) {
        return NextResponse.json({ error: "Credential not found" }, { status: 404 });
      }
      const { worker_id: wid, user_type: ut } = creds[0];
      const jwtSecret = process.env.JWT_SECRET || "default-secret";

      if (ut === "company") {
        const token = generateCompanyToken(wid, jwtSecret);
        return NextResponse.json({ token, workerId: wid, userType: "company" });
      } else {
        const token = generateToken(wid, jwtSecret);
        return NextResponse.json({ token, workerId: wid, userType: "worker" });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
