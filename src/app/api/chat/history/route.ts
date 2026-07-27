import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get("phone");
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50"), 200);
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
    const env = await getDB();

    let effectivePhone = phone;

    // Resolve session → phone
    if (!effectivePhone && sessionId) {
      const sess = await query<any>(env,
        "SELECT phone FROM web_chat_sessions WHERE session_id = ?", [sessionId]
      );
      if (sess.length > 0 && sess[0].phone) {
        effectivePhone = sess[0].phone;
      } else {
        effectivePhone = `web_anon_${sessionId.slice(0, 20)}`;
      }
    }

    if (!effectivePhone) {
      return NextResponse.json({ error: "phone or sessionId required" }, { status: 400 });
    }

    const messages = await query<any>(env,
      `SELECT id, role, content, metadata, created_at
       FROM ai_conversations
       WHERE phone = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [effectivePhone, limit, offset]
    );

    const total = await query<any>(env,
      "SELECT COUNT(*) as count FROM ai_conversations WHERE phone = ?",
      [effectivePhone]
    );

    return NextResponse.json({
      phone: effectivePhone,
      messages: messages.reverse(),
      total: total[0]?.count || 0,
      limit, offset,
    });
  } catch (error) {
    console.error("Chat history error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
