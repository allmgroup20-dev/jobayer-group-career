import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, generateWorkerId, hashWorkerPassword, getJwtSecret } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/session";

async function appSecretProof(appSecret: string, accessToken: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(appSecret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(accessToken));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json() as { accessToken?: string };
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken required" }, { status: 400 });
    }

    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      return NextResponse.json({ error: "Facebook login is not configured" }, { status: 501 });
    }

    // Verify the Facebook access token server-side via the Graph API.
    // The appsecret_proof prevents token forgery when an app secret is configured.
    let graphUrl = `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`;
    const appSecret = process.env.FACEBOOK_APP_SECRET;
    if (appSecret) {
      const proof = await appSecretProof(appSecret, accessToken);
      graphUrl += `&appsecret_proof=${proof}`;
    }

    let profile: { id?: string; name?: string; email?: string; error?: { message?: string } };
    try {
      const res = await fetch(graphUrl, { headers: { "accept": "application/json" } });
      profile = await res.json();
      if (!res.ok || !profile.id) {
        throw new Error(profile.error?.message || "Graph API rejected token");
      }
    } catch {
      return NextResponse.json({ error: "Invalid access token" }, { status: 400 });
    }

    const facebookId = profile.id!;
    const email = profile.email || "";

    const env = await getDB();

    // Check if facebook_id already linked
    let worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
      env, "SELECT worker_id, name, phone FROM workers WHERE facebook_id = ?", [facebookId]
    );

    if (worker) {
      const token = await generateToken(worker.worker_id, getJwtSecret());
      const response = NextResponse.json({ workerId: worker.worker_id, name: worker.name });
      setSessionCookie(response, token);
      return response;
    }

    // Account linking: link to an existing worker with the same email
    if (email) {
      worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
        env, "SELECT worker_id, name, phone FROM workers WHERE phone = ?", [email]
      );
      if (worker) {
        await execute(env, "UPDATE workers SET facebook_id = ? WHERE worker_id = ?", [facebookId, worker.worker_id]);
        const token = await generateToken(worker.worker_id, getJwtSecret());
        const response = NextResponse.json({ workerId: worker.worker_id, name: worker.name });
        setSessionCookie(response, token);
        return response;
      }
    }

    const phone = email || `fb_${facebookId.slice(0, 8)}`;
    const name = profile.name || `User${phone.slice(-6)}`;
    const workerId = generateWorkerId(name, phone);
    const hashedPw = await hashWorkerPassword("facebook_oauth_" + facebookId.slice(0, 8));
    await execute(env,
       `INSERT INTO workers (worker_id, name, phone, password, facebook_id, join_date, membership_status)
       VALUES (?, ?, ?, ?, ?, datetime('now'), 'general')`,
      [workerId, name, phone, hashedPw, facebookId]
    );

    const token = await generateToken(workerId, getJwtSecret());
    const response = NextResponse.json({ workerId, name }, { status: 201 });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("Facebook auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
