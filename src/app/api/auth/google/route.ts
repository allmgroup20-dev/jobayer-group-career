import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, generateWorkerId, hashWorkerPassword, getJwtSecret } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json() as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    // Verify the Google ID Token server-side via Google's tokeninfo endpoint.
    // Signature, issuer, audience and email_verified are all validated by Google here.
    let profile: { sub?: string; email?: string; email_verified?: string; name?: string; aud?: string };
    try {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`, {
        headers: { "accept": "application/json" },
      });
      if (!res.ok) throw new Error("tokeninfo failed");
      profile = await res.json();
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const expectedAud = process.env.GOOGLE_CLIENT_ID;
    if (expectedAud && profile.aud !== expectedAud) {
      return NextResponse.json({ error: "Invalid token audience" }, { status: 400 });
    }
    const googleId = profile.sub;
    if (!googleId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
    const email = profile.email || "";
    if (email && profile.email_verified !== "true") {
      return NextResponse.json({ error: "Email not verified" }, { status: 400 });
    }

    const env = await getDB();

    // Check if google_id already linked
    let worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
      env, "SELECT worker_id, name, phone FROM workers WHERE google_id = ?", [googleId]
    );

    if (worker) {
      const token = await generateToken(worker.worker_id, getJwtSecret());
      const response = NextResponse.json({ workerId: worker.worker_id, name: worker.name });
      setSessionCookie(response, token);
      return response;
    }

    // Account linking: if a worker already registered with this email as phone, link the Google ID
    if (email) {
      worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
        env, "SELECT worker_id, name, phone FROM workers WHERE phone = ?", [email]
      );
      if (worker) {
        await execute(env, "UPDATE workers SET google_id = ? WHERE worker_id = ?", [googleId, worker.worker_id]);
        const token = await generateToken(worker.worker_id, getJwtSecret());
        const response = NextResponse.json({ workerId: worker.worker_id, name: worker.name });
        setSessionCookie(response, token);
        return response;
      }
    }

    // Auto-register with google_id
    const phone = email || `google_${googleId.slice(0, 8)}`;
    const name = profile.name || `User${phone.slice(-6)}`;
    const workerId = generateWorkerId(name, phone);
    const hashedPw = await hashWorkerPassword("google_oauth_" + googleId.slice(0, 8));
    await execute(env,
       `INSERT INTO workers (worker_id, name, phone, password, google_id, join_date, membership_status)
       VALUES (?, ?, ?, ?, ?, datetime('now'), 'general')`,
      [workerId, name, phone, hashedPw, googleId]
    );

    const token = await generateToken(workerId, getJwtSecret());
    const response = NextResponse.json({ workerId, name }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
