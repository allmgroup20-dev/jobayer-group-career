import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const CHANNELS = [
  { channel: "Social Media", minPct: 0.2, maxPct: 0.4 },
  { channel: "Search Engine", minPct: 0.1, maxPct: 0.25 },
  { channel: "Email", minPct: 0.05, maxPct: 0.15 },
  { channel: "TV/Video", minPct: 0.1, maxPct: 0.3 },
  { channel: "Print", minPct: 0.05, maxPct: 0.1 },
  { channel: "Outdoor", minPct: 0.05, maxPct: 0.1 },
  { channel: "Influencer", minPct: 0.05, maxPct: 0.15 },
  { channel: "Events", minPct: 0.05, maxPct: 0.1 },
]

const AIDA_KEYWORDS: Record<string, string[]> = {
  attention: ["aware", "notice", "attention", "reach", "impression", "exposure", "visibility"],
  interest: ["interest", "engage", "curious", "learn", "explore", "consider", "information"],
  desire: ["desire", "want", "prefer", "aspire", "need", "must-have", "dream"],
  action: ["buy", "purchase", "convert", "sign up", "subscribe", "order", "call to action"],
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const goal: string = body.goal || ""
    const targetSegment: string = body.targetSegment || ""
    const budget: number = body.budget || 50000

    if (!goal || !targetSegment) {
      return NextResponse.json({ error: "goal and targetSegment are required" }, { status: 400 })
    }

    const lower = goal.toLowerCase() + " " + targetSegment.toLowerCase()

    const aida: Record<string, number> = { attention: 0, interest: 0, desire: 0, action: 0 }
    for (const [stage, keywords] of Object.entries(AIDA_KEYWORDS)) {
      aida[stage] = keywords.some((kw) => lower.includes(kw)) ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 30) + 40
    }

    const remaining = 1
    const channelMix = CHANNELS.sort(() => Math.random() - 0.5).slice(0, 4).map((ch) => {
      const pct = Math.round((remaining / 4) * 100)
      return { channel: ch.channel, percentage: pct, budget: Math.round(budget * (pct / 100)) }
    })

    const totalPct = channelMix.reduce((s, c) => s + c.percentage, 0)
    if (totalPct !== 100) {
      channelMix[channelMix.length - 1].percentage += 100 - totalPct
      channelMix[channelMix.length - 1].budget = Math.round(budget * (channelMix[channelMix.length - 1].percentage / 100))
    }

    const roi = Math.round(Math.random() * 300 + 50)

    return NextResponse.json({ aida, channelMix, roi })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
