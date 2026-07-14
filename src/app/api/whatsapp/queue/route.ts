import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { processQueue, getQueueStats } from "@/lib/whatsapp";

export async function GET() {
  try {
    const stats = await getQueueStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load queue stats"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json() as { action?: string };
    const env = await getDB();

    if (action === "flush") {
      const sent = await processQueue(5);
      return NextResponse.json({ sent, remaining: (await getQueueStats()).queued });
    }

    if (action === "clear_failed") {
      await execute(env,
        "DELETE FROM wa_message_queue WHERE status = 'failed'"
      );
      return NextResponse.json({ cleared: true });
    }

    if (action === "retry_failed") {
      await execute(env,
        "UPDATE wa_message_queue SET status = 'queued', attempts = 0, error = NULL WHERE status = 'failed' AND attempts < 3"
      );
      return NextResponse.json({ retried: true });
    }

    return NextResponse.json({ error: "Unknown action. Use: flush, clear_failed, retry_failed" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Queue action failed"
    }, { status: 500 });
  }
}
