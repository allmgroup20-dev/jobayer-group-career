import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString();
    }

    const db = await getDB();
    const service = await SslcommerzService.fromDB(db);
    if (!(await service.validateIPNResponse(params))) {
      return NextResponse.json({ status: "FAILED", reason: "IPN validation failed" }, { status: 400 });
    }

    if (params.status !== "VALID") {
      return NextResponse.json({ status: "FAILED", reason: "Transaction not valid" });
    }

    const orderId = params.tran_id;
    const transactionId = params.bank_tran_id || params.tran_id;
    const valId = params.val_id;

    if (!orderId || !valId) {
      return NextResponse.json({ status: "FAILED", reason: "Missing transaction identifier" });
    }

    const purchase = await queryFirst<any>(
      db, "SELECT * FROM resource_purchases WHERE order_id = ?", [orderId]
    );
    if (!purchase) {
      return NextResponse.json({ status: "FAILED", reason: "Order not found" });
    }

    // C4: reconcile gateway amount with the server-stored amount
    const gatewayAmount = Number(params.amount);
    if (Number.isFinite(gatewayAmount) && Math.abs(gatewayAmount - purchase.amount) > 0.01) {
      return NextResponse.json({ status: "FAILED", reason: "Amount mismatch" });
    }

    // C5: idempotent grant — only the first transition to 'completed' grants
    const result = await execute(db,
      `UPDATE resource_purchases SET payment_status = 'completed', transaction_id = ?, completed_at = datetime('now')
       WHERE order_id = ? AND payment_status != 'completed'`,
      [transactionId || orderId, orderId]
    );
    if (!result.meta.changes) {
      return NextResponse.json({ status: "OK", reason: "Already processed" });
    }

    const workerId = purchase.worker_id;
    const resourceCount = purchase.resource_count;

    const existingLimit = await queryFirst<any>(
      db, "SELECT max_unlocks FROM unlock_limits WHERE worker_id = ?", [workerId]
    );
    const currentMax = existingLimit?.max_unlocks || 0;
    const newMax = currentMax + resourceCount;

    await execute(db,
      `INSERT INTO unlock_limits (worker_id, max_unlocks, set_by, set_at, updated_at)
       VALUES (?, ?, 'payment', datetime('now'), datetime('now'))
       ON CONFLICT(worker_id) DO UPDATE SET max_unlocks = excluded.max_unlocks, updated_at = datetime('now')`,
      [workerId, newMax]
    );

    const worker = await queryFirst<any>(db, "SELECT membership_status FROM workers WHERE worker_id = ?", [workerId]);
    if (worker && worker.membership_status !== "premium") {
      await execute(db, "UPDATE workers SET membership_status = 'premium' WHERE worker_id = ?", [workerId]);
      await execute(db, "UPDATE resource_purchases SET premium_upgraded = 1 WHERE order_id = ?", [orderId]);
    }

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    return NextResponse.json({ status: "FAILED", reason: error instanceof Error ? error.message : "Internal error" });
  }
}
