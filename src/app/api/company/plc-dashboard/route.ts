import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

export async function GET() {
  const products = [
    { name: "Product Alpha", stage: "Introduction", sales: 850, growth: 35, strategy: "Build awareness" },
    { name: "Product Beta", stage: "Growth", sales: 5400, growth: 22, strategy: "Scale distribution" },
    { name: "Product Gamma", stage: "Maturity", sales: 28000, growth: 5, strategy: "Defend share" },
    { name: "Product Delta", stage: "Growth", sales: 7200, growth: 18, strategy: "Expand features" },
    { name: "Product Epsilon", stage: "Decline", sales: 12000, growth: -8, strategy: "Harvest" },
  ]

  const ansoff = {
    penetration: "Increase share of existing product Alpha with promotional pricing",
    development: "Enter European market with product Beta",
    productDev: "Develop Product Z for current customers",
    diversification: "Launch new AI analytics platform for healthcare vertical",
  }

  return NextResponse.json({ products, ansoff })
}
