import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { issueChallenge, consumeChallenge, verifyRegistrationAttestation } from "@/lib/auth/webauthn";

export async function POST(request: NextRequest) {
  try {
    const { action, workerId, credentialId, publicKey, deviceName, userType, attestationObject, clientDataJSON, challengeId } = await request.json() as Record<string, string>;

    const env = await getDB();

    if (action === "challenge") {
      if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });
      const { id, challenge } = await issueChallenge();
      return NextResponse.json({ challengeId: id, challenge, workerId, userType: userType || "worker" });
    }

    if (action === "complete") {
      if (!workerId || !attestationObject || !clientDataJSON || !challengeId) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }

      const expectedChallenge = await consumeChallenge(challengeId);
      if (!expectedChallenge) {
        return NextResponse.json({ error: "Challenge expired or invalid. Please try again." }, { status: 400 });
      }

      const origin = request.headers.get("origin") || "";
      const result = await verifyRegistrationAttestation(clientDataJSON, attestationObject, expectedChallenge, origin);
      if (!result) {
        return NextResponse.json({ error: "Attestation verification failed. Try again." }, { status: 400 });
      }

      const finalCredentialId = credentialId || result.credentialId;
      const publicKeyStr = JSON.stringify(result.jwk);

      // Check for existing
      const existing = await query<{ found: number }>(env,
        "SELECT 1 as found FROM biometric_credentials WHERE credential_id = ?", [finalCredentialId]
      );
      if (existing.length > 0) {
        return NextResponse.json({ error: "Credential already registered" }, { status: 409 });
      }

      await execute(env,
        `INSERT INTO biometric_credentials (worker_id, credential_id, public_key, device_name, user_type)
         VALUES (?, ?, ?, ?, ?)`,
        [workerId, finalCredentialId, publicKeyStr, deviceName || "", userType || "worker"]
      );

      return NextResponse.json({ success: true }, { status: 201 });
    }

    // Legacy fallback: direct registration without attestation verification
    if (!workerId || !credentialId || !publicKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    await execute(env,
      `INSERT INTO biometric_credentials (worker_id, credential_id, public_key, device_name, user_type)
       VALUES (?, ?, ?, ?, ?)`,
      [workerId, credentialId, publicKey, deviceName || "", userType || "worker"]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    if (error?.message?.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Credential already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { workerId, userType } = await request.json() as { workerId?: string; userType?: string };
    if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });
    const env = await getDB();
    await execute(env,
      "DELETE FROM biometric_credentials WHERE worker_id = ? AND user_type = ?",
      [workerId, userType || "worker"]
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
