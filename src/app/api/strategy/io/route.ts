import { NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { query, execute } from "@/lib/db/queries"

export async function GET() {
  try {
    const env = await getDB()
    const [canvas, errc, scenarios] = await Promise.all([
      query<any>(env, "SELECT * FROM strategy_canvas ORDER BY sort_order ASC"),
      query<any>(env, "SELECT * FROM errc_saved ORDER BY quadrant ASC"),
      query<any>(env, "SELECT * FROM strategy_scenarios ORDER BY id ASC"),
    ])
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      data: {
        canvas: canvas.map((r: any) => ({
          factorName: r.factor_name, factorNameBn: r.factor_name_bn, ourScore: r.our_score,
          competitorScore: r.competitor_score, competitorName: r.competitor_name,
          category: r.category, sortOrder: r.sort_order, isActive: r.is_active,
        })),
        errc: errc.map((r: any) => ({ quadrant: r.quadrant, content: r.content, category: r.category })),
        scenarios: scenarios.map((r: any) => ({ name: r.name, description: r.description, canvasScores: r.canvas_scores })),
      },
    }
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="strategy-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      data?: { canvas?: any[]; errc?: any[]; scenarios?: any[] }
    }
    const { data } = body
    if (!data) return NextResponse.json({ error: "No data provided" }, { status: 400 })
    const env = await getDB()
    let imported = { canvas: 0, errc: 0, scenarios: 0 }

    if (data.canvas) {
      await execute(env, "DELETE FROM strategy_canvas")
      for (const c of data.canvas) {
        await execute(env,
          "INSERT INTO strategy_canvas (factor_name, factor_name_bn, our_score, competitor_score, competitor_name, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [c.factorName, c.factorNameBn ?? null, c.ourScore ?? 5, c.competitorScore ?? 5, c.competitorName ?? "Competitor", c.category ?? "core", c.sortOrder ?? 0, c.isActive ?? 1]
        ).catch(() => {})
        imported.canvas++
      }
    }

    if (data.errc) {
      await execute(env, "DELETE FROM errc_saved")
      for (const e of data.errc) {
        await execute(env, "INSERT INTO errc_saved (quadrant, content, category) VALUES (?, ?, ?)",
          [e.quadrant, e.content ?? "", e.category ?? "platform"]
        ).catch(() => {})
        imported.errc++
      }
    }

    if (data.scenarios) {
      await execute(env, "DELETE FROM strategy_scenarios")
      for (const s of data.scenarios) {
        await execute(env, "INSERT INTO strategy_scenarios (name, description, canvas_scores) VALUES (?, ?, ?)",
          [s.name, s.description ?? "", s.canvasScores ?? "[]"]
        ).catch(() => {})
        imported.scenarios++
      }
    }

    return NextResponse.json({ success: true, imported })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
