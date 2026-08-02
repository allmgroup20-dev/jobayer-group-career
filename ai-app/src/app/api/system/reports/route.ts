import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";
import { getReports } from "@/lib/system/ai-analyzer";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const reportType = sp.get("reportType");
    const page = Math.max(1, parseInt(sp.get("page") || "1"));
    const limit = Math.min(100, parseInt(sp.get("limit") || "20"));
    const result = await getReports(reportType || undefined, page, limit);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Reports error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    const db = await ensureDB();
    await db.prepare("DELETE FROM ai_analysis_reports WHERE id = ?").bind(parseInt(id)).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Report delete error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const db = await ensureDB();
    const result = await db.prepare("SELECT COUNT(*) as count FROM ai_analysis_reports").bind().first() as { count: number };
    return NextResponse.json({ total: result?.count || 0 });
  } catch (err) {
    console.error("Reports count error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
