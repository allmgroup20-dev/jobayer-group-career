import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { createContact } from "@/lib/whatsapp/contacts";

export async function GET(request: NextRequest) {
  try {
    const env = await getDB();
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");

    let sql = "SELECT * FROM wa_contacts";
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (search) {
      conditions.push("(phone LIKE ? OR name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY priority_score DESC, updated_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const contacts = await query(env, sql, params);
    const total = await query<{ count: number }>(env,
      "SELECT COUNT(*) as count FROM wa_contacts" + (conditions.length ? " WHERE " + conditions.join(" AND ") : ""),
      status ? [status] : []
    );

    return NextResponse.json({ contacts, total: total[0]?.count || 0 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load contacts"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phone, name, source, notes, import: importList } = await request.json() as {
      phone?: string; name?: string; source?: string; notes?: string; import?: { phone: string; name?: string }[];
    };

    const env = await getDB();

    if (importList?.length) {
      let imported = 0;
      for (const item of importList) {
        await createContact(item.phone, { name: item.name, source: source || "import", notes });
        imported++;
      }
      return NextResponse.json({ imported });
    }

    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
    await createContact(phone, { name, source: source || "manual", notes });
    return NextResponse.json({ created: true, phone });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to create contact"
    }, { status: 500 });
  }
}
