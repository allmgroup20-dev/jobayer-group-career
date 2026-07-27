import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const { phone } = body as { phone?: string };
    const env = await getDB();

    const sessionId = "web_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    if (phone) {
      const existing = await query<any>(env,
        "SELECT session_id FROM web_chat_sessions WHERE phone = ? LIMIT 1", [phone]
      );
      if (existing.length > 0) {
        await execute(env,
          "UPDATE web_chat_sessions SET updated_at = datetime('now') WHERE phone = ?", [phone]
        );
        return NextResponse.json({ sessionId: existing[0].session_id, phone });
      }
      await execute(env,
        "INSERT INTO web_chat_sessions (session_id, phone, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
        [sessionId, phone]
      );
    } else {
      await execute(env,
        "INSERT INTO web_chat_sessions (session_id, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))",
        [sessionId]
      );
    }

    return NextResponse.json({ sessionId, phone: phone || null });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const phone = request.nextUrl.searchParams.get("phone");
    const env = await getDB();

    if (sessionId) {
      const sess = await query<any>(env,
        "SELECT * FROM web_chat_sessions WHERE session_id = ?", [sessionId]
      );
      if (sess.length > 0) {
        return NextResponse.json({ session: sess[0] });
      }
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (phone) {
      const sess = await query<any>(env,
        "SELECT * FROM web_chat_sessions WHERE phone = ? LIMIT 1", [phone]
      );
      if (sess.length > 0) {
        return NextResponse.json({ session: sess[0] });
      }
    }

    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ error: "Session lookup failed" }, { status: 500 });
  }
}
