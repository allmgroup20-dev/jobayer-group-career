import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { generateToken, generateWorkerId, hashWorkerPassword, getJwtSecret } from "@/lib/auth";

const jwtSecret = getJwtSecret();

export async function POST(request: NextRequest) {
  try {
    const { idToken, name: displayName, email } = await request.json() as {
      idToken: string; name?: string; email?: string;
    };
    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    const env = await getDB();

    // Verify the Google ID Token (simple decode — in production validate via Google API)
    let googleId: string;
    try {
      const payload = JSON.parse(atob(idToken.split(".")[1]));
      googleId = payload.sub;
      if (!googleId) throw new Error("No sub in token");
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Check if google_id already linked
    let worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
      env, "SELECT worker_id, name, phone FROM workers WHERE google_id = ?", [googleId]
    );

    if (worker) {
      const token = await generateToken(worker.worker_id, jwtSecret);
      return NextResponse.json({ token, workerId: worker.worker_id, name: worker.name });
    }

    // Check if email already registered (phone might be the email or empty)
    if (email) {
      worker = await queryFirst<{ worker_id: string; name: string; phone: string }>(
        env, "SELECT worker_id, name, phone FROM workers WHERE phone = ?", [email]
      );
      if (worker) {
        await execute(env, "UPDATE workers SET google_id = ? WHERE worker_id = ?", [googleId, worker.worker_id]);
        const token = await generateToken(worker.worker_id, jwtSecret);
        return NextResponse.json({ token, workerId: worker.worker_id, name: worker.name });
      }
    }

    // Auto-register with google_id
    const phone = email || `google_${googleId.slice(0, 8)}`;
    const name = displayName || `User${phone.slice(-6)}`;
    const workerId = generateWorkerId(name, phone);
    const hashedPw = await hashWorkerPassword("google_oauth_" + googleId.slice(0, 8));
    await execute(env,
       `INSERT INTO workers (worker_id, name, phone, password, google_id, join_date, membership_status)
       VALUES (?, ?, ?, ?, ?, datetime('now'), 'general')`,
      [workerId, name, phone, hashedPw, googleId]
    );

    const token = await generateToken(workerId, jwtSecret);
    return NextResponse.json({ token, workerId, name }, { status: 201 });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
