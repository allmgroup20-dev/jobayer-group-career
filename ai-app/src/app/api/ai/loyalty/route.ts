import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const STAGES = ["awareness", "exploration", "familiarity", "commitment", "partnership"]

const STAGE_KEYWORDS: Record<string, string[]> = {
  awareness: ["new", "first time", "trial", "curious", "discover"],
  exploration: ["try", "exploring", "considering", "comparing", "sampling"],
  familiarity: ["repeat", "regular", "frequent", "loyal", "habit"],
  commitment: ["dedicated", "exclusive", "prefer", "trust", "committed"],
  partnership: ["advocate", "partner", "evangelist", "promote", "refer"],
}

const NPS_CATEGORIES = ["detractor", "detractor", "passive", "passive", "promoter", "promoter", "promoter"]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const text: string = body.text || ""
    const customerId: string = body.customerId || ""

    if (!text && !customerId) {
      return NextResponse.json({ error: "customerId or text is required" }, { status: 400 })
    }

    const lower = text.toLowerCase()
    let loyaltyStage = "awareness"
    let bestScore = 0

    for (const [stage, keywords] of Object.entries(STAGE_KEYWORDS)) {
      const score = keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0)
      if (score > bestScore) {
        bestScore = score
        loyaltyStage = stage
      }
    }

    const avgPurchase = Math.floor(Math.random() * 150) + 20
    const frequency = Math.floor(Math.random() * 10) + 1
    const lifetime = Math.floor(Math.random() * 36) + 6
    const total = avgPurchase * frequency * lifetime

    const npsScore = Math.floor(Math.random() * 60) + 10
    const npsCategory = npsScore >= 70 ? "promoter" : npsScore >= 50 ? "passive" : "detractor"

    return NextResponse.json({
      loyaltyStage,
      clv: { avgPurchase, frequency, lifetime, total },
      nps: { score: npsScore, category: npsCategory },
    })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
