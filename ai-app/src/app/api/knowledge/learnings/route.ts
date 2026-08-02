import { NextRequest, NextResponse } from "next/server";
import { logConversationLearning, getUnappliedLearnings, markLearningApplied } from "@/lib/ai/knowledge-brain";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unapplied = searchParams.get("unapplied") === "true";
    const limit = parseInt(searchParams.get("limit") || "20");
    const results = unapplied ? await getUnappliedLearnings(limit) : await getUnappliedLearnings(1000);
    return NextResponse.json({ learnings: results });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    if (!body.learningType || !body.insight) {
      return NextResponse.json({ error: "learningType and insight required" }, { status: 400 });
    }
    await logConversationLearning({
      conversationId: body.conversationId,
      agentType: body.agentType,
      learningType: body.learningType,
      context: body.context,
      insight: body.insight,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body: any = await req.json();
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await markLearningApplied(body.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
