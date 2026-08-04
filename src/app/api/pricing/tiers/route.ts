import { NextRequest, NextResponse } from "next/server";

const TIERS = [
  { id: "one", credits: 1, retailPrice: 99, offerPrice: 99, floor: 89, savings: 0, popular: false },
  { id: "duo", credits: 2, retailPrice: 198, offerPrice: 198, floor: 179, savings: 0, popular: false },
  { id: "trio", credits: 3, retailPrice: 297, offerPrice: 220, floor: 200, savings: 26, popular: true },
  { id: "five", credits: 5, retailPrice: 495, offerPrice: 350, floor: 315, savings: 29, popular: false },
  { id: "ten", credits: 10, retailPrice: 990, offerPrice: 650, floor: 585, savings: 34, popular: false },
  { id: "twenty", credits: 20, retailPrice: 1980, offerPrice: 1200, floor: 1080, savings: 39, popular: false },
  { id: "fifty", credits: 50, retailPrice: 4950, offerPrice: 2800, floor: 2520, savings: 43, popular: false },
  { id: "hundred", credits: 100, retailPrice: 9900, offerPrice: 5200, floor: 4680, savings: 47, popular: false },
];

export async function GET() {
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
