import { NextRequest, NextResponse } from "next/server"

const UTILITY_LEVERS = [
  { key: "customer_productivity", nameEn: "Customer Productivity", nameBn: "গ্রাহক উৎপাদনশীলতা", desc: "Helps customers do things faster, better, cheaper" },
  { key: "simplicity", nameEn: "Simplicity", nameBn: "সরলতা", desc: "Reduces complexity, makes life easier" },
  { key: "convenience", nameEn: "Convenience", nameBn: "সুবিধা", desc: "Available where/when customers want it" },
  { key: "risk_reduction", nameEn: "Risk Reduction", nameBn: "ঝুঁকি হ্রাস", desc: "Reduces financial, performance, or trust risk" },
  { key: "fun_image", nameEn: "Fun & Image", nameBn: "মজা ও ইমেজ", desc: "Makes customers feel good, look good" },
  { key: "environmental", nameEn: "Environmental", nameBn: "পরিবেশগত", desc: "Social responsibility, eco-friendly, ethical" },
]

const BUYER_STAGES = [
  { key: "purchase", nameEn: "Purchase", nameBn: "ক্রয়" },
  { key: "delivery", nameEn: "Delivery", nameBn: "ডেলিভারি" },
  { key: "use", nameEn: "Use", nameBn: "ব্যবহার" },
  { key: "supplements", nameEn: "Supplements", nameBn: "পরিপূরক" },
  { key: "maintenance", nameEn: "Maintenance", nameBn: "রক্ষণাবেক্ষণ" },
  { key: "disposal", nameEn: "Disposal", nameBn: "নিষ্পত্তি" },
]

export async function GET() {
  return NextResponse.json({ levers: UTILITY_LEVERS, stages: BUYER_STAGES })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { matrix: Record<string, Record<string, number>> }
    const { matrix } = body
    const total = Object.values(matrix).flatMap((r) => Object.values(r)).reduce((s, v) => s + v, 0)
    const maxPossible = 36 * 3
    const score = Math.round((total / maxPossible) * 100)
    const topCells: { stage: string; lever: string; score: number }[] = []
    for (const [stage, levers] of Object.entries(matrix)) {
      for (const [lever, score2] of Object.entries(levers)) {
        if (score2 > 0) topCells.push({ stage, lever, score: score2 })
      }
    }
    topCells.sort((a, b) => b.score - a.score)
    return NextResponse.json({
      totalScore: score,
      rating: score >= 80 ? "Exceptional" : score >= 60 ? "Strong" : score >= 40 ? "Moderate" : "Weak",
      topOpportunities: topCells.slice(0, 6),
      summary: `Total utility score: ${score}%. ${score >= 60 ? "Strong blue ocean utility profile." : "Opportunities to improve utility across stages."}`,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
