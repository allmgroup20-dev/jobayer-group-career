import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, getJwtSecret } from "@/lib/auth";
import { generateCompanyToken } from "@/lib/auth/company-auth";
import { issueChallenge, consumeChallenge, verifyAuthentication } from "@/lib/auth/webauthn";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, string>;
    const { action, credentialId, workerId, phone, userType, challengeId, clientDataJSON, authenticatorData, signature } = body;

    const env = await getDB();

    if (action === "challenge") {
      const { id, challenge } = await issueChallenge();
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

      const creds = await query<{ credential_id: string }>(
        env,
        "SELECT credential_id FROM biometric_credentials WHERE worker_id = ? AND user_type = ?",
        [wid, ut]
      );
      if (creds.length === 0) {
        return NextResponse.json({ error: "No biometric credentials found" }, { status: 404 });
      }

      const { id, challenge } = await issueChallenge();
      const allowCredentials = creds.map((c) => ({ id: c.credential_id, type: "public-key" as const }));
      return NextResponse.json({ challengeId: id, challenge, allowCredentials, userType: ut });
    }

    if (action === "complete") {
      if (!credentialId || !clientDataJSON || !authenticatorData || !signature || !challengeId) {
        return NextResponse.json({ error: "Missing assertion data" }, { status: 400 });
      }

      const expectedChallenge = await consumeChallenge(challengeId);
      if (!expectedChallenge) {
        return NextResponse.json({ error: "Challenge expired or invalid. Please try again." }, { status: 400 });
      }

      const creds = await query<{ worker_id: string; user_type: string; public_key: string; sign_count: number }>(
        env,
        "SELECT worker_id, user_type, public_key, sign_count FROM biometric_credentials WHERE credential_id = ?",
        [credentialId]
      );
      if (creds.length === 0) {
        return NextResponse.json({ error: "Credential not found" }, { status: 404 });
      }

      const { worker_id: wid, user_type: ut, public_key: pubKeyStr, sign_count: storedSignCount } = creds[0];

      let storedPublicKey: any;
      try { storedPublicKey = JSON.parse(pubKeyStr); } catch {
        return NextResponse.json({ error: "Invalid stored credential" }, { status: 500 });
      }

      const origin = request.headers.get("origin") || "";
      const result = await verifyAuthentication(
        storedPublicKey,
        clientDataJSON,
        authenticatorData,
        signature,
        expectedChallenge,
        origin
      );

      if (!result.valid) {
        return NextResponse.json({ error: "Biometric verification failed: signature mismatch" }, { status: 401 });
      }

      // signCount: reject cloned/replayed authenticators when the counter regresses
      const newSignCount = result.signCount ?? 0;
      if (storedSignCount > 0 && newSignCount > 0 && newSignCount <= storedSignCount) {
        return NextResponse.json({ error: "Biometric verification failed: cloned authenticator" }, { status: 401 });
      }
      if (newSignCount > 0) {
        await query(env,
          "UPDATE biometric_credentials SET sign_count = ? WHERE credential_id = ?",
          [newSignCount, credentialId]
        ).catch(() => {});
      }

      const jwtSecret = getJwtSecret();

      if (ut === "company") {
        const token = await generateCompanyToken(wid, jwtSecret);
        const response = NextResponse.json({ workerId: wid, userType: "company" });
        return response;
      } else {
        const token = await generateToken(wid, jwtSecret);
        const response = NextResponse.json({ workerId: wid, userType: "worker" });
        setSessionCookie(response, token);
        return response;
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
