import { NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const db = await ensureDB();

    if (phone) {
      const convs = await query<{
        id: number; phone: string; messages: string;
        summary: string; key_points: string; language: string; source: string;
        created_at: string; updated_at: string;
      }>(
        { DB: db },
        "SELECT id, phone, messages, summary, key_points, language, source, created_at, updated_at FROM ai_conversations WHERE phone = ? ORDER BY updated_at DESC LIMIT 50",
        [phone]
      );

      const parsed = convs.map((c) => {
        let msgs: { role: string; content: string }[] = [];
        try { msgs = JSON.parse(c.messages || "[]"); } catch {}
        let kp: Record<string, any> = {};
        try { kp = JSON.parse(c.key_points || "{}"); } catch {}
        return { ...c, messages: msgs, keyPoints: kp };
      });

      return NextResponse.json({ conversations: parsed });
    }

    const convs = await query<{
      phone: string; summary: string; key_points: string; language: string; source: string;
      message_count: number; updated_at: string;
    }>(
      { DB: db },
      `SELECT phone,
              COALESCE(NULLIF(summary, ''), 'কোন সামারি নেই') as summary,
              key_points, language, source,
              CAST(JSON_LENGTH(messages) AS INTEGER) as message_count,
              updated_at
       FROM ai_conversations
       ORDER BY updated_at DESC
       LIMIT 100`
    );

    if (convs.length === 0) {
      const fallback = await query<{
        phone: string; message_count: number; summary: string; key_points: string;
        language: string; source: string; updated_at: string;
      }>(
        { DB: db },
        `SELECT phone,
                json_array_length(COALESCE(messages, '[]')) as message_count,
                COALESCE(NULLIF(summary, ''), 'কোন সামারি নেই') as summary,
                key_points, language, source, updated_at
         FROM ai_conversations
         ORDER BY updated_at DESC
         LIMIT 100`
      );
      return NextResponse.json({ conversations: fallback });
    }

    return NextResponse.json({ conversations: convs });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load conversations",
    }, { status: 500 });
  }
}
