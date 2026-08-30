import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { queryFirst, query } from "@/lib/queries";

interface ContentRow { section: string; content: string; enabled: number; }

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section");
  try {
    const env = await getDB();
    if (section) {
      const row = await queryFirst<ContentRow>(env, "SELECT section, content, enabled FROM site_content WHERE section = ?", [section]);
      return NextResponse.json({ section, content: row ? JSON.parse(row.content) : null, enabled: row ? row.enabled !== 0 : true });
    }
    const rows = await query<ContentRow>(env, "SELECT section, content, enabled FROM site_content");
    const sections: Record<string, { content: unknown; enabled: boolean }> = {};
    for (const row of rows) sections[row.section] = { content: JSON.parse(row.content), enabled: row.enabled !== 0 };
    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
