import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { saveMessage } from "@/lib/ai";
import { recordPlatformActivity } from "@/lib/platform-router";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { phone, text, agentName } = body as { phone: string; text: string; agentName?: string };

    if (!phone || !text) {
      return NextResponse.json({ error: "phone and text required" }, { status: 400 });
    }

    const env = await getDB();

    // Save as assistant message
    await saveMessage(phone, "assistant", text, { source: "web_agent" });
    await recordPlatformActivity(phone, "web_agent");

    // Update lead status
    try {
      await (await import("@/lib/ai")).updateLeadStatus(phone, "agent_replied");
    } catch {}

    return NextResponse.json({ ok: true, phone, text });
  } catch (error) {
    console.error("Chat send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
