import { NextRequest, NextResponse } from "next/server";
import { queryFirst, query, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const db = await ensureDB();
    const search = request.nextUrl.searchParams.get("search");
    const phone = request.nextUrl.searchParams.get("phone");

    if (phone) {
      const prefs = await queryFirst<any>(
        { DB: db },
        "SELECT id, worker_id, phone, preferred_channel, messenger_id, telegram_id, whatsapp_opt_in, last_active_at, created_at, updated_at FROM user_platform_preferences WHERE phone LIKE ?",
        [`%${phone}%`]
      );
      return NextResponse.json(prefs || { error: "Not found" });
    }

    if (search) {
      const rows = await query<any>(
        { DB: db },
        "SELECT id, worker_id, phone, preferred_channel, messenger_id, telegram_id, whatsapp_opt_in, last_active_at, created_at, updated_at FROM user_platform_preferences WHERE phone LIKE ? ORDER BY last_active_at DESC",
        [`%${search}%`]
      );
      return NextResponse.json(rows);
    }

    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1"));
    const limit = 50;
    const offset = (page - 1) * limit;
    const rows = await query<any>(
      { DB: db },
      "SELECT id, worker_id, phone, preferred_channel, messenger_id, telegram_id, whatsapp_opt_in, last_active_at, created_at, updated_at FROM user_platform_preferences ORDER BY last_active_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    return NextResponse.json({ data: rows, page, limit });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const phone = typeof body.phone === "string" ? body.phone : "";
    const platform = typeof body.platform === "string" ? body.platform : "";
    const validPlatforms = ["whatsapp", "messenger", "telegram"];
    if (!phone || !validPlatforms.includes(platform)) {
      return NextResponse.json({ error: "phone and platform (whatsapp|messenger|telegram) required" }, { status: 400 });
    }
    const db = await ensureDB();
    await execute(
      { DB: db },
      `INSERT INTO user_platform_preferences (phone, preferred_platform, last_active_platform, platforms_tried, last_active_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
       ON CONFLICT(phone) DO UPDATE SET
         preferred_platform = excluded.preferred_platform,
         last_active_platform = excluded.last_active_platform,
         platforms_tried = excluded.platforms_tried,
         last_active_at = excluded.last_active_at,
         updated_at = datetime('now')`,
      [phone, platform, platform, JSON.stringify([platform])]
    );
    return NextResponse.json({ success: true, phone, preferredPlatform: platform });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone");
    if (!phone) {
      return NextResponse.json({ error: "phone query param required" }, { status: 400 });
    }
    const db = await ensureDB();
    await execute({ DB: db }, "DELETE FROM user_platform_preferences WHERE phone = ?", [phone]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
