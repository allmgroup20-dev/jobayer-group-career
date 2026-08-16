import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { requireCompany } from "@/lib/auth/guard";

export async function GET() {
  try {
    const db = await getDB();
    const rows = await query<{
      id: number;
      version: string;
      description: string | null;
      released_at: string | null;
      status: string;
    }>(db, "SELECT id, version, description, released_at, status FROM update_history ORDER BY released_at DESC");
    return NextResponse.json({ updates: rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireCompany(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { version: string; description?: string };
    if (!body.version) {
      return NextResponse.json({ error: "version required" }, { status: 400 });
    }

    const db = await getDB();
    await execute(
      db,
      "UPDATE update_history SET status = 'superseded' WHERE status = 'active'"
    ).then(() => {});
    await execute(
      db,
      "INSERT INTO update_history (version, description, released_at, status) VALUES (?, ?, datetime('now'), 'active')",
      [body.version, body.description ?? null]
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireCompany(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { id: number };
    if (!body.id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const db = await getDB();
    await execute(db, "DELETE FROM update_history WHERE id = ?", [body.id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}