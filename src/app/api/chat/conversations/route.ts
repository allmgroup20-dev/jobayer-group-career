import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  try {
    const agent = request.nextUrl.searchParams.get("agent");
    const env = await getDB();

    const rows = await query<any>(env,
      `SELECT phone,
              COUNT(*) as msg_count,
              MAX(created_at) as last_time,
              (SELECT content FROM ai_conversations WHERE phone = a.phone ORDER BY created_at DESC LIMIT 1) as last_message
       FROM ai_conversations a
       WHERE source != 'whatsapp' OR source IS NULL
       GROUP BY phone
       ORDER BY last_time DESC
       LIMIT 50`
    );

    const conversations = rows.map((r: any) => ({
      phone: r.phone,
      name: r.phone.replace(/^web_anon_/, "").slice(0, 8) || r.phone,
      last_message: r.last_message?.slice(0, 100) || "",
      last_time: r.last_time,
      unread: 0,
      source: "web",
    }));

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Conversations error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
