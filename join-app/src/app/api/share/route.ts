import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensurePhonebookColumns, ensureWorkerProfileColumns, execute, normalizePhone, query } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";
import { MAX_BATCH, checkWhatsAppNumbers, generateRoundToken, getShareSummary } from "@/lib/share";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const env = await getDB();
    await ensureWorkerProfileColumns(env);
    await ensurePhonebookColumns(env);
    const summary = await getShareSummary(env, payload.sub);
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Share GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const { contacts } = await request.json() as { contacts?: { name?: string; tel?: string; groupId?: string }[] };
    const list = Array.isArray(contacts) ? contacts : [];

    if (list.length > MAX_BATCH) {
      return NextResponse.json({ error: "MAX_BATCH" }, { status: 400 });
    }

    const env = await getDB();
    await ensureWorkerProfileColumns(env);
    await ensurePhonebookColumns(env);

    const existing = await query<{ contact_phone: string }>(
      env, "SELECT contact_phone FROM user_phonebooks WHERE worker_id = ? AND source = 'share_task'", [workerId]
    ).catch(() => []);
    const known = new Set(existing.map((r) => r.contact_phone));

    const added: string[] = [];
    const skipped: string[] = [];
    for (const c of list) {
      const phone = normalizePhone(c?.tel);
      if (!phone) continue;
      if (known.has(phone)) {
        skipped.push(phone);
        continue;
      }
      known.add(phone);
      added.push(phone);
    }

    // Each added contact gets its own unique single-use share token, so every
    // person receives a different link and a used token is never reused.
    // Also pre-check WhatsApp existence when the relay is reachable.
    const waMap = added.length > 0 ? await checkWhatsAppNumbers(added) : {};

    for (const phone of added) {
      const wa = waMap[phone] === false ? "0" : "1";
      const token = generateRoundToken();
      const item = list.find((c) => normalizePhone(c?.tel) === phone);
      await execute(env,
        `INSERT INTO user_phonebooks (worker_id, contact_phone, contact_name, source, status, share_token, wa_exists, group_id, created_at)
         VALUES (?, ?, ?, 'share_task', 'selected', ?, ?, ?, datetime('now'))`,
        [workerId, phone, item?.name || "", token, wa, item?.groupId || null]
      ).catch(() => {});
    }

    if (added.length > 0) {
      await execute(env,
        `INSERT INTO user_events (worker_id, event_type, page_url, page_category, metadata, created_at)
         VALUES (?, 'share_selected', '/complete', 'complete', ?, datetime('now'))`,
        [workerId, JSON.stringify({ count: added.length, phones: added })]
      ).catch(() => {});
    }

    const summary = await getShareSummary(env, workerId);
    return NextResponse.json({
      ...summary,
      added: added.length,
      skipped: skipped.length,
      noWhatsApp: added.filter((p) => waMap[p] === false),
    });
  } catch (error) {
    console.error("Share POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}