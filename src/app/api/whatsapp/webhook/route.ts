import { NextRequest, NextResponse } from "next/server";
import { updateContactStatus } from "@/lib/whatsapp/contacts";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      phone?: string;
      from?: string;
      text?: string;
      message?: string;
      campaignId?: string;
    };

    const phone = body.phone || body.from;
    const text = body.text || body.message;

    if (!phone || !text) {
      return NextResponse.json({ error: "phone and text required" }, { status: 400 });
    }

    await updateContactStatus(phone, "replied", text);

    const env = await getDB();
    await execute(env,
      "INSERT INTO wa_logs (phone, message, direction, status, message_type, campaign_id, created_at) VALUES (?, ?, 'inbound', 'received', 'text', ?, datetime('now'))",
      [phone, text, body.campaignId || null]
    );

    return NextResponse.json({ received: true, phone, text });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Webhook failed"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}
