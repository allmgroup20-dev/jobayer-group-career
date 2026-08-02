import { NextRequest, NextResponse } from "next/server";
import { searchKnowledge } from "@/lib/ai/knowledge-brain";

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    if (!body.query) {
      return NextResponse.json({ error: "query required" }, { status: 400 });
    }
    const results = await searchKnowledge(body.query, {
      category: body.category || undefined,
      limit: body.limit || 20,
      minConfidence: body.minConfidence ?? 0.3,
    });
    return NextResponse.json({ entries: results });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
