import { NextRequest, NextResponse } from "next/server";
import { execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

const MIN_PRICE_FLOOR = 99;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { sessionId: number; desiredPrice: number };
    if (!body.sessionId || !body.desiredPrice) {
      return NextResponse.json({ error: "sessionId and desiredPrice required" }, { status: 400 });
    }

    const db = await getDB();
    const session = await queryFirst<any>(
      db, "SELECT * FROM bargain_sessions WHERE id = ? AND status = 'active'", [body.sessionId]
    );
    if (!session) {
      return NextResponse.json({ error: "Session not found or expired" }, { status: 404 });
    }

    const rounds = session.rounds + 1;
    const priceFloor = Math.max(MIN_PRICE_FLOOR, session.base_price * 0.5);

    if (body.desiredPrice >= session.current_offer * 0.85) {
      await execute(db,
        "UPDATE bargain_sessions SET current_offer = ?, rounds = ?, status = 'accepted', updated_at = datetime('now') WHERE id = ?",
        [body.desiredPrice, rounds, session.id]
      );
      return NextResponse.json({
        accepted: true,
        offer: body.desiredPrice,
        round: rounds,
        message: `✅ ডিল! ৳${body.desiredPrice.toLocaleString()} এ চূড়ান্ত।`,
      });
    }

    if (rounds >= 4) {
      await execute(db,
        "UPDATE bargain_sessions SET status = 'rejected', rounds = ?, updated_at = datetime('now') WHERE id = ?",
        [rounds, session.id]
      );
      return NextResponse.json({
        accepted: false,
        offer: null,
        round: rounds,
        message: "দুঃখিত, আর দাম কমানো সম্ভব নয়। সর্বশেষ অফারটি বিবেচনা করুন।",
        canContinue: false,
      });
    }

    const stepReduction = 5 + Math.floor(Math.random() * 11);
    const newOffer = Math.max(priceFloor, session.current_offer - stepReduction);

    const messages = [
      `ঠিক আছে, আপনার জন্য ৳${newOffer.toLocaleString()} দিলাম। শেষ কথা!`,
      `আপনার জন্যই ৳${newOffer.toLocaleString()} বললাম। এর কমে সম্ভব নয়।`,
      `বুঝলাম, ৳${newOffer.toLocaleString()} করতে পারি। ডিল?`,
    ];
    const message = messages[Math.min(rounds - 1, messages.length - 1)];

    await execute(db,
      "UPDATE bargain_sessions SET current_offer = ?, rounds = ?, updated_at = datetime('now') WHERE id = ?",
      [newOffer, rounds, session.id]
    );

    return NextResponse.json({
      accepted: false,
      offer: newOffer,
      round: rounds,
      message,
      canContinue: newOffer > priceFloor && rounds < 4,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal error" }, { status: 500 });
  }
}
