import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { queryFirstSafe } from "@/lib/db/queries";
import { verifyWorkerFromCookies } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) return NextResponse.json({ synced: false, count: 0 }, { status: 401 });
    const db = await getDB();
    const row = await queryFirstSafe<{ cnt: number }>(db, "SELECT COUNT(*) as cnt FROM user_phonebooks WHERE worker_id = ?", [payload.sub]);
    const count = row?.cnt ?? 0;
    return NextResponse.json({ synced: count > 0, count });
  } catch {
    return NextResponse.json({ synced: false, count: 0 }, { status: 500 });
  }
}
