import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";

const TECHNIQUES = [
  "golden_rule", "give_first", "active_listening", "speak_their_language",
  "value_first", "we_together", "subtlety_power", "daily_trust",
] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      phone: string;
      technique: string;
      context?: string;
    };
    const db = await getDB();

    if (!body.phone || !body.technique) {
      return NextResponse.json({ error: "phone and technique required" }, { status: 400 });
    }
    if (!TECHNIQUES.includes(body.technique as any)) {
      return NextResponse.json({ error: `Invalid technique. Must be one of: ${TECHNIQUES.join(", ")}` }, { status: 400 });
    }

    await execute(
      db,
      `INSERT INTO persuasion_tracking (phone, technique_used, context, effectiveness_score, created_at)
       VALUES (?, ?, ?, 0.5, datetime('now'))`,
      [body.phone, body.technique, body.context || ""]
    );

    return NextResponse.json({ success: true, message: `Applied '${body.technique}' for ${body.phone}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}
