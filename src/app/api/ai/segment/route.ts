import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const GEO_KEYWORDS: Record<string, string[]> = {
  urban: ["city", "urban", "downtown", "metropolitan", "subway"],
  suburban: ["suburb", "suburban", "outskirts", "residential area"],
  rural: ["rural", "countryside", "village", "farm", "agricultural"],
  coastal: ["coastal", "beach", "port", "harbor", "coast"],
}

const DEMO_KEYWORDS: Record<string, string[]> = {
  genZ: ["gen z", "young adult", "teen", "student", "college"],
  millennial: ["millennial", "young professional", "startup"],
  genX: ["gen x", "middle-aged", "established", "family"],
  boomer: ["boomer", "retiree", "senior", "retired"],
  luxury: ["luxury", "premium", "affluent", "high-end", "wealthy"],
  budget: ["budget", "affordable", "cheap", "cost-effective", "value"],
}

const PSYCHO_KEYWORDS: Record<string, string[]> = {
  health: ["health", "wellness", "fitness", "organic", "natural"],
  tech: ["tech", "innovation", "gadget", "digital", "smart"],
  eco: ["eco", "sustainable", "green", "environment", "recycle"],
  adventure: ["adventure", "travel", "explore", "outdoor", "extreme"],
  homebody: ["comfort", "home", "cozy", "indoor", "relax"],
}

const BEHAVIOR_KEYWORDS: Record<string, string[]> = {
  frequent: ["frequent", "loyal", "repeat", "regular", "subscription"],
  seasonal: ["seasonal", "holiday", "occasion", "gift", "limited"],
  impulse: ["impulse", "bargain", "deal", "discount", "sale"],
  research: ["research", "compare", "review", "specs", "detailed"],
}

function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()
  return keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const text: string = body.text || ""
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    let bestGeo = { name: "", score: 0 }
    for (const [name, keywords] of Object.entries(GEO_KEYWORDS)) {
      const s = scoreKeywords(text, keywords)
      if (s > bestGeo.score) bestGeo = { name, score: s }
    }

    let bestDemo = { name: "", score: 0 }
    for (const [name, keywords] of Object.entries(DEMO_KEYWORDS)) {
      const s = scoreKeywords(text, keywords)
      if (s > bestDemo.score) bestDemo = { name, score: s }
    }

    let bestPsycho = { name: "", score: 0 }
    for (const [name, keywords] of Object.entries(PSYCHO_KEYWORDS)) {
      const s = scoreKeywords(text, keywords)
      if (s > bestPsycho.score) bestPsycho = { name, score: s }
    }

    let bestBehavior = { name: "", score: 0 }
    for (const [name, keywords] of Object.entries(BEHAVIOR_KEYWORDS)) {
      const s = scoreKeywords(text, keywords)
      if (s > bestBehavior.score) bestBehavior = { name, score: s }
    }

    const bases: string[] = []
    if (bestGeo.score > 0) bases.push(`geographic:${bestGeo.name}`)
    if (bestDemo.score > 0) bases.push(`demographic:${bestDemo.name}`)
    if (bestPsycho.score > 0) bases.push(`psychographic:${bestPsycho.name}`)
    if (bestBehavior.score > 0) bases.push(`behavioral:${bestBehavior.name}`)

    const segmentParts: string[] = []
    if (bestGeo.score > 0) segmentParts.push(bestGeo.name)
    if (bestDemo.score > 0) segmentParts.push(bestDemo.name)
    if (bestPsycho.score > 0) segmentParts.push(bestPsycho.name)
    if (bestBehavior.score > 0) segmentParts.push(bestBehavior.name)

    const marketSegment = segmentParts.length > 0 ? segmentParts.join(" ") : "general"
    const totalScore = bestGeo.score + bestDemo.score + bestPsycho.score + bestBehavior.score
    const confidence = Math.min(Math.round((totalScore / 8) * 100), 100)

    return NextResponse.json({ marketSegment, confidence, bases })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
