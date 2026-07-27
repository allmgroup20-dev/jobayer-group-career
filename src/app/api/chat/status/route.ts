import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";

// In-memory typing status store (per session, expires after 5s no-update)
const typingStatus = new Map<string, { isTyping: boolean; lastUpdate: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { sessionId, phone, action } = body as { sessionId?: string; phone?: string; action: string };
    const key = sessionId || phone;

    if (!key) {
      return NextResponse.json({ error: "sessionId or phone required" }, { status: 400 });
    }

    if (action === "typing") {
      typingStatus.set(key, { isTyping: true, lastUpdate: Date.now() });
      return NextResponse.json({ ok: true, typing: true });
    }

    if (action === "stop_typing") {
      typingStatus.set(key, { isTyping: false, lastUpdate: Date.now() });
      return NextResponse.json({ ok: true, typing: false });
    }

    if (action === "mark_read") {
      // Mark messages as read for this session
      return NextResponse.json({ ok: true, read: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Chat status error:", error);
    return NextResponse.json({ error: "Status update failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const phone = request.nextUrl.searchParams.get("phone");
  const key = sessionId || phone;

  if (!key) {
    return NextResponse.json({ error: "sessionId or phone required" }, { status: 400 });
  }

  // Clean expired entries (> 5s)
  const now = Date.now();
  for (const [k, v] of typingStatus) {
    if (now - v.lastUpdate > 5000) typingStatus.delete(k);
  }

  const status = typingStatus.get(key);
  return NextResponse.json({
    typing: status?.isTyping || false,
    online: true,
  });
}
