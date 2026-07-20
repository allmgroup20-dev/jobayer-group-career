import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

export async function GET() {
  const strategies = [
    { name: "Value-Based Pricing", description: "Price set based on perceived customer value", active: true },
    { name: "Competitive Pricing", description: "Price matched to key competitors", active: false },
    { name: "Penetration Pricing", description: "Low introductory price for market share", active: false },
    { name: "Premium Pricing", description: "High price reflecting brand exclusivity", active: false },
    { name: "Bundle Pricing", description: "Discounted package deals", active: false },
  ]

  const competitors = [
    { name: "Competitor A", price: 49 },
    { name: "Competitor B", price: 59 },
    { name: "Competitor C", price: 39 },
    { name: "Competitor D", price: 69 },
  ]

  return NextResponse.json({
    cost: 22,
    customerValue: 65,
    competition: 49,
    strategies,
    competitors,
  })
}
