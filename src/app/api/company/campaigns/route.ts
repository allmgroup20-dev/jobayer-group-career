import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

export async function GET() {
  const campaigns = [
    { name: "Summer Launch", aidaStage: "attention", channel: "Social Media", budget: 15000, reach: 450000, frequency: 4.2, roi: 180 },
    { name: "Product Demo Series", aidaStage: "interest", channel: "Email", budget: 8000, reach: 85000, frequency: 3.0, roi: 240 },
    { name: "Customer Stories", aidaStage: "desire", channel: "Video", budget: 12000, reach: 120000, frequency: 2.5, roi: 310 },
    { name: "Limited Offer", aidaStage: "action", channel: "Search", budget: 10000, reach: 65000, frequency: 5.0, roi: 420 },
    { name: "Brand Awareness", aidaStage: "attention", channel: "Outdoor", budget: 20000, reach: 600000, frequency: 8.0, roi: 150 },
    { name: "Retargeting", aidaStage: "action", channel: "Display", budget: 6000, reach: 45000, frequency: 6.5, roi: 350 },
    { name: "Influencer Collab", aidaStage: "desire", channel: "Social Media", budget: 14000, reach: 250000, frequency: 1.8, roi: 280 },
  ]

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)

  return NextResponse.json({ campaigns, totalBudget })
}
