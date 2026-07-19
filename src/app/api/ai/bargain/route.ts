import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

const BASE_PRICE_PER_RESOURCE = 99;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { workerId: string; resourceCount: number };
    if (!body.workerId || !body.resourceCount) {
      return NextResponse.json({ error: "workerId and resourceCount required" }, { status: 400 });
    }

    if (body.resourceCount < 2) {
      return NextResponse.json({ error: "১টি রিসোর্সের জন্য বার্গেনিং করা যাবে না — মূল্য ফিক্সড ৯৯ ৳" }, { status: 400 });
    }

    const db = await getDB();
    const basePrice = body.resourceCount * BASE_PRICE_PER_RESOURCE;
    const message = `🛒 ${body.resourceCount}টি রিসোর্স = ৳${basePrice.toLocaleString()} (প্রতিটি ৳${BASE_PRICE_PER_RESOURCE})`;

    const result = await execute(db,
      `INSERT INTO bargain_sessions (worker_id, resource_count, base_price, current_offer, rounds) VALUES (?, ?, ?, ?, 0)`,
      [body.workerId, body.resourceCount, basePrice, basePrice]
    );
    const sessionId = result.meta.last_row_id;

    return NextResponse.json({
      sessionId,
      resourceCount: body.resourceCount,
      basePrice,
      currentOffer: basePrice,
      round: 0,
      message,
      canBargain: true,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 });
  }
}
