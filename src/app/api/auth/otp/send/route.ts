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
    await setCached(key, { code, sentAt: Date.now() });

    const message = `আপনার Jobayer Group Career ভেরিফিকেশন কোড: ${code}\nকোডটি ৫ মিনিটের জন্য বৈধ।`;
    const result = await sendMessage(cleanPhone, message);

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