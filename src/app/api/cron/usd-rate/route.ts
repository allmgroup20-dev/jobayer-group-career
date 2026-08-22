import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { fetchDailyUSDBDT, saveUSDBDTRate } from "@/lib/rates";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret") || request.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET || "";
  if (expected && secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const env = await getDB();
    const rate = await fetchDailyUSDBDT();
    if (!rate) return NextResponse.json({ error: "Failed to fetch rate" }, { status: 500 });
    await saveUSDBDTRate(env, rate);
    return NextResponse.json({ success: true, rate, updatedAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
