import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

export async function GET() {
  const ladder = [
    { stage: "Awareness", count: 4500 },
    { stage: "Exploration", count: 3200 },
    { stage: "Familiarity", count: 2100 },
    { stage: "Commitment", count: 1200 },
    { stage: "Partnership", count: 500 },
  ]

  const nps = {
    promoters: 42,
    passives: 35,
    detractors: 23,
    score: 19,
  }

  const clv = {
    avgPurchase: 85,
    frequency: 4.5,
    lifetime: 24,
    total: 9180,
  }

  const churn = [
    { reason: "Price too high", count: 340 },
    { reason: "Poor customer service", count: 215 },
    { reason: "Found better alternative", count: 180 },
    { reason: "No longer need product", count: 95 },
    { reason: "Technical issues", count: 70 },
  ]

  return NextResponse.json({ ladder, nps, clv, retentionRate: 76, churn })
}
