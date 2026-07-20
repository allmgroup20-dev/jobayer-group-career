import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const ANSOFF_STRATEGIES = [
  {
    strategy: "Market Penetration",
    baseKey: "existing",
    description: "Sell existing products in existing markets to increase market share",
    risk: "Low",
    suitability: "Strong brand with room to grow in current market",
  },
  {
    strategy: "Market Development",
    baseKey: "new market",
    description: "Enter new markets with existing products",
    risk: "Medium",
    suitability: "Product has proven success elsewhere; new geographic or demographic targets",
  },
  {
    strategy: "Product Development",
    baseKey: "new product",
    description: "Create new products for existing markets",
    risk: "Medium",
    suitability: "Deep understanding of customer needs; existing R&D capability",
  },
  {
    strategy: "Diversification",
    baseKey: "new both",
    description: "Develop new products for entirely new markets",
    risk: "High",
    suitability: "Strong financial resources and risk tolerance",
  },
]

const GOAL_KEYWORDS: Record<string, string> = {
  share: "Market Penetration",
  grow: "Market Penetration",
  expand: "Market Penetration",
  dominate: "Market Penetration",
  new_region: "Market Development",
  new_country: "Market Development",
  international: "Market Development",
  new_product: "Product Development",
  innovate: "Product Development",
  diversify: "Diversification",
  new_business: "Diversification",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const currentMarket: string = body.currentMarket || ""
    const currentProduct: string = body.currentProduct || ""
    const goals: string = body.goals || ""

    if (!currentMarket || !currentProduct) {
      return NextResponse.json({ error: "currentMarket and currentProduct are required" }, { status: 400 })
    }

    const lower = (goals + " " + currentMarket + " " + currentProduct).toLowerCase()

    let recommended = "Market Penetration"
    for (const [keyword, strategy] of Object.entries(GOAL_KEYWORDS)) {
      if (lower.includes(keyword)) {
        recommended = strategy
        break
      }
    }

    const ansoff = ANSOFF_STRATEGIES.map((s) => ({
      strategy: s.strategy,
      description: s.description,
      risk: s.risk,
      suitability: s.suitability,
    }))

    return NextResponse.json({ ansoff, recommended })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
