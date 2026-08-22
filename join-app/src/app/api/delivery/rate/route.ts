import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";

async function getRate(env: { DB: D1Database }): Promise<{ rate: number; updatedAt: string | null }> {
  const row = await env.DB.prepare("SELECT setting_value FROM company_settings WHERE setting_key = 'usd_bdt_rate'").first<{ setting_value: string }>();
  const dateRow = await env.DB.prepare("SELECT setting_value FROM company_settings WHERE setting_key = 'usd_bdt_rate_updated_at'").first<{ setting_value: string }>();
  const rate = row?.setting_value ? Number(row.setting_value) : 122;
  return { rate: Number.isFinite(rate) && rate > 0 ? rate : 122, updatedAt: dateRow?.setting_value || null };
}

async function fetchAndSaveRate(env: { DB: D1Database }): Promise<number> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { cache: "no-store" });
    if (!res.ok) return (await getRate(env)).rate;
    const data = (await res.json()) as { rates?: Record<string, number> };
    const bdt = data.rates?.BDT;
    if (typeof bdt === "number" && Number.isFinite(bdt) && bdt > 0) {
      const now = new Date().toISOString();
      await env.DB.prepare("INSERT OR REPLACE INTO company_settings (setting_key, setting_value, setting_type) VALUES ('usd_bdt_rate', ?, 'text')").bind(String(bdt)).run();
      await env.DB.prepare("INSERT OR REPLACE INTO company_settings (setting_key, setting_value, setting_type) VALUES ('usd_bdt_rate_updated_at', ?, 'text')").bind(now).run();
      return bdt;
    }
  } catch {}
  return (await getRate(env)).rate;
}

export async function GET(request: NextRequest) {
  try {
    const env = await getDB();
    // Ensure settings exist
    await env.DB.prepare("INSERT OR IGNORE INTO company_settings (setting_key, setting_value, setting_type) VALUES ('usd_bdt_rate', '122', 'text')").run();
    const tier = request.nextUrl.searchParams.get("tier") || "foundation";
    const mode = request.nextUrl.searchParams.get("mode") || "post";
    let { rate, updatedAt } = await getRate(env);
    // Auto-refresh if older than 24h
    if (!updatedAt || Date.now() - new Date(updatedAt).getTime() > 24 * 60 * 60 * 1000) {
      rate = await fetchAndSaveRate(env);
      const upd = await env.DB.prepare("SELECT setting_value FROM company_settings WHERE setting_key = 'usd_bdt_rate_updated_at'").first<{ setting_value: string }>();
      updatedAt = upd?.setting_value || new Date().toISOString();
    }
    const baseUsd = tier === "elite" ? 3 : 2;
    const homeExtraUsd = mode === "home" ? 1 : 0;
    const totalUsd = baseUsd + homeExtraUsd;
    const totalBdt = Math.floor(totalUsd * rate);
    return NextResponse.json({ usdBdtRate: rate, updatedAt, baseUsd, homeExtraUsd, totalUsd, totalBdt, currency: "BDT" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
