import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensurePhonebookColumns, ensureWorkerProfileColumns, execute, normalizePhone, query, queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";
import { SHARE_TARGET, generateCertificateId, getShareSummary } from "@/lib/share";

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const body = await request.json() as { phone?: string; roundToken?: string };
    const env = await getDB();
    await ensureWorkerProfileColumns(env);
    await ensurePhonebookColumns(env);

    // Two modes: a single phone, or an entire round (roundToken) — the single
    // WhatsApp action marks the whole batch. Only numbers that exist on
    // WhatsApp (wa_exists != '0') can be marked sent.
    if (body.roundToken) {
      await execute(env,
        `UPDATE user_phonebooks SET status = 'sent', sent_at = datetime('now')
         WHERE worker_id = ? AND source = 'share_task' AND status = 'selected' AND share_token = ? AND (wa_exists IS NULL OR wa_exists != '0')`,
        [workerId, body.roundToken]
      ).catch(() => {});
    } else if (body.phone) {
      const normalized = normalizePhone(body.phone);
      if (!normalized) {
        return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
      }
      // Re-send is allowed: a contact that was already shared may be sent again
      // (its row stays in the list, badge shows "already sent"). Count stays
      // distinct so it never inflates the 30-person target.
      await execute(env,
        `UPDATE user_phonebooks SET status = 'sent', sent_at = datetime('now')
         WHERE worker_id = ? AND contact_phone = ? AND (wa_exists IS NULL OR wa_exists != '0')`,
        [workerId, normalized]
      ).catch(() => {});
    } else {
      return NextResponse.json({ error: "phone or roundToken required" }, { status: 400 });
    }

    await execute(env,
      `INSERT INTO user_events (worker_id, event_type, page_url, page_category, metadata, created_at)
       VALUES (?, 'share_sent', '/complete', 'complete', ?, datetime('now'))`,
      [workerId, JSON.stringify(body.roundToken ? { round: body.roundToken } : { phone: normalizePhone(body.phone) })]
    ).catch(() => {});

    const summary = await getShareSummary(env, workerId);

    // Certificate award when SHARE_TARGET distinct people have been shared to.
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