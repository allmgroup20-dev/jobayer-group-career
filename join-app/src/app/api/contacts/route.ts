import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { execute, queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const workerId = payload.sub;
    const { contacts } = await request.json() as { contacts?: { name?: string; phone?: string }[] };
    const list = (Array.isArray(contacts) ? contacts : [])
      .filter((c) => c && typeof c.phone === "string")
      .slice(0, 5000);

    if (list.length === 0) {
      return NextResponse.json({ error: "No contacts" }, { status: 400 });
    }

    const env = await getDB();

    // Batch-insert phonebook entries, ignoring duplicates.
    let added = 0;
    const BATCH = 100;
    for (let i = 0; i < list.length; i += BATCH) {
      const chunk = list.slice(i, i + BATCH);
      const stmts = chunk.map((c) => {
        const phone = String(c.phone).replace(/\D/g, "");
        return {
          sql: `INSERT OR IGNORE INTO user_phonebooks (worker_id, contact_phone, contact_name, has_whatsapp, source, created_at, updated_at)
                VALUES (?, ?, ?, 1, 'join_sync', datetime('now'), datetime('now'))`,
          params: [workerId, phone, c.name || null],
        };
      });
      const results = await env.DB.batch(stmts.map((s) => env.DB.prepare(s.sql).bind(...(s.params as unknown[]))));
      added += results.reduce((acc: number, r: D1Result) => acc + (r.meta?.changes ?? 0), 0);
    }

    return NextResponse.json({ success: true, total: list.length, added });
  } catch (error) {
    console.error("Contacts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
