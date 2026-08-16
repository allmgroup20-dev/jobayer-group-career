import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached, invalidateCache } from "@/lib/cache";
import { requireCompany } from "@/lib/auth/guard";
import { isFeatureEnabled } from "@/lib/features";

const FLAG_GATED: Record<string, string> = {
  testimonials: "testimonials_feed",
  live_feed: "live_salary_feed",
  gallery: "payment_gallery",
};

interface ContentRow {
  section: string;
  content: string;
  enabled: number;
}

async function rowEnabled(section: string, row: ContentRow | null): Promise<boolean> {
  let enabled = row ? row.enabled !== 0 : true;
  const flag = FLAG_GATED[section];
  if (flag) enabled = enabled && (await isFeatureEnabled(flag));
  return enabled;
}

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get("section");
  try {
    const db = await getDB();

    if (section) {
      const cacheKey = `site_content:${section}`;
      const cached = await getCached<{ section: string; content: unknown; enabled: boolean }>(cacheKey, 60);
      if (cached) return NextResponse.json(cached);

      const row = await queryFirst<ContentRow>(db, "SELECT section, content, enabled FROM site_content WHERE section = ?", [section]);
      const enabled = await rowEnabled(section, row);
      const payload = { section, content: row ? JSON.parse(row.content) : null, enabled };
      await setCached(cacheKey, payload);
      return NextResponse.json(payload);
    }

    const cacheKey = "site_content:all";
    const cached = await getCached<{ sections: Record<string, { content: unknown; enabled: boolean }> }>(cacheKey, 60);
    if (cached) return NextResponse.json(cached);

    const rows = await query<ContentRow>(db, "SELECT section, content, enabled FROM site_content");
    const sections: Record<string, { content: unknown; enabled: boolean }> = {};
    for (const row of rows) {
      sections[row.section] = { content: JSON.parse(row.content), enabled: await rowEnabled(row.section, row) };
    }
    const payload = { sections };
    await setCached(cacheKey, payload);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireCompany(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { section: string; content?: unknown; enabled?: boolean };
    if (!body.section) {
      return NextResponse.json({ error: "section required" }, { status: 400 });
    }

    const db = await getDB();
    const content = body.content !== undefined ? JSON.stringify(body.content) : "{}";
    await execute(db, "DELETE FROM site_content WHERE section = ?", [body.section]);
    await execute(
      db,
      "INSERT INTO site_content (section, content, enabled, updated_at) VALUES (?, ?, ?, datetime('now'))",
      [body.section, content, body.enabled === false ? 0 : 1]
    );

    await invalidateCache("site_content:*");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}