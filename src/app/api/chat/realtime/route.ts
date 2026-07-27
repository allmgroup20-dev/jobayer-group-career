import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const phone = request.nextUrl.searchParams.get("phone");
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  const since = request.nextUrl.searchParams.get("since") || "0";

  if (!phone && !sessionId) {
    return NextResponse.json({ error: "phone or sessionId required" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let lastId = parseInt(since) || 0;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        if (!closed) controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      const poll = async () => {
        if (closed) return;
        try {
          const env = await getDB();
          const messages = await query<any>(env,
            `SELECT id, role, content, created_at
             FROM ai_conversations
             WHERE phone = ? AND id > ?
             ORDER BY id ASC
             LIMIT 20`,
            [phone, lastId]
          );
          for (const msg of messages) {
            send(JSON.stringify(msg));
            lastId = msg.id;
          }
          // Track read for mobile user
          send(JSON.stringify({ type: "heartbeat", ts: Date.now() }));
        } catch {}
        if (!closed) setTimeout(poll, 2000);
      };

      // Initial send
      send(JSON.stringify({ type: "connected", ts: Date.now() }));

      // Start polling after first flush
      setTimeout(poll, 0);

      // Keep-alive every 30s
      const keepAlive = setInterval(() => {
        if (!closed) send(JSON.stringify({ type: "keepalive", ts: Date.now() }));
      }, 30000);

      request.signal.addEventListener("abort", () => {
        closed = true;
        clearInterval(keepAlive);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
