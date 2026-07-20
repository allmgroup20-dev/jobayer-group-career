import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

export async function GET() {
  const cbbe = {
    salience: 78,
    performance: 82,
    imagery: 74,
    judgments: 80,
    feelings: 71,
    resonance: 65,
  }

  const elements = [
    { name: "Logo", effectiveness: 85 },
    { name: "Tagline", effectiveness: 72 },
    { name: "Color Palette", effectiveness: 88 },
    { name: "Brand Voice", effectiveness: 69 },
    { name: "Packaging", effectiveness: 76 },
    { name: "Digital Presence", effectiveness: 81 },
  ]

  const resonanceScore = Math.round((cbbe.salience + cbbe.performance + cbbe.imagery + cbbe.judgments + cbbe.feelings + cbbe.resonance) / 6)

  return NextResponse.json({ brandName: "BrandForge", cbbe, elements, resonanceScore })
}
