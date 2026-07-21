import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { SslcommerzService } from "@/lib/payment/sslcommerz";
import { distributeCommissions } from "@/lib/affiliate/commission";
import { sendWhatsAppMessage, generateWhatsAppTemplate } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = value.toString();
    }

    const env = await getDB();
    const service = await SslcommerzService.fromDB(env);
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
      return NextResponse.json({ status: "FAILED", reason: "No transaction ID" });
    }

    if (valId) {
      const validation = await service.validatePayment(valId);
      if (!validation.validated) {
        return NextResponse.json({ status: "FAILED", reason: "Payment validation failed" });
      }
    }

    const order = await queryFirst<{ payment_status: string; worker_id: string; total_amount: number; currency: string; product_id: number | null }>(
      env, "SELECT payment_status, worker_id, total_amount, currency, product_id FROM orders WHERE order_id = ?", [orderId]
    );

    if (!order) {
      return NextResponse.json({ status: "FAILED", reason: "Order not found" });
    }

    if (order.payment_status === "paid") {
      return NextResponse.json({ status: "OK", reason: "Already processed" });
    }

    await execute(env,
      `UPDATE orders SET payment_status = 'paid', transaction_id = ?, order_status = 'confirmed' WHERE order_id = ?`,
      [transactionId, orderId]
    );

    const sponsorChain = await getSponsorUpline(env, order.worker_id);
    await distributeCommissions(env, orderId, order.worker_id, order.total_amount, order.currency, sponsorChain, order.product_id ?? undefined);

    const worker = await queryFirst<{ name: string; phone: string }>(
      env, "SELECT name, phone FROM workers WHERE worker_id = ?", [order.worker_id]
    );

    if (worker) {
      try {
        const apiKey = process.env.WHATSAPP_API_KEY || "";
        if (apiKey) {
          const message = generateWhatsAppTemplate(worker.name, "order");
          await sendWhatsAppMessage({ to: worker.phone, text: message }, apiKey);
        }
      } catch {}
    }

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("IPN error:", error);
    return NextResponse.json({ status: "FAILED", reason: "Internal error" });
  }
}

interface SponsorRow { sponsor_id: string; }

async function getSponsorUpline(env: { DB: D1Database }, workerId: string): Promise<{ workerId: string; level: number }[]> {
  const chain: { workerId: string; level: number }[] = [];
  let currentId: string | null = workerId;
  let lvl = 1;

  while (currentId && lvl <= 10) {
    const sponsorRow: SponsorRow | null = await queryFirst<SponsorRow>(
      env, "SELECT sponsor_id FROM workers WHERE worker_id = ?", [currentId]
    );
    if (!sponsorRow?.sponsor_id) break;

    const exists = await queryFirst<{ worker_id: string }>(
      env, "SELECT worker_id FROM workers WHERE worker_id = ?", [sponsorRow.sponsor_id]
    );
    if (!exists) break;

    chain.push({ workerId: sponsorRow.sponsor_id, level: lvl });
    currentId = sponsorRow.sponsor_id;
    lvl++;
  }

  return chain;
}
