import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

const TIERS = [
  { id: 1, key: "soon_to_leave", nameEn: "Tier 1 — Soon-to-Be Noncustomers", nameBn: "স্তর ১ — শীঘ্রই চলে যাওয়া অ-গ্রাহক", descEn: "People on the edge of your market who use your product minimally and are ready to leave. They're looking for something better.", descBn: "আপনার বাজারের প্রান্তে থাকা লোকেরা যারা আপনার পণ্য ন্যূনতম ব্যবহার করে এবং চলে যেতে প্রস্তুত। তারা আরও ভালো কিছু খুঁজছে।", questions: ["What do they dislike about current options?", "What would make them stay?", "What alternative are they considering?"] },
  { id: 2, key: "refusers", nameEn: "Tier 2 — Refusing Noncustomers", nameBn: "স্তর ২ — অস্বীকারকারী অ-গ্রাহক", descEn: "People who consciously chose AGAINST your offering. They've evaluated and said no.", descBn: "যারা সচেতনভাবে আপনার অফারের বিরুদ্ধে বেছে নিয়েছে। তারা মূল্যায়ন করেছে এবং 'না' বলেছে।", questions: ["What was their reason for saying no?", "Price? Complexity? Trust? Access?", "What would make them reconsider?"] },
  { id: 3, key: "unexplored", nameEn: "Tier 3 — Unexplored Noncustomers", nameBn: "স্তর ৩ — অনাবিষ্কৃত অ-গ্রাহক", descEn: "People in markets you've never considered. They don't even know your industry exists or don't see it as relevant.", descBn: "আপনি কখনও বিবেচনা করেননি এমন বাজারের লোকেরা। তারা জানে না আপনার শিল্প আছে বা এটিকে প্রাসঙ্গিক বলে মনে করে না।", questions: ["Who haven't we reached yet?", "What new value would we need to create?", "How can we make our offering relevant to them?"] },
]

const TIER_INSIGHTS = [
  { tierId: 1, exampleEn: "Callaway Golf: Realized most golfers don't care about winning tournaments — they just want to enjoy the game. Created 'Big Bertha' clubs for average players, not pros.", exampleBn: "Callaway Golf: বুঝতে পেরেছে বেশিরভাগ গলফার টুর্নামেন্ট জিততে চায় না — তারা শুধু খেলা উপভোগ করতে চায়। প্রো-এর জন্য নয়, সাধারণ খেলোয়াড়দের জন্য 'Big Bertha' ক্লাব তৈরি করেছে।" },
  { tierId: 2, exampleEn: "Southwest Airlines: People refused to fly because it was expensive and uncomfortable. Created a low-cost, no-frills model that turned refusers into loyal customers.", exampleBn: "Southwest Airlines: লোকেরা উড়তে অস্বীকার করেছিল কারণ এটি ব্যয়বহুল এবং অস্বস্তিকর ছিল। একটি কম খরচের মডেল তৈরি করেছে যা অস্বীকারকারীদের লয়াল গ্রাহকে পরিণত করেছে।" },
  { tierId: 3, exampleEn: "Nintendo Wii: Instead of competing for hardcore gamers (Tier 1/2), they targeted families, elderly, and casual players who had never considered a gaming console.", exampleBn: "Nintendo Wii: হার্ডকোর গেমারদের জন্য প্রতিযোগিতা না করে, তারা পরিবার, বয়স্ক এবং ক্যাজুয়াল খেলোয়াড়দের টার্গেট করেছে যারা কখনও গেমিং কনসোল বিবেচনা করেনি।" },
]

export async function GET() {
  try {
    const env = await getDB()
    const saved = await query<any>(env, "SELECT * FROM ai_knowledge_distribution WHERE source_id = 'blue_ocean_strategy' AND knowledge_title LIKE '%Three Tiers%' LIMIT 1")
    return NextResponse.json({
      tiers: TIERS,
      insights: TIER_INSIGHTS,
      knowledge: saved.length > 0 ? { title: saved[0].knowledge_title, content: saved[0].knowledge_content } : null,
    })
  } catch {
    return NextResponse.json({ tiers: TIERS, insights: TIER_INSIGHTS, knowledge: null })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { targetMarket: string; product?: string }
    const { targetMarket, product } = body
    return NextResponse.json({
      query: { targetMarket, product },
      analysis: TIERS.map((t) => ({
        tier: t,
        prompt: `Analyze ${product || targetMarket} through ${t.nameEn}. ${t.descEn} ${t.questions.join(" ")}`,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
