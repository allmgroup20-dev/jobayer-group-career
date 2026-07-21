import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, execute } from "@/lib/db/queries"

export async function GET() {
  try {
    const env = await getDB()
    const rows = await query<any>(env, "SELECT * FROM errc_saved ORDER BY quadrant ASC")
    return NextResponse.json({ quadrants: rows })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { quadrant: string; content: string; category?: string }
    const { quadrant, content, category } = body
    const env = await getDB()
    const existing = await query<any>(env, "SELECT id FROM errc_saved WHERE quadrant = ? AND category = ?", [quadrant, category ?? "platform"])
    if (existing.length > 0) {
      await execute(env, "UPDATE errc_saved SET content = ?, updated_at = datetime('now') WHERE id = ?", [content, existing[0].id])
    } else {
      await execute(env, "INSERT INTO errc_saved (quadrant, content, category) VALUES (?, ?, ?)", [quadrant, content, category ?? "platform"])
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
