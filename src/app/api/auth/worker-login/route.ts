import { NextRequest, NextResponse } from "next/server";
import { verifyWorkerPassword, generateToken, getJwtSecret } from "@/lib/auth";
import { getCached, setCached } from "@/lib/cache";

const MEMO = "__workerAuthMemo";

function getMemo(): Map<string, { worker_id: string; name: string; password: string }> {
  const g = globalThis as any;
  if (!g[MEMO]) g[MEMO] = new Map();
  return g[MEMO];
}

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json() as { phone: string; password: string };
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const phoneHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(cleanPhone))))
      .map(b => b.toString(16).padStart(2, "0")).join("");

    const memo = getMemo();

    // 1. In-memory cache
    const memoized = memo.get(phoneHash);
    if (memoized) {
      const valid = await verifyWorkerPassword(password, memoized.password);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const token = await generateToken(memoized.worker_id, getJwtSecret());
      return NextResponse.json({ token, workerId: memoized.worker_id, name: memoized.name });
    }

    // 2. KV cache
    const cached = await getCached<{ worker_id: string; name: string; password: string }>(`auth:worker:${phoneHash}`, 1800);
    if (cached) {
      const valid = await verifyWorkerPassword(password, cached.password);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      memo.set(phoneHash, cached);
      const token = await generateToken(cached.worker_id, getJwtSecret());
      return NextResponse.json({ token, workerId: cached.worker_id, name: cached.name });
    }

    // 3. D1 query via getCloudflareContext (bypasses schema init lock)
    let worker: { worker_id: string; name: string; password: string } | null = null;
    try {
      const { getCloudflareContext } = await import("@opennextjs/cloudflare");
      const ctx = await getCloudflareContext({ async: true });
      const db = (ctx.env as any)?.DB as D1Database | undefined;
      if (db) {
        const row = await db.prepare(
          "SELECT worker_id, name, password FROM workers WHERE phone = ? AND membership_status IN ('general', 'premium')"
        ).bind(cleanPhone).first() as { worker_id: string; name: string; password: string } | undefined;
        worker = row || null;
      }
    } catch (err) {
      console.error("D1 query error:", (err as Error)?.message || err);
    }

    if (!worker) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyWorkerPassword(password, worker.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    setCached(`auth:worker:${phoneHash}`, { worker_id: worker.worker_id, name: worker.name, password: worker.password }).catch(() => {});
    memo.set(phoneHash, { worker_id: worker.worker_id, name: worker.name, password: worker.password });

    const token = await generateToken(worker.worker_id, getJwtSecret());
    return NextResponse.json({ token, workerId: worker.worker_id, name: worker.name });
  } catch (error) {
    console.error("Worker login error:", (error as Error)?.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
