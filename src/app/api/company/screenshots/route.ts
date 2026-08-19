import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { initEnv } from "@/lib/env";
import { verifyCompanyToken, getJwtSecret } from "@/lib/auth";

// Admin panel for the Referral Ambassador screenshot proof (join-app uploads).
// GET:  list submissions (newest first) with worker info + KV keys.
// POST: { id, action: "verify" | "reject", savedForAi?: boolean }
//   verify → status=verified, KV keys re-put with 10-min TTL (auto-delete);
//            if savedForAi, a copy moves to 'shots-ai:' (no TTL) for future AI.
//   reject → status=rejected, KV keys deleted immediately.
async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get("company_token")?.value;
  if (!token) return null;
  return await verifyCompanyToken(token, getJwtSecret());
}

interface ScreenshotRow {
  id: number;
  worker_id: string;
  certificate_level: number;
  status: string;
  kv_keys: string;
  saved_for_ai: number;
  admin_verified_at: string | null;
  created_at: string;
  worker_name: string | null;
  worker_phone: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = await initEnv();
    const rows = await query<ScreenshotRow>(
      db,
      `SELECT s.id, s.worker_id, s.certificate_level, s.status, s.kv_keys, s.saved_for_ai,
              s.admin_verified_at, s.created_at, w.name AS worker_name, w.phone AS worker_phone
       FROM screenshot_submissions s
       LEFT JOIN workers w ON w.worker_id = s.worker_id
       ORDER BY s.id DESC LIMIT 100`
    );
    const list = rows.map((r) => {
      let keys: string[] = [];
      try { keys = JSON.parse(r.kv_keys || "[]") as string[]; } catch {}
      return {
        id: r.id,
        workerId: r.worker_id,
        certificateLevel: r.certificate_level,
        status: r.status,
        kvKeys: keys,
        savedForAi: !!r.saved_for_ai,
        verifiedAt: r.admin_verified_at,
        createdAt: r.created_at,
        workerName: r.worker_name,
        workerPhone: r.worker_phone,
      };
    });
    return NextResponse.json({ screenshots: list });
  } catch (error) {
    console.error("Screenshots list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json() as { id: number; action: string; savedForAi?: boolean };
    if (!body.id || !["verify", "reject"].includes(body.action)) {
      return NextResponse.json({ error: "id and action (verify|reject) are required" }, { status: 400 });
    }

    const db = await initEnv();
    const row = await queryFirst<ScreenshotRow>(
      db,
      `SELECT id, worker_id, status, kv_keys, saved_for_ai FROM screenshot_submissions WHERE id = ?`,
      [body.id]
    );
    if (!row) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    let keys: string[] = [];
    try { keys = JSON.parse(row.kv_keys || "[]") as string[]; } catch {}

    const kv = db.CACHE;

    if (body.action === "verify") {
      // Keep images for 10 more minutes after verification, then auto-delete.
      for (const key of keys) {
        const buf = await kv.get(key).catch(() => null);
        if (buf) {
          await kv.put(key, buf, { expirationTtl: 600 }).catch(() => {});
        }
        if (body.savedForAi && buf) {
          // Move a copy to the AI-training bucket (no TTL → kept for good).
          const aiKey = key.startsWith("shots:") ? `shots-ai:${key.slice("shots:".length)}` : `shots-ai:${key}`;
          await kv.put(aiKey, buf, { metadata: { source: key, verifiedAt: new Date().toISOString() } }).catch(() => {});
        }
      }
      await execute(
        db,
        `UPDATE screenshot_submissions SET status = 'verified', saved_for_ai = ?, admin_verified_at = datetime('now') WHERE id = ?`,
        [body.savedForAi ? 1 : row.saved_for_ai, body.id]
      );
      return NextResponse.json({ success: true, status: "verified" });
    }

    // reject → wipe the images now.
    for (const key of keys) {
      await kv.delete(key).catch(() => {});
    }
    await execute(
      db,
      `UPDATE screenshot_submissions SET status = 'rejected', admin_verified_at = datetime('now') WHERE id = ?`,
      [body.id]
    );
    return NextResponse.json({ success: true, status: "rejected" });
  } catch (error) {
    console.error("Screenshots action error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}