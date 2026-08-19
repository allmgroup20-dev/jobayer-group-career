import { NextRequest, NextResponse } from "next/server";
import { getDB, getKV } from "@/lib/env";
import { ensureScreenshotTable, execute, queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";

// Referral Ambassador screenshot proof (certificate_level 2).
// POST: upload up to 4 screenshots → stored in KV ('shots:' keys) with a 48h
//       TTL so they auto-delete after the admin verifies; metadata → D1.
// GET:  the worker's current submission status (pending / verified / rejected).
const MAX_FILES = 4;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB each
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const TTL_SECONDS = 48 * 3600; // review window; shortened to 10 min after verify

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;

    const env = await getDB();
    await ensureScreenshotTable(env);

    // Only one pending submission at a time.
    const existing = await queryFirst<{ id: number; status: string }>(
      env,
      `SELECT id, status FROM screenshot_submissions WHERE worker_id = ? AND certificate_level = 2 ORDER BY id DESC LIMIT 1`,
      [workerId]
    ).catch(() => null);
    if (existing && existing.status === "pending") {
      return NextResponse.json({ error: "একটি জমা ইতিমধ্যে ভেরিফাইয়ের অপেক্ষায় আছে" }, { status: 409 });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "ছবি পাঠানো যায়নি" }, { status: 400 });
    }
    const files = (form.getAll("files") || []).filter((f): f is File => typeof f !== "string" && "arrayBuffer" in f);
    if (files.length === 0) {
      return NextResponse.json({ error: "অন্তত ১টি স্ক্রিনশট দিন" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `সর্বোচ্চ ${MAX_FILES}টি স্ক্রিনশট জমা দিতে পারবেন` }, { status: 400 });
    }
    for (const f of files) {
      if (!ALLOWED.has(f.type)) {
        return NextResponse.json({ error: "শুধু JPG/PNG/WebP ছবি দিন" }, { status: 400 });
      }
      if (f.size > MAX_BYTES) {
        return NextResponse.json({ error: "প্রতিটি ছবি সর্বোচ্চ ৫MB হতে পারবে" }, { status: 400 });
      }
    }

    const kv = await getKV();
    const stamp = Date.now();
    const keys: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const ext = files[i].type === "image/png" ? "png" : files[i].type === "image/webp" ? "webp" : "jpg";
      const key = `shots:${workerId}:2:${stamp}-${i}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const buf = new Uint8Array(await files[i].arrayBuffer());
      await kv.CACHE.put(key, buf, { expirationTtl: TTL_SECONDS });
      keys.push(key);
    }

    const res = await execute(
      env,
      `INSERT INTO screenshot_submissions (worker_id, certificate_level, status, kv_keys, created_at)
       VALUES (?, 2, 'pending', ?, datetime('now'))`,
      [workerId, JSON.stringify(keys)]
    ).catch(() => null);
    if (!res) {
      // Roll back KV keys so nothing lingers.
      await Promise.all(keys.map((k) => kv.CACHE.delete(k).catch(() => {})));
      return NextResponse.json({ error: "সংরক্ষণ করা যায়নি — আবার চেষ্টা করুন" }, { status: 500 });
    }

    await execute(env,
      `INSERT INTO user_events (worker_id, event_type, page_url, page_category, metadata, created_at)
       VALUES (?, 'screenshots_submitted', '/complete', 'complete', ?, datetime('now'))`,
      [workerId, JSON.stringify({ certificateLevel: 2, count: keys.length })]
    ).catch(() => {});

    return NextResponse.json({ ok: true, count: keys.length });
  } catch (error) {
    console.error("Screenshot upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const env = await getDB();
    await ensureScreenshotTable(env);

    const row = await queryFirst<{ id: number; status: string; saved_for_ai: number; created_at: string; admin_verified_at: string | null; kv_keys: string }>(
      env,
      `SELECT id, status, saved_for_ai, created_at, admin_verified_at, kv_keys
       FROM screenshot_submissions WHERE worker_id = ? AND certificate_level = 2 ORDER BY id DESC LIMIT 1`,
      [workerId]
    ).catch(() => null);

    if (!row) {
      return NextResponse.json({ status: "none", count: 0 });
    }

    let count = 0;
    try { count = (JSON.parse(row.kv_keys || "[]") as string[]).length; } catch {}

    return NextResponse.json({
      submissionId: row.id,
      status: row.status,
      count,
      savedForAi: !!row.saved_for_ai,
      submittedAt: row.created_at,
      verifiedAt: row.admin_verified_at,
    });
  } catch (error) {
    console.error("Screenshot status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}