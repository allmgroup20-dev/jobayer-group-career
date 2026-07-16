import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

function calcNextPaymentDate(intervalDays: number, dayOfWeek: number): string {
  const now = new Date();
  const next = new Date(now);
  const currentDay = now.getDay();
  let daysUntilNext = (dayOfWeek - currentDay + 7) % 7;
  if (daysUntilNext === 0 && intervalDays > 7) daysUntilNext = intervalDays;
  else if (daysUntilNext === 0) daysUntilNext = 7;
  next.setDate(next.getDate() + daysUntilNext);
  // Ensure at least intervalDays from now
  while ((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < intervalDays) {
    next.setDate(next.getDate() + 7);
  }
  return next.toISOString().split("T")[0];
}

export async function GET() {
  try {
    const env = await getDB();
    const rows = await query<{ setting_key: string; setting_value: string }>(
      env,
      "SELECT setting_key, setting_value FROM company_settings WHERE setting_key IN ('payment_interval_days','payment_day_of_week','payment_system_active','next_payment_date','payment_system_status')"
    );
    const map: Record<string, string> = {};
    for (const r of rows) map[r.setting_key] = r.setting_value;
    return NextResponse.json({
      intervalDays: parseInt(map.payment_interval_days || "7"),
      dayOfWeek: parseInt(map.payment_day_of_week || "5"),
      systemActive: map.payment_system_active !== "0",
      systemStatus: map.payment_system_status || "active",
      nextPaymentDate: map.next_payment_date || calcNextPaymentDate(7, 5),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { intervalDays, dayOfWeek, systemActive, systemStatus } = await request.json() as {
      intervalDays?: number; dayOfWeek?: number; systemActive?: boolean; systemStatus?: string;
    };
    const env = await getDB();
    const settings: { key: string; value: string }[] = [];

    if (intervalDays !== undefined) {
      settings.push({ key: "payment_interval_days", value: String(intervalDays) });
    }
    if (dayOfWeek !== undefined) {
      settings.push({ key: "payment_day_of_week", value: String(dayOfWeek) });
    }
    if (systemActive !== undefined) {
      settings.push({ key: "payment_system_active", value: systemActive ? "1" : "0" });
    }
    if (systemStatus) {
      settings.push({ key: "payment_system_status", value: systemStatus });
    }

    // Calculate next payment date
    const finalInterval = intervalDays ?? parseInt((await query<{ setting_value: string }>(env,
      "SELECT setting_value FROM company_settings WHERE setting_key = 'payment_interval_days'", []
    ))[0]?.setting_value || "7");
    const finalDay = dayOfWeek ?? parseInt((await query<{ setting_value: string }>(env,
      "SELECT setting_value FROM company_settings WHERE setting_key = 'payment_day_of_week'", []
    ))[0]?.setting_value || "5");
    const nextDate = calcNextPaymentDate(finalInterval, finalDay);
    settings.push({ key: "next_payment_date", value: nextDate });

    for (const s of settings) {
      await execute(env,
        "DELETE FROM company_settings WHERE setting_key = ?", [s.key]
      );
      await execute(env,
        "INSERT INTO company_settings (setting_key, setting_value, setting_type, updated_at) VALUES (?, ?, 'text', datetime('now'))",
        [s.key, s.value]
      );
    }
    return NextResponse.json({ success: true, nextPaymentDate: nextDate });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
