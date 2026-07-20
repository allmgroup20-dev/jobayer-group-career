import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

export async function GET() {
  const entryOptions = [
    { mode: "Exporting", description: "Direct sales via distributors in target regions", risk: "Low", investment: "Low" },
    { mode: "Licensing", description: "License technology to regional partners", risk: "Low-Medium", investment: "Low" },
    { mode: "Joint Venture", description: "Form JV with established local firms", risk: "Medium", investment: "Medium-High" },
    { mode: "Wholly Owned Subsidiary", description: "Establish fully owned offices abroad", risk: "High", investment: "High" },
    { mode: "Strategic Alliance", description: "Non-equity partnerships for market access", risk: "Medium", investment: "Medium" },
  ]

  const culturalTips = [
    "Build relationships before discussing business in Latin America",
    "In Japan, formal bowing and business cards exchanges are essential",
    "German clients value punctuality and detailed documentation",
    "In India, hierarchical decision-making is common",
    "Middle Eastern business relies heavily on personal trust",
  ]

  return NextResponse.json({ entryOptions, culturalTips, recommended: "Exporting via local distributors" })
}
