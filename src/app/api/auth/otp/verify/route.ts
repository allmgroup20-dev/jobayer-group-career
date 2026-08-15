import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/auth";
import { getCached, invalidateCache, setCached } from "@/lib/cache";
import { isWhatsappVerifyEnabled } from "@/lib/features";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json() as { phone?: string; code?: string };
    if (!phone) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }
    const cleanPhone = normalizePhone(phone);

    // Verification disabled → auto-verify any number so registration, forgot
    // password and onboarding proceed without a real OTP.
    if (!isWhatsappVerifyEnabled()) {
      await setCached(`otp_verified:${cleanPhone}`, { verified: true, at: Date.now() });
      return NextResponse.json({ ok: true, phone: cleanPhone });
    }

    if (!code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    const key = `otp:${cleanPhone}`;

    const record = await getCached<{ code?: string; attempts?: number }>(key, 300);
    if (!record || !record.code) {
      return NextResponse.json({ error: "অকার্যকর বা মেয়াদোত্তীর্ণ কোড" }, { status: 400 });
    }

    // H1: lock after 5 failed attempts — prevent brute-forcing the 6-digit code
    const attempts = record.attempts || 0;
    if (attempts >= 5) {
      await invalidateCache(key);
      return NextResponse.json({ error: "অনেকবার ভুল কোড। আবার কোড পাঠান" }, { status: 429 });
    }

    if (record.code !== code.trim()) {
      await setCached(key, { ...record, attempts: attempts + 1 });
      return NextResponse.json({ error: "অকার্যকর বা মেয়াদোত্তীর্ণ কোড" }, { status: 400 });
    }

    await invalidateCache(key);
    // C9: record proof of phone ownership, short-lived so it is consumed at registration
    await setCached(`otp_verified:${cleanPhone}`, { verified: true, at: Date.now() });
    return NextResponse.json({ ok: true, phone: cleanPhone });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}