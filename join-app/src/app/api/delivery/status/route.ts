import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const tranId = request.nextUrl.searchParams.get("tran_id") || request.nextUrl.searchParams.get("tranId") || "";
    const env = await getDB();
    if (tranId) {
      const row = await queryFirst<{ status: string; total_bdt: number; tier: string }>(
        env, "SELECT status, total_bdt, tier FROM delivery_orders WHERE tran_id = ? AND worker_id = ?", [tranId, payload.sub]
      );
      if (!row) return NextResponse.json({ status: "not_found" });
      return NextResponse.json({ status: row.status, totalBdt: row.total_bdt, tier: row.tier, tranId });
    }
    const row = await queryFirst<{ status: string; tran_id: string }>(
      env, "SELECT status, tran_id FROM delivery_orders WHERE worker_id = ? ORDER BY id DESC LIMIT 1", [payload.sub]
    );
    if (!row) return NextResponse.json({ status: "none" });
    return NextResponse.json({ status: row.status, tranId: row.tran_id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
