import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const SALIENCE_KEYWORDS = ["aware", "recognize", "top of mind", "recall", "famous", "well-known", "popular", "leading"]
const PERFORMANCE_KEYWORDS = ["reliable", "durable", "effective", "quality", "functional", "works well", "feature", "performance"]
const IMAGERY_KEYWORDS = ["premium", "luxury", "modern", "sleek", "stylish", "design", "image", "aesthetic", "look", "feel"]
const JUDGMENTS_KEYWORDS = ["trust", "credible", "reliable brand", "reputation", "quality brand", "believable", "expert"]
const FEELINGS_KEYWORDS = ["love", "excited", "happy", "proud", "inspired", "connected", "warm", "emotional", "passion"]
const RESONANCE_KEYWORDS = ["loyal", "devoted", "recommend", "advocate", "community", "belong", "repeat", "sticky"]

function scoreKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase()
  let score = 0
  for (const kw of keywords) {
    const count = (lower.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length
    score += count
  }
  return Math.min(Math.round((score / 3) * 100), 100)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const text: string = body.text || ""

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const salience = scoreKeywords(text, SALIENCE_KEYWORDS)
    const performance = scoreKeywords(text, PERFORMANCE_KEYWORDS)
    const imagery = scoreKeywords(text, IMAGERY_KEYWORDS)
    const judgments = scoreKeywords(text, JUDGMENTS_KEYWORDS)
    const feelings = scoreKeywords(text, FEELINGS_KEYWORDS)
    const resonance = scoreKeywords(text, RESONANCE_KEYWORDS)

    const avg = (salience + performance + imagery + judgments + feelings + resonance) / 6
    const cbbLevel = Math.round(avg / 20)

    return NextResponse.json({ cbbLevel, salience, performance, imagery, judgments, feelings, resonance })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
