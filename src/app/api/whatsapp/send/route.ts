import { NextRequest, NextResponse } from "next/server";
import { sendMessage, enqueueMessage } from "@/lib/whatsapp";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { to, text, workerIds, message, immediate } = await request.json() as {
      to?: string; text?: string; workerIds?: string[]; message?: string; immediate?: boolean;
    };

    const env = await getDB();

    if (to && text) {
      if (immediate) {
        const result = await sendMessage(to, text);
        return NextResponse.json(result);
      }
      await enqueueMessage(to, text, 1);
      return NextResponse.json({ queued: true, to, text });
    }

    if (workerIds?.length && message) {
      let success = 0;
      let failed = 0;
      for (const workerId of workerIds) {
        const workers = await query<{ phone: string; name: string }>(
          env, "SELECT phone, name FROM workers WHERE worker_id = ?", [workerId]
        );
        if (workers.length > 0) {
          const { phone, name } = workers[0];
          const personalized = message.replace(/\{name\}/g, name);
          if (immediate) {
            const result = await sendMessage(phone, personalized);
            if (result.success) success++; else failed++;
          } else {
            await enqueueMessage(phone, personalized, 0, { messageType: "bulk" });
            success++;
          }
        }
      }
      return NextResponse.json({ success, failed });
    }

    return NextResponse.json({ error: "Provide to+text or workerIds+message" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Send failed"
    }, { status: 500 });
  }
}
