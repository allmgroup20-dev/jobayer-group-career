import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { queryFirst, execute } from "@/lib/queries";
import { SslcommerzService } from "@/lib/sslcommerz";

export async function POST(request: NextRequest) {
  try {
    const ct = request.headers.get("content-type") || "";
    let data: Record<string, string> = {};
    if (ct.includes("application/json")) {
      const j = await request.json().catch(() => ({}));
      for (const [k, v] of Object.entries(j as Record<string, unknown>)) data[k] = String(v);
    } else {
      const form = await request.formData().catch(() => null);
      if (form) for (const [k, v] of form.entries()) data[k] = String(v);
      else {
        const t = await request.text().catch(() => "");
        if (t) { const p = new URLSearchParams(t); for (const [k, v] of p.entries()) data[k] = v; }
        for (const [k, v] of request.nextUrl.searchParams.entries()) if (!data[k]) data[k] = v;
      }
    }
    for (const [k, v] of request.nextUrl.searchParams.entries()) if (!data[k]) data[k] = v;

    const tranId = data.tran_id || data.tranId || "";
    const valId = data.val_id || data.valId || "";
    const amount = data.amount || "";
    if (!tranId) return NextResponse.json({ error: "tran_id required" }, { status: 400 });

    const env = await getDB();
    const row = await queryFirst<{ worker_id: string; status: string; total_bdt: number }>(
      env, "SELECT worker_id, status, total_bdt FROM delivery_orders WHERE tran_id = ?", [tranId]
    );
    if (!row) return NextResponse.json({ error: "order not found" }, { status: 404 });
    if (row.status === "VALID") return NextResponse.json({ success: true, already: true });

    let verified = false;
    try {
      const service = await SslcommerzService.fromDB(env);
      if (valId) verified = await service.validateIPNResponse({ ...data, amount, tran_id: tranId, val_id: valId });
    } catch (e) { console.error("Delivery IPN validation", e); }

    if (verified) {
      const amt = Number(amount);
      if (Number.isFinite(amt) && row.total_bdt && Math.abs(amt - row.total_bdt) > 1) {
        await execute(env, "UPDATE delivery_orders SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [JSON.stringify(data), tranId]);
        return NextResponse.json({ success: false, reason: "amount_mismatch" });
      }
      await execute(env, "UPDATE delivery_orders SET status = 'VALID', val_id = ?, gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [valId || null, JSON.stringify(data), tranId]);
      return NextResponse.json({ success: true });
    }
    await execute(env, "UPDATE delivery_orders SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [JSON.stringify(data), tranId]);
    return NextResponse.json({ success: false, reason: "verification_failed" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
export async function GET(request: NextRequest) { return POST(request); }
