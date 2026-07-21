import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query } from "@/lib/db/queries"

export async function GET() {
  try {
    const env = await getDB()
    const [canvas, canvasCount, errcCount] = await Promise.all([
      query<any>(env, "SELECT * FROM strategy_canvas WHERE is_active = 1 ORDER BY sort_order ASC"),
      env.DB.prepare("SELECT COUNT(*) as cnt FROM strategy_canvas WHERE is_active = 1").first(),
      env.DB.prepare("SELECT COUNT(*) as cnt FROM errc_saved").first().catch(() => ({ cnt: 0 })),
    ])
    const avgOurScore = canvas.length > 0
      ? Math.round(canvas.reduce((s: number, r: any) => s + r.our_score, 0) / canvas.length * 10) / 10
      : 0
    const avgCompScore = canvas.length > 0
      ? Math.round(canvas.reduce((s: number, r: any) => s + (r.competitor_score ?? 0), 0) / canvas.length * 10) / 10
      : 0
    const pioneers = canvas.filter((r: any) => r.our_score >= 8 && (r.competitor_score ?? 0) < 6).length
    const gaps = canvas.filter((r: any) => (r.our_score - (r.competitor_score ?? 0)) > 3).length
    const needsWork = canvas.filter((r: any) => r.our_score < 6).length

    const knowledgeCount = await env.DB.prepare("SELECT COUNT(*) as cnt FROM ai_knowledge_distribution WHERE origin = 'blue_ocean'").first()
    const agentCount = await env.DB.prepare("SELECT COUNT(*) as cnt FROM ai_knowledge_distribution WHERE target_type = 'agent' AND origin = 'blue_ocean'").first()

    return NextResponse.json({
      canvas: { total: (canvasCount as any)?.cnt ?? 0, avgOurScore, avgCompScore, pioneers, gaps, needsWork },
      knowledge: { total: (knowledgeCount as any)?.cnt ?? 0, agents: (agentCount as any)?.cnt ?? 0 },
      errc: { saved: (errcCount as any)?.cnt ?? 0 },
      frameworks: [
        { name: "Strategy Canvas", path: "/company/strategy-canvas", icon: "🎯", status: canvas.length > 0 ? "active" : "empty", count: canvas.length },
        { name: "ERRC Grid", path: "/company/errc-grid", icon: "✂️", status: (errcCount as any)?.cnt > 0 ? "active" : "empty", count: (errcCount as any)?.cnt ?? 0 },
        { name: "Six Paths", path: "/company/six-paths", icon: "🛤️", status: "active", count: 6 },
        { name: "Three Tiers", path: "/company/three-tiers", icon: "👤", status: "active", count: 3 },
        { name: "Price Corridor", path: "/company/price-corridor", icon: "💎", status: "active", count: 4 },
        { name: "Business Model", path: "/company/business-model", icon: "🏗️", status: "active", count: 4 },
        { name: "PMS Map", path: "/company/pms-map", icon: "🗺️", status: "active", count: 3 },
        { name: "Strategic Sequencing", path: "/company/strategic-sequencing", icon: "🔢", status: "active", count: 4 },
        { name: "Value Innovation", path: "/company/value-innovation", icon: "💡", status: "active", count: 4 },
        { name: "Buyer Utility", path: "/company/buyer-utility-map", icon: "🛒", status: "active", count: 6 },
        { name: "Tipping Point", path: "/company/tipping-point", icon: "⚡", status: "active", count: 4 },
        { name: "Fair Process", path: "/company/fair-process", icon: "⚖️", status: "active", count: 3 },
        { name: "Red Ocean Traps", path: "/company/red-ocean-traps", icon: "⚠️", status: "active", count: 6 },
      ],
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
