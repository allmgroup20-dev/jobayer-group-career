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
    const payRow = await queryFirst<{ worker_id: string; status: string }>(
      env, "SELECT worker_id, status FROM membership_payments WHERE tran_id = ?", [tranId]
    );
    if (!payRow) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (payRow.status === "VALID") return NextResponse.json({ success: true, already: true });

    let verified = false;
    try {
      const service = await SslcommerzService.fromDB(env);
      if (valId) verified = await service.validateIPNResponse({ ...data, amount, tran_id: tranId, val_id: valId });
    } catch (e) { console.error("Membership IPN", e); }

    if (verified) {
      const amt = Number(amount);
      const payAmtRow = await queryFirst<{ amount: number }>(env, "SELECT amount FROM membership_payments WHERE tran_id = ?", [tranId]);
      const expected = payAmtRow?.amount ?? 99;
      if (Number.isFinite(amt) && amt !== 0 && Math.abs(amt - expected) > 0.01 && (amt < 99 - 0.01 || amt > 10000 + 0.01)) {
        await execute(env, "UPDATE membership_payments SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [JSON.stringify(data), tranId]);
        return NextResponse.json({ success: false, reason: "amount_mismatch" });
      }
      await execute(env, "UPDATE membership_payments SET status = 'VALID', val_id = ?, gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [valId || null, JSON.stringify(data), tranId]);
      await execute(env, "UPDATE workers SET membership_status = 'premium' WHERE worker_id = ?", [payRow.worker_id]);
      try {
        const w = await queryFirst<{ elite_certificate_id: string | null }>(env, "SELECT elite_certificate_id FROM workers WHERE worker_id = ?", [payRow.worker_id]);
        if (!w?.elite_certificate_id) {
          const { generateEliteCertificateId } = await import("@/lib/share");
          let eliteId = "";
          for (let attempt = 0; attempt < 5; attempt++) {
            const candidate = generateEliteCertificateId();
            const clash = await queryFirst<{ worker_id: string }>(env, "SELECT worker_id FROM workers WHERE elite_certificate_id = ? OR certificate_id = ?", [candidate, candidate]);
            if (!clash) { eliteId = candidate; break; }
          }
          if (eliteId) await execute(env, "UPDATE workers SET elite_certificate_id = ?, elite_certificate_issued_at = datetime('now') WHERE worker_id = ?", [eliteId, payRow.worker_id]);
        }
      } catch {}
      return NextResponse.json({ success: true });
    }
    await execute(env, "UPDATE membership_payments SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?", [JSON.stringify(data), tranId]);
    return NextResponse.json({ success: false, reason: "verification_failed" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
export async function GET(request: NextRequest) { return POST(request); }
