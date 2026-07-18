import { NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const db = await ensureDB();

    // Get full conversation for a specific phone
    if (phone) {
      const convs = await query<{
        id: number; phone: string; role: string; messages: string;
        summary: string; language: string; source: string;
        created_at: string; updated_at: string;
      }>(
        { DB: db },
        "SELECT id, phone, role, messages, summary, language, source, created_at, updated_at FROM ai_conversations WHERE phone = ? ORDER BY updated_at DESC LIMIT 50",
        [phone]
      );

      const parsed = convs.map((c) => {
        let msgs: { role: string; content: string }[] = [];
        try { msgs = JSON.parse(c.messages || "[]"); } catch {}
        return { ...c, messages: msgs };
      });

      return NextResponse.json({ conversations: parsed });
    }

    // List all conversations (summary view)
    const convs = await query<{
      phone: string; summary: string; language: string; source: string;
      message_count: number; updated_at: string;
    }>(
      { DB: db },
      `SELECT phone,
              COALESCE(NULLIF(summary, ''), 'কোন সামারি নেই') as summary,
              language, source,
              message_count,
              updated_at
       FROM (
         SELECT phone, summary, language, source,
                CAST(JSON_LENGTH(messages) AS INTEGER) as message_count,
                updated_at,
                ROW_NUMBER() OVER (PARTITION BY phone ORDER BY updated_at DESC) as rn
         FROM ai_conversations
       ) WHERE rn = 1
       ORDER BY updated_at DESC
       LIMIT 100`
    );

    // Fallback for SQLite without JSON_LENGTH
    if (convs.length === 0) {
      const fallback = await query<{
        phone: string; message_count: number; summary: string;
        language: string; source: string; updated_at: string;
      }>(
        { DB: db },
        `SELECT phone,
                json_array_length(COALESCE(messages, '[]')) as message_count,
                COALESCE(NULLIF(summary, ''), 'কোন সামারি নেই') as summary,
                language, source, updated_at
         FROM ai_conversations
         ORDER BY updated_at DESC
         LIMIT 100`
      );
      const grouped = new Map<string, any>();
      for (const c of fallback) {
        if (!grouped.has(c.phone)) {
          grouped.set(c.phone, {
            phone: c.phone, summary: c.summary, language: c.language,
            source: c.source, message_count: c.message_count, updated_at: c.updated_at,
          });
        }
      }
      return NextResponse.json({ conversations: Array.from(grouped.values()) });
    }

    return NextResponse.json({ conversations: convs });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load conversations",
    }, { status: 500 });
  }
}
