import { NextRequest, NextResponse } from "next/server";
import { queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";
import { DEFAULT_PRICING_TIERS, type PricingTier } from "@/lib/site-content-defaults";

async function getTiers(): Promise<PricingTier[]> {
  const cached = await getCached<PricingTier[]>("pricing_tiers", 120);
  if (cached) return cached;
  try {
    const db = await getDB();
    const row = await queryFirst<{ content: string; enabled: number }>(
      db,
      "SELECT content, enabled FROM site_content WHERE section = 'pricing'"
    );
    if (row && row.enabled !== 0) {
      const parsed = JSON.parse(row.content) as { tiers?: PricingTier[] };
      if (Array.isArray(parsed.tiers) && parsed.tiers.length > 0) {
        const valid = parsed.tiers.filter(t => t && typeof t.id === "string" && typeof t.credits === "number");
        if (valid.length > 0) {
          const tiers = valid as PricingTier[];
          await setCached("pricing_tiers", tiers);
          return tiers;
        }
      }
    }
  } catch {}
  await setCached("pricing_tiers", DEFAULT_PRICING_TIERS);
  return DEFAULT_PRICING_TIERS;
}

export async function GET() {
  const TIERS = await getTiers();
  const publicTiers = TIERS.map(t => ({
    id: t.id, credits: t.credits, retailPrice: t.retailPrice,
    offerPrice: t.offerPrice, savings: t.savings, popular: t.popular,
    pricePerCredit: Math.round(t.offerPrice / t.credits),
    floor: t.floor,
  }));
  return NextResponse.json({ tiers: publicTiers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      tierId: string; desiredPrice: number; round?: number;
    };
    const TIERS = await getTiers();
    const tier = TIERS.find(t => t.id === body.tierId);
    if (!tier) return NextResponse.json({ error: "Invalid tier" }, { status: 400 });

    const round = body.round || 1;
    const maxBargainRounds = 3;

    if (round > maxBargainRounds) {
      return NextResponse.json({
        accepted: false, final: true,
        message: "আমরা সর্বোচ্চ চেষ্টা করেছি। শেষ অফারটি বিবেচনা করুন।",
        counterOffer: null,
      });
    }

    if (body.desiredPrice < tier.floor) {
      const gap = Math.round((tier.floor - body.desiredPrice) / 2);
      const counterOffer = Math.min(tier.offerPrice, tier.floor + gap + Math.round(Math.random() * 30));
      return NextResponse.json({
        accepted: false, final: round >= maxBargainRounds,
        message: round === 1
          ? `😅 আপনি অনেক কম বলেছেন! ${tier.credits}টি রিসোর্সের জন্য আমরা ৳${counterOffer} দিতে পারি। একটু বেশি ধরুন।`
          : `🤝 আমরা আরেকটু এগিয়ে এসেছি। ${tier.credits}টি রিসোর্সের জন্য ৳${counterOffer} — কি বলেন?`,
        counterOffer, round: round + 1,
      });
    }

    const finalPrice = Math.max(tier.floor, body.desiredPrice);
    return NextResponse.json({
      accepted: true, final: true,
      message: `🎉 ডিল হয়েছে! ${tier.credits}টি রিসোর্স = ৳${finalPrice.toLocaleString()}। আপনি একজন সত্যিকারের দরদামি!`,
      finalPrice, credits: tier.credits, tierId: tier.id,
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}