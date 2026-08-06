import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { hashWorkerPassword, normalizePhone } from "@/lib/auth";
import { getCached, invalidateCache } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json() as { phone?: string; password?: string };
    if (!phone || !password) {
      return NextResponse.json({ error: "Phone and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);

    // C9: phone-ownership must be proven via OTP before the password is reset
    const verified = await getCached<{ verified: boolean }>(`otp_verified:${cleanPhone}`, 600);
    if (!verified?.verified) {
      return NextResponse.json({ error: "ফোন নম্বর যাচাই করুন" }, { status: 403 });
    }

    const env = await getDB();
    const hashed = await hashWorkerPassword(password);
    await execute(env,
      "UPDATE workers SET password = ?, updated_at = datetime('now') WHERE phone = ?",
      [hashed, cleanPhone]
    );

    // Consume the verification proof — one verified phone = one reset
    await invalidateCache(`otp_verified:${cleanPhone}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
