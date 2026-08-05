import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/auth";
import { setCached, getCached } from "@/lib/cache";
import { sendMessage } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json() as { phone?: string };
    if (!phone) {
      return NextResponse.json({ error: "Phone required" }, { status: 400 });
    }
    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    const key = `otp:${cleanPhone}`;
    // Rate-limit: max 1 OTP per 45s
    const existing = await getCached<{ sentAt: number }>(key, 45);
    if (existing) {
      return NextResponse.json({ error: "অনুগ্রহ করে ৪৫ সেকেন্ড পরে আবার চেষ্টা করুন" }, { status: 429 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // H1/H4: code is stored with a 5-minute TTL (enforced via getCached ttl in verify)
    // and a zeroed attempt counter so verify can lock after too many wrong guesses.
    await setCached(key, { code, sentAt: Date.now(), attempts: 0 });

    // C8: use an approved template when configured (Meta rejects free-form text
    // for business-initiated messages); falls back to free-form text only in dev.
    const templateName = process.env.WHATSAPP_OTP_TEMPLATE;
    const result = templateName
      ? await sendMessage(cleanPhone, "", {
          templateName,
          languageCode: process.env.WHATSAPP_TEMPLATE_LANG || "en",
          components: [{ type: "body", parameters: [{ type: "text", text: code }] }],
        })
      : await sendMessage(cleanPhone, `আপনার Jobayer Group Career ভেরিফিকেশন কোড: ${code}\nকোডটি ৫ মিনিটের জন্য বৈধ।`);

    const configured = result.success || Boolean(process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_META_TOKEN);
    return NextResponse.json({
      ok: true,
      configured,
      // Return dev code only when WhatsApp API is not configured (local/test)
      devCode: configured ? undefined : code,
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}