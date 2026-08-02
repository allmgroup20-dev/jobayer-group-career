import { NextRequest, NextResponse } from "next/server";
import { logKnowledgeDistribution, getKnowledgeDistribution, getKnowledgeDistributionSummary } from "@/lib/ai/knowledge-distribution";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "list";

    if (view === "summary") {
      const summary = await getKnowledgeDistributionSummary();
      return NextResponse.json({ success: true, summary });
    }

    const entries = await getKnowledgeDistribution({
      targetType: searchParams.get("target_type") || undefined,
      targetId: searchParams.get("target_id") || undefined,
      sourceType: searchParams.get("source_type") || undefined,
      sourceId: searchParams.get("source_id") || undefined,
      category: searchParams.get("category") || undefined,
      limit: Number(searchParams.get("limit")) || 50,
      offset: Number(searchParams.get("offset")) || 0,
    });

    return NextResponse.json({ success: true, entries });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      sourceType: string;
      sourceId: string;
      sourceName?: string;
      targetType: string;
      targetId: string;
      targetName?: string;
      knowledgeTitle: string;
      knowledgeContent: string;
      knowledgeCategory?: string;
      origin?: string;
      confidence?: number;
    };

    if (!body.sourceType || !body.sourceId || !body.targetType || !body.targetId || !body.knowledgeTitle || !body.knowledgeContent) {
      return NextResponse.json({ error: "Missing required fields: sourceType, sourceId, targetType, targetId, knowledgeTitle, knowledgeContent" }, { status: 400 });
    }

    await logKnowledgeDistribution(body);

    return NextResponse.json({ success: true, message: "Knowledge distribution logged" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to log" }, { status: 500 });
  }
}
