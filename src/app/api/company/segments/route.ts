import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const SEGMENTS = [
  { base: "geographic", name: "Urban Professionals", count: 12500, growth: 12, profitability: 85, accessibility: 72, criteriaScore: 78 },
  { base: "demographic", name: "Affluent Millennials", count: 8700, growth: 18, profitability: 91, accessibility: 65, criteriaScore: 84 },
  { base: "psychographic", name: "Health-Conscious Eco", count: 6200, growth: 24, profitability: 78, accessibility: 58, criteriaScore: 70 },
  { base: "behavioral", name: "Frequent Online Shoppers", count: 15300, growth: 9, profitability: 73, accessibility: 88, criteriaScore: 76 },
  { base: "demographic", name: "Gen Z Students", count: 9800, growth: 21, profitability: 55, accessibility: 82, criteriaScore: 65 },
  { base: "geographic", name: "Suburban Families", count: 11000, growth: 5, profitability: 74, accessibility: 68, criteriaScore: 69 },
  { base: "psychographic", name: "Tech Enthusiasts", count: 4100, growth: 31, profitability: 88, accessibility: 60, criteriaScore: 80 },
  { base: "behavioral", name: "Loyal Subscribers", count: 5600, growth: 7, profitability: 94, accessibility: 91, criteriaScore: 90 },
]

export async function GET() {
  return NextResponse.json({
    segments: SEGMENTS,
    total: SEGMENTS.reduce((s, seg) => s + seg.count, 0),
  })
}
