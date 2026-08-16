import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached, invalidateCache } from "@/lib/cache";
import { requireCompany } from "@/lib/auth/guard";
import { FEATURE_FLAGS_CACHE_KEY } from "@/lib/features";

export async function GET() {
  try {
    const cached = await getCached<Record<string, boolean>>(FEATURE_FLAGS_CACHE_KEY, 30);
    if (cached) return NextResponse.json({ flags: cached });

    const db = await getDB();
    const rows = await query<{ feature_key: string; enabled: number }>(
      db,
      "SELECT feature_key, enabled FROM feature_flags"
    );
    const flags: Record<string, boolean> = {};
    for (const row of rows) flags[row.feature_key] = row.enabled === 1;
    await setCached(FEATURE_FLAGS_CACHE_KEY, flags);
    return NextResponse.json({ flags });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await requireCompany(request);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json() as { flags: { key: string; enabled: boolean }[] };
    if (!body.flags || !Array.isArray(body.flags)) {
      return NextResponse.json({ error: "flags array required" }, { status: 400 });
    }

    const db = await getDB();
    for (const f of body.flags) {
      await execute(db, "DELETE FROM feature_flags WHERE feature_key = ?", [f.key]);
      await execute(
        db,
        "INSERT INTO feature_flags (feature_key, enabled, updated_at) VALUES (?, ?, datetime('now'))",
        [f.key, f.enabled ? 1 : 0]
      );
    }

    await invalidateCache(FEATURE_FLAGS_CACHE_KEY);
    await invalidateCache("site_content:*");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}