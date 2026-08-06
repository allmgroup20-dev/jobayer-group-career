import { NextRequest, NextResponse } from "next/server";
import { queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, invalidateCache, setCached } from "@/lib/cache";
import {
  hashWorkerPassword, generateToken, generateWorkerId, getJwtSecret, normalizePhone,
} from "@/lib/auth";
import { setSessionCookie } from "@/lib/auth/session";

// OTP-based frictionless auth: verify code then login (existing) or auto-register (new)
export async function POST(request: NextRequest) {
  try {
    const { phone, code, referralCode, referralSource, utmSource } = await request.json() as {
      phone?: string; code?: string; referralCode?: string; referralSource?: string; utmSource?: string;
    };
    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);
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

    const env = await getDB();
    const existing = await queryFirst<{ worker_id: string; name: string }>(
      env, "SELECT worker_id, name FROM workers WHERE phone = ?", [cleanPhone]
    );

    if (existing) {
      const token = await generateToken(existing.worker_id, getJwtSecret());
      const response = NextResponse.json({ token, workerId: existing.worker_id, name: existing.name, isNew: false });
      setSessionCookie(response, token);
      return response;
    }

    // Auto-register new worker
    const displayName = `User${cleanPhone.slice(-6)}`;
    const workerId = generateWorkerId(displayName, cleanPhone);
    const tempPassword = await hashWorkerPassword(Math.random().toString(36).slice(2, 12));

    let sponsorId: string | null = null;
    let sponsorName: string | null = null;
    if (referralCode) {
      const sponsor = await queryFirst<{ worker_id: string; name: string }>(
        env, "SELECT worker_id, name FROM workers WHERE worker_id = ?", [referralCode]
      );
      if (sponsor) { sponsorId = sponsor.worker_id; sponsorName = sponsor.name; }
    }

    await execute(env,
      `INSERT INTO workers (worker_id, name, phone, password, sponsor_id, sponsor_name, level, join_date, membership_status)
       VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), 'general')`,
      [workerId, displayName, cleanPhone, tempPassword, sponsorId, sponsorName]
    );

    if (referralSource) {
      await execute(env, "UPDATE workers SET referral_source = ? WHERE worker_id = ?", [referralSource, workerId]).catch(() => {});
    }
    const attributionChannel = utmSource || referralSource || "direct";
    await execute(env,
      `INSERT INTO attribution_log (worker_id, channel, utm_source, utm_medium, utm_campaign, referrer, landing_page, first_visit_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [workerId, attributionChannel, utmSource || null, null, null, null, null]
    ).catch(() => {});
    await execute(env,
      `INSERT INTO affiliate_tree (worker_id, parent_id, sponsor_id, level_number, position)
       VALUES (?, ?, ?, 1, 0)`,
      [workerId, sponsorId, sponsorId]
    ).catch(() => {});
    if (sponsorId) {
      await execute(env, "UPDATE workers SET total_team_members = total_team_members + 1 WHERE worker_id = ?", [sponsorId]).catch(() => {});
    }

    try {
      const incomeSetting = await queryFirst<{ setting_value: string }>(
        env, "SELECT setting_value FROM company_settings WHERE setting_key = 'resource_income_default_amount'"
      );
      const amount = parseFloat(incomeSetting?.setting_value || "0") || 0;
      if (amount > 0) {
        await execute(env,
          "UPDATE workers SET resource_income = resource_income + ?, resource_income_original = resource_income_original + ? WHERE worker_id = ?",
          [amount, amount, workerId]
        );
      }
    } catch {}

    const phoneHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(cleanPhone))))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    setCached(`auth:worker:${phoneHash}`, { worker_id: workerId, name: displayName, password: tempPassword }).catch(() => {});

    const token = await generateToken(workerId, getJwtSecret());
    const response = NextResponse.json({ token, workerId, name: displayName, isNew: true });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error("OTP login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}