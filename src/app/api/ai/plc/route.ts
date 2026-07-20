import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const STAGES = [
  {
    name: "Introduction",
    minSales: 0,
    maxSales: 1000,
    strategy: "Build awareness and early adoption through promotion and distribution",
    recommendations: ["Invest in marketing and promotion", "Focus on product quality", "Set competitive pricing", "Build distribution channels", "Gather customer feedback"],
  },
  {
    name: "Growth",
    minSales: 1000,
    maxSales: 10000,
    strategy: "Maximize market share and build brand preference",
    recommendations: ["Scale production capacity", "Expand distribution", "Differentiate from competitors", "Build brand loyalty", "Consider product extensions"],
  },
  {
    name: "Maturity",
    minSales: 10000,
    maxSales: 100000,
    strategy: "Defend market share and maximize profit",
    recommendations: ["Optimize production costs", "Defend market position", "Extend product line", "Focus on loyal customers", "Price competitively"],
  },
  {
    name: "Decline",
    minSales: 0,
    maxSales: 100000,
    strategy: "Harvest the product or consider discontinuation",
    recommendations: ["Reduce marketing spend", "Consider price reductions", "Explore niche segments", "Evaluate discontinuation", "Harvest remaining value"],
  },
]

const GROWTH_KEYWORDS = ["growing", "increasing", "rising", "expanding", "popular", "trending", "high growth", "rapid"]
const DECLINE_KEYWORDS = ["declining", "decreasing", "falling", "dropping", "shrinking", "obsolete", "dying", "sales down"]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const product: string = body.product || ""
    const salesData: number | undefined = body.salesData
    const growth: string = body.growth || ""

    if (!product) {
      return NextResponse.json({ error: "product is required" }, { status: 400 })
    }

    const sales = salesData ?? Math.floor(Math.random() * 50000) + 500
    const lower = growth.toLowerCase()
    const isGrowing = GROWTH_KEYWORDS.some((kw) => lower.includes(kw))
    const isDeclining = DECLINE_KEYWORDS.some((kw) => lower.includes(kw))

    let stage = STAGES[2]
    if (sales < 1000 || isGrowing && sales < 5000) stage = STAGES[0]
    else if ((sales >= 1000 && sales < 10000) || isGrowing) stage = STAGES[1]
    else if (sales >= 10000 && !isDeclining) stage = STAGES[2]
    else if (isDeclining || sales > 80000) stage = STAGES[3]

    return NextResponse.json({ stage: stage.name, strategy: stage.strategy, recommendations: stage.recommendations })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
