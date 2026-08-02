import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const ENTRY_MODES = [
  {
    mode: "Exporting",
    risk: "Low",
    investment: "Low",
    timeline: "1-3 months",
    description: "Sell products directly to foreign markets with minimal investment",
  },
  {
    mode: "Licensing",
    risk: "Low-Medium",
    investment: "Low",
    timeline: "3-6 months",
    description: "License intellectual property to a local partner",
  },
  {
    mode: "Franchising",
    risk: "Medium",
    investment: "Medium",
    timeline: "6-12 months",
    description: "Franchise business model to local operators",
  },
  {
    mode: "Joint Venture",
    risk: "Medium",
    investment: "Medium-High",
    timeline: "6-18 months",
    description: "Partner with a local firm to share resources and risk",
  },
  {
    mode: "Wholly Owned Subsidiary",
    risk: "High",
    investment: "High",
    timeline: "12-24 months",
    description: "Full ownership and control of foreign operations",
  },
  {
    mode: "Strategic Alliance",
    risk: "Medium",
    investment: "Medium",
    timeline: "3-9 months",
    description: "Collaborate with a foreign partner without equity",
  },
]

const BUDGET_KEYWORDS: Record<string, string[]> = {
  low: ["low", "small", "limited", "tight", "minimal", "little", "cheap"],
  medium: ["moderate", "medium", "some", "reasonable", "average"],
  high: ["high", "large", "significant", "substantial", "big", "plenty", "ample"],
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const targetCountry: string = body.targetCountry || ""
    const skills: string = body.skills || ""
    const budget: string = body.budget || ""

    if (!targetCountry && !skills) {
      return NextResponse.json({ error: "targetCountry or skills is required" }, { status: 400 })
    }

    const lower = (budget + " " + skills + " " + targetCountry).toLowerCase()

    let budgetLevel = "medium"
    for (const [level, keywords] of Object.entries(BUDGET_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) {
        budgetLevel = level
        break
      }
    }

    const riskMap: Record<string, string> = { low: "Low", medium: "Medium", high: "High" }
    const safetyThresholds: Record<string, number> = { low: 1, medium: 2, high: 4 }
    const maxRiskIndex = safetyThresholds[budgetLevel] || 3

    const filtered = ENTRY_MODES.filter((_, i) => i <= maxRiskIndex)

    const recommended = filtered[filtered.length - 1].mode

    return NextResponse.json({ entryOptions: filtered, recommended })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
