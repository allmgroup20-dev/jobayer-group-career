import { NextRequest, NextResponse } from "next/server";
import { setWebhook, getWebhookInfo, getBotToken } from "@/lib/telegram/sender";
import { execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const token = typeof body.token === "string" ? body.token : undefined;

    if (token) {
      const db = await ensureDB();
      const existing = await db.prepare("SELECT id FROM tg_bots WHERE token = ?").bind(token).first();
      if (!existing) {
        await execute(
          { DB: db },
          "INSERT INTO tg_bots (token, is_active) VALUES (?, 1)",
          [token]
        );
      }
    }

    if (!token && !process.env.TELEGRAM_BOT_TOKEN) {
      const test = await getBotToken().catch(() => null);
      if (!test) {
        return NextResponse.json({
          success: false,
          error: "No bot token configured. Provide token in body or set TELEGRAM_BOT_TOKEN env var.",
        });
      }
    }

    const result = await setWebhook(token);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const info = await getWebhookInfo();
    const hasEnvToken = !!process.env.TELEGRAM_BOT_TOKEN;
    const db = await ensureDB();
    const bots = await db.prepare("SELECT id, username, is_active FROM tg_bots ORDER BY id DESC").all();
    return NextResponse.json({
      hasEnvToken,
      storedBots: bots.results || [],
      webhook: info,
    });
  } catch (error) {
    return NextResponse.json({
      error: (error as Error).message,
    }, { status: 500 });
  }
}
