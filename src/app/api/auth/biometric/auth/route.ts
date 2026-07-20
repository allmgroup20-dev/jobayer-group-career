import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, getJwtSecret } from "@/lib/auth";
import { generateCompanyToken } from "@/lib/auth/company-auth";
import { issueChallenge, consumeChallenge, verifyAuthentication } from "@/lib/auth/webauthn";

const jwtSecret = getJwtSecret();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, string>;
    const { action, credentialId, workerId, phone, userType, challengeId, clientDataJSON, authenticatorData, signature } = body;

    const env = await getDB();

    if (action === "challenge") {
      const { id, challenge } = issueChallenge();
      return NextResponse.json({ challengeId: id, challenge });
    }

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

      if (!wid) return NextResponse.json({ error: "Identifier required" }, { status: 400 });

      const exists = await query<{ found: number }>(
        env,
        "SELECT 1 as found FROM biometric_credentials WHERE worker_id = ? AND user_type = ? LIMIT 1",
        [wid, ut]
      );
      if (!exists[0]?.found) {
        return NextResponse.json({ error: "No biometric credentials found" }, { status: 404 });
      }

      const { id, challenge } = issueChallenge();
      return NextResponse.json({ challengeId: id, challenge, userType: ut });
    }

    if (action === "complete") {
      if (!credentialId || !clientDataJSON || !authenticatorData || !signature || !challengeId) {
        return NextResponse.json({ error: "Missing assertion data" }, { status: 400 });
      }

      const expectedChallenge = consumeChallenge(challengeId);
      if (!expectedChallenge) {
        return NextResponse.json({ error: "Challenge expired or invalid. Please try again." }, { status: 400 });
      }

      const creds = await query<{ worker_id: string; user_type: string; public_key: string }>(
        env,
        "SELECT worker_id, user_type, public_key FROM biometric_credentials WHERE credential_id = ?",
        [credentialId]
      );
      if (creds.length === 0) {
        return NextResponse.json({ error: "Credential not found" }, { status: 404 });
      }

      const { worker_id: wid, user_type: ut, public_key: pubKeyStr } = creds[0];

      let storedPublicKey: any;
      try { storedPublicKey = JSON.parse(pubKeyStr); } catch {
        return NextResponse.json({ error: "Invalid stored credential" }, { status: 500 });
      }

      const origin = request.headers.get("origin") || "";
      const isValid = await verifyAuthentication(
        storedPublicKey,
        clientDataJSON,
        authenticatorData,
        signature,
        expectedChallenge,
        origin
      );

      if (!isValid) {
        return NextResponse.json({ error: "Biometric verification failed: signature mismatch" }, { status: 401 });
      }

      const jwtSecret = getJwtSecret();

      if (ut === "company") {
        const token = await generateCompanyToken(wid, jwtSecret);
        return NextResponse.json({ token, workerId: wid, userType: "company" });
      } else {
        const token = await generateToken(wid, jwtSecret);
        return NextResponse.json({ token, workerId: wid, userType: "worker" });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
