import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

export async function GET() {
  const valueProp = {
    jobs: ["Track marketing performance", "Analyze customer segments", "Generate campaign reports", "Manage brand assets"],
    pains: ["Manual reporting is time-consuming", "Data scattered across tools", "Difficulty proving ROI", "No unified customer view"],
    gains: ["Save 10+ hours per week", "Data-driven decisions", "Clear ROI attribution", "360° customer profiles"],
    products: ["Analytics Dashboard", "Segment Builder", "Campaign Manager", "Brand Tracker"],
    relievers: ["Automated reporting", "Unified data pipeline", "ROI calculator", "Real-time dashboards"],
    creators: ["Actionable insights", "Team collaboration", "Predictive analytics", "Custom integrations"],
  }

  const perceptualMap = [
    { name: "Us", x: 7, y: 8, isUs: true },
    { name: "Competitor A", x: 5, y: 6, isUs: false },
    { name: "Competitor B", x: 8, y: 4, isUs: false },
    { name: "Competitor C", x: 3, y: 7, isUs: false },
    { name: "Competitor D", x: 6, y: 3, isUs: false },
  ]

  const podPop = {
    pod: ["quality", "innovation", "service"],
    pop: ["expensive", "complex"],
  }

  return NextResponse.json({ valueProp, perceptualMap, podPop })
}
