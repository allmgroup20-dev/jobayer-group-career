import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensurePhonebookColumns, ensureWorkerProfileColumns, execute, normalizePhone } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";
import { buildShareLink, buildShareText, generateRoundToken } from "@/lib/share";

// Rotates a contact's share token so EVERY send (first or re-send) produces a
// brand-new, never-before-used referral link. Attribution only relies on the
// `ref` (workerId) query param, so the fresh token is safe even if the row
// doesn't exist yet (e.g. manual send before any picker add).
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const body = await request.json() as { phone?: string };
    const env = await getDB();
    await ensureWorkerProfileColumns(env);
    await ensurePhonebookColumns(env);

    const siteUrl = process.env.SITE_URL || "https://youtube.earner.workers.dev";
    const token = generateRoundToken();

    if (body.phone) {
      const normalized = normalizePhone(body.phone);
      if (normalized) {
        await execute(env,
          `UPDATE user_phonebooks SET share_token = ? WHERE worker_id = ? AND contact_phone = ?`,
          [token, workerId, normalized]
        ).catch(() => {});
      }
    }

    await execute(env,
      `INSERT INTO user_events (worker_id, event_type, page_url, page_category, metadata, created_at)
       VALUES (?, 'share_token_issued', '/complete', 'complete', ?, datetime('now'))`,
      [workerId, JSON.stringify({ phone: body.phone ? normalizePhone(body.phone) : null })]
    ).catch(() => {});

    return NextResponse.json({
      link: buildShareLink(siteUrl, workerId, token),
      shareText: buildShareText(siteUrl, workerId, token),
      token,
    });
  } catch (error) {
    console.error("Share token error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}