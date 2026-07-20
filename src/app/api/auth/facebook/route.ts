import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, generateWorkerId, hashWorkerPassword, getJwtSecret } from "@/lib/auth";

const jwtSecret = getJwtSecret();

export async function POST(request: NextRequest) {
  try {
    const { accessToken, name: displayName, email } = await request.json() as {
      accessToken: string; name?: string; email?: string;
    };
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken required" }, { status: 400 });
    }

    const env = await getDB();

    // Decode Facebook access token to get user ID (FB sends JSON with app_id + user_id)
    let facebookId: string;
    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      facebookId = payload.sub || payload.user_id;
      if (!facebookId) throw new Error("No user id in token");
    } catch {
      // Fallback: use a hash of the token itself as identifier
      facebookId = `fb_${accessToken.slice(0, 16)}`;
    }

    let worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
      env, "SELECT worker_id, name, phone FROM workers WHERE facebook_id = ?", [facebookId]
    );

    if (worker) {
      const token = await generateToken(worker.worker_id, jwtSecret);
      return NextResponse.json({ token, workerId: worker.worker_id, name: worker.name });
    }

    if (email) {
      worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
        env, "SELECT worker_id, name, phone FROM workers WHERE phone = ?", [email]
      );
      if (worker) {
        await execute(env, "UPDATE workers SET facebook_id = ? WHERE worker_id = ?", [facebookId, worker.worker_id]);
        const token = await generateToken(worker.worker_id, jwtSecret);
        return NextResponse.json({ token, workerId: worker.worker_id, name: worker.name });
      }
    }

    const phone = email || `fb_${facebookId.slice(0, 8)}`;
    const name = displayName || `User${phone.slice(-6)}`;
    const workerId = generateWorkerId(name, phone);
    const hashedPw = await hashWorkerPassword("facebook_oauth_" + facebookId.slice(0, 8));
    await execute(env,
       `INSERT INTO workers (worker_id, name, phone, password, facebook_id, join_date, membership_status)
       VALUES (?, ?, ?, ?, ?, datetime('now'), 'general')`,
      [workerId, name, phone, hashedPw, facebookId]
    );

    const token = await generateToken(workerId, jwtSecret);
    return NextResponse.json({ token, workerId, name }, { status: 201 });
  } catch (error) {
    console.error("Facebook auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
