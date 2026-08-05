import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const orderId = params.tran_id;
    const status = params.status || params.Status;
    const valId = params.val_id;

    if (!orderId) {
      return NextResponse.redirect(new URL("/courses?payment=error", request.url));
    }

    const db = await getDB();
    const purchase = await queryFirst<any>(
      db, "SELECT * FROM resource_purchases WHERE order_id = ?", [orderId]
    );
    if (!purchase) {
      return NextResponse.redirect(new URL("/courses?payment=error", request.url));
    }

    if (purchase.payment_status === "completed") {
      return NextResponse.redirect(new URL("/courses?payment=success", request.url));
    }

    if (status && status !== "VALID" && status !== "VALIDATED") {
      await execute(db, "UPDATE resource_purchases SET payment_status = 'failed' WHERE order_id = ?", [orderId]);
      return NextResponse.redirect(new URL(`/courses?payment=failed&order=${orderId}`, request.url));
    }

    // C2: val_id is mandatory — a browser return cannot self-certify a payment
    if (!valId) {
      return NextResponse.redirect(new URL(`/courses?payment=verifying&order=${orderId}`, request.url));
    }

    const service = await SslcommerzService.fromDB(db);
    const validation = await service.validatePayment(valId);
    if (!validation.validated) {
      await execute(db, "UPDATE resource_purchases SET payment_status = 'failed' WHERE order_id = ?", [orderId]);
      return NextResponse.redirect(new URL(`/courses?payment=failed&order=${orderId}`, request.url));
    }

    // C3: this GET is informational only — it never grants.
    // Grants (unlock_limits / premium) are issued exclusively by the verified IPN handler.
    return NextResponse.redirect(new URL(`/courses?payment=verifying&order=${orderId}`, request.url));
  } catch (error) {
    return NextResponse.redirect(new URL("/courses?payment=error", request.url));
  }
}
