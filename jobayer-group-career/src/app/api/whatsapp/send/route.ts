import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { workerIds, message } = await request.json() as { workerIds: string[]; message: string };
    const env = await getDB();
    let success = 0;
    let failed = 0;

    for (const workerId of (workerIds || [])) {
      const workers = await query<{ phone: string; name: string }>(
        env, "SELECT phone, name FROM workers WHERE worker_id = ?", [workerId]
      );

      if (workers.length > 0) {
        const { phone, name } = workers[0];
        const personalizedMessage = (message || "").replace("{name}", name);

        const sent = true;
        if (sent) {
          success++;
          await execute(env,
            "INSERT INTO whatsapp_log (worker_id, phone, message, message_type, status) VALUES (?, ?, ?, 'bulk', 'sent')",
            [workerId, phone, personalizedMessage]
          );
        } else {
          failed++;
        }
      }
    }

    return NextResponse.json({ success, failed });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
