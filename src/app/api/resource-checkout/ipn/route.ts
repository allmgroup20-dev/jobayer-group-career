import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst } from "@/lib/db/queries";
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
    if (!service.validateIPNResponse(params)) {
      return NextResponse.json({ status: "FAILED", reason: "IPN validation failed" }, { status: 400 });
    }

    if (params.status !== "VALID") {
      return NextResponse.json({ status: "FAILED", reason: "Transaction not valid" });
    }

    const orderId = params.tran_id;
    const transactionId = params.bank_tran_id || params.tran_id;
    const valId = params.val_id;

    if (!orderId) {
      return NextResponse.json({ status: "FAILED", reason: "No order ID" });
    }

    const purchase = await queryFirst<any>(
      db, "SELECT * FROM resource_purchases WHERE order_id = ?", [orderId]
    );
    if (!purchase) {
      return NextResponse.json({ status: "FAILED", reason: "Order not found" });
    }

    if (purchase.payment_status === "completed") {
      return NextResponse.json({ status: "OK", reason: "Already processed" });
    }

    await execute(db,
      `UPDATE resource_purchases SET payment_status = 'completed', transaction_id = ?, completed_at = datetime('now') WHERE order_id = ?`,
      [transactionId || orderId, orderId]
    );

    const workerId = purchase.worker_id;
    const resourceCount = purchase.resource_count;

    const existingUnlocks = await queryFirst<any>(
      db, "SELECT COUNT(*) as cnt FROM user_unlocks WHERE worker_id = ?", [workerId]
    );
    const existingCount = existingUnlocks?.cnt || 0;

    const courses = await execute(
      db, `SELECT id FROM courses WHERE is_premium = 1 ORDER BY id LIMIT ? OFFSET ?`,
      [resourceCount, existingCount]
    );

    if (courses.results && courses.results.length > 0) {
      const insertStmts = (courses.results as any[]).map(c =>
        db.DB.prepare(
          `INSERT OR IGNORE INTO user_unlocks (course_id, worker_id, unlocked_by, unlocked_at) VALUES (?, ?, 'payment', datetime('now'))`
        ).bind(c.id, workerId)
      );
      if (insertStmts.length > 0) await db.DB.batch(insertStmts);
    }

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
