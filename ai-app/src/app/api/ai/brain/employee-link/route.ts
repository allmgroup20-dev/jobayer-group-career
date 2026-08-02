import { NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";
import { getWorkerKnowledge, getWorkerLinkedAgents } from "@/lib/ai/brain/employee-link";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json({ error: "phone parameter is required" }, { status: 400 });
    }

    const db = await ensureDB();
    const knowledge = await getWorkerKnowledge(db, phone);
    const agents = await getWorkerLinkedAgents(db, phone);

    return NextResponse.json({ knowledge, agents });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load employee knowledge",
    }, { status: 500 });
  }
}
