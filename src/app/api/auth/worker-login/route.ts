import { NextRequest, NextResponse } from "next/server";
import { verifyWorkerPassword, generateToken, getJwtSecret, normalizePhone } from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/session";
import { getCached, setCached, invalidateCache } from "@/lib/cache";
import { getDB } from "@/lib/db";
import { queryFirst } from "@/lib/db/queries";

const MEMO = "__workerAuthMemo";
const D1_TIMEOUT_MS = 8000;

// H2: brute-force protection — 5 failed attempts per phone+IP locks out for 5 minutes
const FAIL_LIMIT = 5;
const FAIL_WINDOW_SEC = 300;

function getClientIp(request: NextRequest): string {
  return request.headers.get("cf-connecting-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

async function checkBruteForce(phoneHash: string, ip: string): Promise<boolean> {
  const phoneFails = await getCached<{ n: number }>(`auth:fail:${phoneHash}`, FAIL_WINDOW_SEC);
  const ipFails = await getCached<{ n: number }>(`auth:fail:ip:${ip}`, FAIL_WINDOW_SEC);
  return (phoneFails?.n || 0) >= FAIL_LIMIT || (ipFails?.n || 0) >= FAIL_LIMIT;
}

async function recordFailure(phoneHash: string, ip: string): Promise<void> {
  const phoneFails = await getCached<{ n: number }>(`auth:fail:${phoneHash}`, FAIL_WINDOW_SEC);
  await setCached(`auth:fail:${phoneHash}`, { n: (phoneFails?.n || 0) + 1 });
  const ipFails = await getCached<{ n: number }>(`auth:fail:ip:${ip}`, FAIL_WINDOW_SEC);
  await setCached(`auth:fail:ip:${ip}`, { n: (ipFails?.n || 0) + 1 });
}

async function clearFailures(phoneHash: string, ip: string): Promise<void> {
  await invalidateCache(`auth:fail:${phoneHash}`);
  await invalidateCache(`auth:fail:ip:${ip}`);
}

function getMemo(): Map<string, { worker_id: string; name: string; password: string }> {
  const g = globalThis as any;
  if (!g[MEMO]) g[MEMO] = new Map();
  return g[MEMO];
}

export async function POST(request: NextRequest) {
  try {
    const { phone, password, remember } = await request.json() as { phone: string; password: string; remember?: boolean };
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);
    const phoneHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(cleanPhone))))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    const ip = getClientIp(request);

    if (await checkBruteForce(phoneHash, ip)) {
      return NextResponse.json({ error: "অনেকবার ভুল পাসওয়ার্ড। ৫ মিনিট পরে আবার চেষ্টা করুন" }, { status: 429 });
    }

    const memo = getMemo();

    // 1. In-memory cache (0ms)
    const memoized = memo.get(phoneHash);
    if (memoized) {
      const valid = await verifyWorkerPassword(password, memoized.password);
      if (!valid) {
        await recordFailure(phoneHash, ip);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      await clearFailures(phoneHash, ip);
      const token = await generateToken(memoized.worker_id, getJwtSecret(), remember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60);
      const response = NextResponse.json({ token, workerId: memoized.worker_id, name: memoized.name });
      setSessionCookie(response, token, !!remember);
      return response;
    }

    // 2. KV cache (~20ms)
    const cached = await getCached<{ worker_id: string; name: string; password: string }>(`auth:worker:${phoneHash}`, 1800);
    if (cached) {
      const valid = await verifyWorkerPassword(password, cached.password);
      if (!valid) {
        await recordFailure(phoneHash, ip);
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      await clearFailures(phoneHash, ip);
      memo.set(phoneHash, cached);
      const token = await generateToken(cached.worker_id, getJwtSecret(), remember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60);
      const response = NextResponse.json({ token, workerId: cached.worker_id, name: cached.name });
      setSessionCookie(response, token, !!remember);
      return response;
    }

    // 3. D1 query via getDB (schema lock already reduced to 3s)
    const d1 = await getDB();

    // Try all possible phone formats (880..., 01..., and bare 10-digit)
    const rawPhone = phone.replace(/\D/g, "");
    const phoneVariants: string[] = [cleanPhone];
    if (rawPhone !== cleanPhone) phoneVariants.push(rawPhone);
    if (!rawPhone.startsWith("0") && rawPhone.length === 10) {
      phoneVariants.push("0" + rawPhone);
      phoneVariants.push("880" + rawPhone);
    }

    let worker: { worker_id: string; name: string; password: string } | null | undefined;
    for (const variant of phoneVariants) {
      worker = await Promise.race([
        queryFirst<{ worker_id: string; name: string; password: string }>(d1,
          "SELECT worker_id, name, password FROM workers WHERE phone = ? AND membership_status IS NOT NULL",
          [variant]
        ),
        new Promise<undefined>((_, reject) =>
          setTimeout(() => reject(new Error("D1 query timed out")), D1_TIMEOUT_MS)
        ),
      ]).catch(() => undefined);
      if (worker) break;
    }

    if (!worker) {
      await recordFailure(phoneHash, ip);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Update phone to normalized format for future logins
    if (worker && cleanPhone !== rawPhone) {
      d1.DB.prepare("UPDATE workers SET phone = ? WHERE worker_id = ?").bind(cleanPhone, worker.worker_id).run().catch(() => {});
    }

    const valid = await verifyWorkerPassword(password, worker.password);
    if (!valid) {
      await recordFailure(phoneHash, ip);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    await clearFailures(phoneHash, ip);

    setCached(`auth:worker:${phoneHash}`, { worker_id: worker.worker_id, name: worker.name, password: worker.password }).catch(() => {});
    memo.set(phoneHash, { worker_id: worker.worker_id, name: worker.name, password: worker.password });

    const token = await generateToken(worker.worker_id, getJwtSecret(), remember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60);
    const response = NextResponse.json({ token, workerId: worker.worker_id, name: worker.name });
    setSessionCookie(response, token, !!remember);
    return response;
  } catch (error) {
    console.error("Worker login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
