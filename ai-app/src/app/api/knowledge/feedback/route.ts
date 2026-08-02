import { NextRequest, NextResponse } from "next/server";
import { submitFeedback, getKnowledgeStats } from "@/lib/ai/knowledge-brain";
import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentType = searchParams.get("agentType");
    const limit = parseInt(searchParams.get("limit") || "50");
    const db = await ensureDB();
    let rows;
    if (agentType) {
      rows = await query(
        { DB: db },
        "SELECT id, agent_type, rating, feedback_text, issue_type, created_at FROM agent_feedback WHERE agent_type = ? ORDER BY created_at DESC LIMIT ?",
        [agentType, limit]
      );
    } else {
      rows = await query(
        { DB: db },
        "SELECT id, agent_type, rating, feedback_text, issue_type, created_at FROM agent_feedback ORDER BY created_at DESC LIMIT ?",
        [limit]
      );
    }
    return NextResponse.json({ feedback: rows });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    if (!body.agentType) {
      return NextResponse.json({ error: "agentType required" }, { status: 400 });
    }
    await submitFeedback({
      agentType: body.agentType,
      rating: body.rating,
      feedbackText: body.feedbackText,
      issueType: body.issueType,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
