import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

export async function GET() {
  const tripleBottom = {
    people: 78,
    peopleDesc: "Fair wages, diversity hiring, community engagement programs",
    planet: 72,
    planetDesc: "Carbon-neutral operations, recycled packaging, renewable energy",
    profit: 85,
    profitDesc: "Sustainable growth, ethical investing, transparent reporting",
  }

  const initiatives = [
    { name: "Code for Good", impact: "Trained 500 underprivileged youth in coding", beneficiaries: "Students aged 16-24", status: "Active" },
    { name: "Green Office", impact: "Reduced carbon footprint by 40% across offices", beneficiaries: "Environment", status: "Active" },
    { name: "Diversity Hiring", impact: "40% diverse hires in leadership roles", beneficiaries: "Underrepresented groups", status: "Active" },
    { name: "Community Grants", impact: "$250K granted to local non-profits", beneficiaries: "Local communities", status: "Active" },
    { name: "Ethical Supply Chain", impact: "100% supplier compliance with labor standards", beneficiaries: "Factory workers", status: "Completed" },
  ]

  return NextResponse.json({ tripleBottom, initiatives })
}
