import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const STRATEGIES = [
  { name: "Premium Pricing", description: "Set a high price to reflect exclusivity and superior quality" },
  { name: "Penetration Pricing", description: "Set a low price to quickly gain market share" },
  { name: "Value-Based Pricing", description: "Price based on perceived value to the customer" },
  { name: "Competitive Pricing", description: "Price aligned with competitor offerings" },
  { name: "Cost-Plus Pricing", description: "Add a standard markup to the production cost" },
  { name: "Skimming Pricing", description: "Start high and gradually lower over time" },
  { name: "Bundle Pricing", description: "Offer multiple products together at a discount" },
  { name: "Psychological Pricing", description: "Use price points like $9.99 to influence perception" },
  { name: "Freemium Pricing", description: "Offer basic features free, charge for premium" },
  { name: "Dynamic Pricing", description: "Adjust prices based on demand and market conditions" },
]

const KEYWORD_STRATEGY_MAP: Record<string, string> = {
  luxury: "Premium Pricing",
  exclusive: "Premium Pricing",
  premium: "Premium Pricing",
  high: "Premium Pricing",
  cheap: "Penetration Pricing",
  affordable: "Penetration Pricing",
  budget: "Penetration Pricing",
  value: "Value-Based Pricing",
  worth: "Value-Based Pricing",
  perceive: "Value-Based Pricing",
  competitor: "Competitive Pricing",
  market: "Competitive Pricing",
  similar: "Competitive Pricing",
  cost: "Cost-Plus Pricing",
  production: "Cost-Plus Pricing",
  margin: "Cost-Plus Pricing",
  new: "Skimming Pricing",
  innovative: "Skimming Pricing",
  bundle: "Bundle Pricing",
  package: "Bundle Pricing",
  psychological: "Psychological Pricing",
  "9.99": "Psychological Pricing",
  free: "Freemium Pricing",
  freemium: "Freemium Pricing",
  demand: "Dynamic Pricing",
  surge: "Dynamic Pricing",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const product: string = body.product || ""
    const cost: number | undefined = body.cost
    const perceivedValue: number | undefined = body.perceivedValue
    const competitorPrice: number | undefined = body.competitorPrice

    if (!product) {
      return NextResponse.json({ error: "product is required" }, { status: 400 })
    }

    const lower = product.toLowerCase()
    let recommendedStrategy = "Value-Based Pricing"

    for (const [keyword, strategy] of Object.entries(KEYWORD_STRATEGY_MAP)) {
      if (lower.includes(keyword)) {
        recommendedStrategy = strategy
        break
      }
    }

    const comp = competitorPrice || Math.floor(Math.random() * 80) + 20
    const cst = cost || Math.floor(Math.random() * 30) + 5
    const cv = perceivedValue || Math.floor(Math.random() * 60) + 30

    const filtered = STRATEGIES.filter((s) => s.name !== recommendedStrategy)
    const shuffled = filtered.sort(() => Math.random() - 0.5)
    const strategies = [{ name: recommendedStrategy, description: STRATEGIES.find((s) => s.name === recommendedStrategy)!.description }, ...shuffled.slice(0, 3)]

    return NextResponse.json({ recommendedStrategy, cost: cst, customerValue: cv, competition: comp, strategies })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
