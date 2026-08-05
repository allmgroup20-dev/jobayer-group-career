import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());

    const orderId = params.tran_id;
    const status = params.status;
    const valId = params.val_id;

    if (!orderId) {
      return NextResponse.redirect(new URL("/checkout?payment=error", request.url));
    }

    const env = await getDB();

    if (status !== "VALID" && status !== "VALIDATED") {
      await execute(env, "UPDATE orders SET order_status = 'failed' WHERE order_id = ?", [orderId]);
      return NextResponse.redirect(new URL(`/checkout?payment=failed&order=${orderId}`, request.url));
    }

    const service = await SslcommerzService.fromDB(env);
    // C2: val_id is mandatory — the browser return cannot self-certify a payment
    if (!valId) {
      return NextResponse.redirect(new URL(`/checkout?payment=verifying&order=${orderId}`, request.url));
    }
    const validation = await service.validatePayment(valId);
    if (!validation.validated) {
      await execute(env, "UPDATE orders SET order_status = 'failed' WHERE order_id = ?", [orderId]);
      return NextResponse.redirect(new URL(`/checkout?payment=failed&order=${orderId}`, request.url));
    }

    const existing = await queryFirst<{ payment_status: string; worker_id: string; total_amount: number; currency: string; product_id: number | null }>(
      env, "SELECT payment_status, worker_id, total_amount, currency, product_id FROM orders WHERE order_id = ?", [orderId]
    );

    if (!existing) {
      return NextResponse.redirect(new URL("/checkout?payment=error", request.url));
    }

    // C4: reconcile gateway amount with the stored order amount
    const gatewayAmount = Number(params.amount);
    if (Number.isFinite(gatewayAmount) && Math.abs(gatewayAmount - existing.total_amount) > 0.01) {
      await execute(env, "UPDATE orders SET order_status = 'failed' WHERE order_id = ?", [orderId]);
      return NextResponse.redirect(new URL(`/checkout?payment=failed&order=${orderId}`, request.url));
    }

    if (existing.payment_status === "paid") {
      return NextResponse.redirect(new URL("/dashboard/orders?payment=success", request.url));
    }

    // C3/C5: browser return is informational only — it never grants anything.
    // Grants are issued exclusively by the server-verified IPN handler.
    return NextResponse.redirect(new URL(`/checkout?payment=verifying&order=${orderId}`, request.url));
  } catch (error) {
    console.error("Payment success error:", error);
    return NextResponse.redirect(new URL("/checkout?payment=error", request.url));
  }
}
