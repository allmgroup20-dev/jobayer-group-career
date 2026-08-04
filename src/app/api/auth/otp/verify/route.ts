import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/auth";
import { getCached, invalidateCache } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json() as { phone?: string; code?: string };
    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }
    const cleanPhone = normalizePhone(phone);
    const key = `otp:${cleanPhone}`;

    const record = await getCached<{ code?: string }>(key, 300);
    if (!record || record.code !== code.trim()) {
      return NextResponse.json({ error: "অকার্যকর বা মেয়াদোত্তীর্ণ কোড" }, { status: 400 });
    }

    await invalidateCache(key);
    return NextResponse.json({ ok: true, phone: cleanPhone });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}