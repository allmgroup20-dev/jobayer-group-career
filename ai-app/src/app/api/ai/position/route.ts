import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, queryFirst } from "@/lib/db/queries"

const POD_KEYWORDS: Record<string, string[]> = {
  quality: ["quality", "premium", "durable", "reliable", "well-made"],
  innovation: ["innovation", "cutting-edge", "advanced", "modern", "tech"],
  service: ["service", "support", "care", "assistance", "dedicated"],
  value: ["value", "affordable", "cost-effective", "budget", "economical"],
  convenience: ["convenient", "easy", "simple", "fast", "quick"],
  customization: ["custom", "personalized", "tailored", "bespoke", "unique"],
}

const POP_KEYWORDS: Record<string, string[]> = {
  expensive: ["expensive", "costly", "overpriced", "pricey", "luxury pricing"],
  complex: ["complex", "complicated", "difficult", "hard", "confusing"],
  slow: ["slow", "lagging", "outdated", "obsolete", "old"],
  generic: ["generic", "boring", "plain", "ordinary", "standard"],
  unreliable: ["unreliable", "inconsistent", "flaky", "buggy", "unstable"],
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, any>
    const text: string = body.text || ""
    const product: string = body.product || ""

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const lower = text.toLowerCase()

    const pod: string[] = []
    for (const [name, keywords] of Object.entries(POD_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) pod.push(name)
    }

    const pop: string[] = []
    for (const [name, keywords] of Object.entries(POP_KEYWORDS)) {
      if (keywords.some((kw) => lower.includes(kw))) pop.push(name)
    }

    if (pod.length === 0) pod.push("quality")
    if (pop.length === 0) pop.push("expensive")

    const productName = product || "this product"
    const podStr = pod.join(", ")
    const popStr = pop.join(", ")
    const positioning = `${productName} positioned as ${podStr} vs competitors' ${popStr}`

    const perceptualMap = { price: Math.floor(Math.random() * 7) + 2, quality: Math.floor(Math.random() * 7) + 3 }

    return NextResponse.json({ pod, pop, positioning, perceptualMap })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
