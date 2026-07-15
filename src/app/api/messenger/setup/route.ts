import { NextRequest, NextResponse } from "next/server";
import { sendMessengerMessage, setMessengerWebhook } from "@/lib/messenger/sender";
import { execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const pageToken = typeof body.pageToken === "string" ? body.pageToken : undefined;
    const verifyToken = typeof body.verifyToken === "string" ? body.verifyToken : process.env.MESSENGER_VERIFY_TOKEN;

    if (pageToken) {
      const db = await ensureDB();
      const existing = await db.prepare("SELECT id FROM fb_pages WHERE token = ?").bind(pageToken).first();
      if (!existing) {
        await execute(
          { DB: db },
          "INSERT INTO fb_pages (token, is_active) VALUES (?, 1)",
          [pageToken]
        );
      }
    }

    if (!verifyToken) {
      return NextResponse.json({
        success: false,
        error: "No verify token. Provide verifyToken in body or set MESSENGER_VERIFY_TOKEN env var.",
      });
    }

    const result = await setMessengerWebhook(verifyToken, pageToken);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const hasPageToken = !!process.env.MESSENGER_PAGE_TOKEN;
    const hasVerifyToken = !!process.env.MESSENGER_VERIFY_TOKEN;
    const db = await ensureDB();
    const pages = await db.prepare("SELECT id, is_active FROM fb_pages ORDER BY id DESC").all();
    return NextResponse.json({
      hasPageToken,
      hasVerifyToken,
      storedPages: pages.results || [],
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const text = typeof body.text === "string" ? body.text : "";
    const senderId = typeof body.senderId === "string" ? body.senderId : "";
    if (!text || !senderId) {
      return NextResponse.json({ success: false, error: "text and senderId required" }, { status: 400 });
    }
    const result = await sendMessengerMessage(senderId, text);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
