import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const DIMENSIONS = [
  { name: "Tangibles", keywords: ["clean", "modern", "facility", "appearance", "equipment", "physical", "environment"] },
  { name: "Reliability", keywords: ["reliable", "consistent", "accurate", "dependable", "on time", "promise", "trust"] },
  { name: "Responsiveness", keywords: ["fast", "quick", "responsive", "timely", "immediate", "prompt", "speed"] },
  { name: "Assurance", keywords: ["confident", "trustworthy", "safe", "secure", "knowledgeable", "expert", "professional"] },
  { name: "Empathy", keywords: ["caring", "understanding", "personal", "attentive", "kind", "patient", "individual"] },
]

const ISSUE_KEYWORDS = [
  "problem", "issue", "complaint", "poor", "bad", "terrible", "slow",
  "rude", "unhelpful", "broken", "delay", "error", "mistake", "fail",
]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const text: string = body.text || ""

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const lower = text.toLowerCase()

    let bestDimension = DIMENSIONS[0]
    let bestScore = 0

    for (const dim of DIMENSIONS) {
      const score = dim.keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0)
      if (score > bestScore) {
        bestScore = score
        bestDimension = dim
      }
    }

    const issueCount = ISSUE_KEYWORDS.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0)
    const score = Math.max(10, Math.min(100, 80 - issueCount * 15 + Math.floor(Math.random() * 10)))

    const issues: string[] = []
    if (issueCount > 0) {
      issues.push("Customer reported issues in " + bestDimension.name.toLowerCase())
      if (issueCount > 2) issues.push("Multiple service failures detected")
      if (issueCount > 4) issues.push("Critical service breakdown")
    }

    const suggestion = `Focus on improving ${bestDimension.name.toLowerCase()} — train staff, review processes, and monitor feedback`

    return NextResponse.json({ dimension: bestDimension.name, score, issues, suggestion })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
