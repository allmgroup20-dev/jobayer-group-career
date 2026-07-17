import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    const search = req.nextUrl.searchParams.get("search");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50"), 200);
    const offset = (page - 1) * limit;

    if (!workerId) {
      return NextResponse.json({ error: "workerId is required" }, { status: 400 });
    }

    const db = await ensureDB();
    let sql = "SELECT * FROM user_phonebooks WHERE worker_id = ?";
    const params: unknown[] = [workerId];

    if (search) {
      sql += " AND (contact_name LIKE ? OR contact_phone LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY has_whatsapp DESC, contact_name ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const contacts = await db.prepare(sql).bind(...params).all();
    const countResult = await db.prepare(
      "SELECT COUNT(*) as count FROM user_phonebooks WHERE worker_id = ?" + (search ? " AND (contact_name LIKE ? OR contact_phone LIKE ?)" : "")
    ).bind(...(search ? [workerId, `%${search}%`, `%${search}%`] : [workerId])).first() as { count: number } | undefined;

    return NextResponse.json({
      contacts: contacts.results || [],
      total: countResult?.count || 0,
      page, limit,
    });
  } catch (err) {
    console.error("Phonebook list error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      workerId: string;
      contacts: { phone: string; name?: string; deviceType?: string }[];
      source?: string;
    };

    if (!body.workerId || !body.contacts?.length) {
      return NextResponse.json({ error: "workerId and contacts[] required" }, { status: 400 });
    }

    const db = await ensureDB();
    let imported = 0;
    let updated = 0;

    for (const c of body.contacts) {
      const phone = c.phone.replace(/[^0-9]/g, "").replace(/^88/, "");
      if (!phone || phone.length < 10) continue;

      const existing = await db.prepare(
        "SELECT id FROM user_phonebooks WHERE worker_id = ? AND contact_phone = ?"
      ).bind(body.workerId, phone).first();

      const now = new Date().toISOString();

      if (existing) {
        await db.prepare(
          "UPDATE user_phonebooks SET contact_name = COALESCE(?, contact_name), device_type = COALESCE(?, device_type), last_checked_at = ?, source = ? WHERE id = ?"
        ).bind(c.name || null, c.deviceType || null, now, body.source || "manual_sync", (existing as { id: number }).id).run();
        updated++;
      } else {
        await db.prepare(
          "INSERT INTO user_phonebooks (worker_id, contact_phone, contact_name, device_type, has_whatsapp, source, last_checked_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        ).bind(body.workerId, phone, c.name || null, c.deviceType || null, 0, body.source || "manual_sync", now, now).run();
        imported++;
      }
    }

    return NextResponse.json({ imported, updated, total: body.contacts.length });
  } catch (err) {
    console.error("Phonebook sync error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
