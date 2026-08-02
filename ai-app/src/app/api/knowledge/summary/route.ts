import { NextResponse } from "next/server";
import { getKnowledgeStats } from "@/lib/ai/knowledge-brain";

export async function GET() {
  try {
    const stats = await getKnowledgeStats();
    return NextResponse.json(stats);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
