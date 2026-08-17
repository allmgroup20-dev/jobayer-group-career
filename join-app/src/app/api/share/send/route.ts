import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensurePhonebookColumns, ensureWorkerProfileColumns, execute, normalizePhone, queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";
import { SHARE_TARGET, generateCertificateId, getShareSummary } from "@/lib/share";

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const { phone } = await request.json() as { phone?: string };
    const normalized = normalizePhone(phone);
    if (!normalized) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }

    const env = await getDB();
    await ensureWorkerProfileColumns(env);
    await ensurePhonebookColumns(env);

    const row = await queryFirst<{ id: number }>(
      env,
      "SELECT id FROM user_phonebooks WHERE worker_id = ? AND contact_phone = ? AND status != 'sent' LIMIT 1",
      [workerId, normalized]
    );

    if (row) {
      await execute(env,
        "UPDATE user_phonebooks SET status = 'sent', sent_at = datetime('now') WHERE id = ?",
        [row.id]
      ).catch(() => {});
      await execute(env,
        `INSERT INTO user_events (worker_id, event_type, page_url, page_category, metadata, created_at)
         VALUES (?, 'share_sent', '/complete', 'complete', ?, datetime('now'))`,
        [workerId, JSON.stringify({ phone: normalized })]
      ).catch(() => {});
    }

    const summary = await getShareSummary(env, workerId);

    // Certificate award when 25 distinct people have been shared to.
    if (summary.completed && !summary.certificateId) {
      let certificateId = "";
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = generateCertificateId();
        const clash = await queryFirst<{ worker_id: string }>(
          env, "SELECT worker_id FROM workers WHERE certificate_id = ?", [candidate]
        ).catch(() => null);
        if (!clash) { certificateId = candidate; break; }
      }
      if (certificateId) {
        await execute(env,
          `UPDATE workers SET certificate_progress = ?, share_task_completed_at = datetime('now'), certificate_id = ? WHERE worker_id = ?`,
          [SHARE_TARGET, certificateId, workerId]
        ).catch(() => {});
        await execute(env,
          `INSERT INTO user_events (worker_id, event_type, page_url, page_category, metadata, created_at)
           VALUES (?, 'share_task_completed', '/complete', 'complete', ?, datetime('now'))`,
          [workerId, JSON.stringify({ certificateId })]
        ).catch(() => {});
      }
      summary.certificateId = certificateId || null;
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Share send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}