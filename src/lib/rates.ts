export async function fetchDailyUSDBDT(): Promise<number | null> {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    const rate = data.rates?.BDT;
    if (typeof rate === "number" && Number.isFinite(rate) && rate > 0) return rate;
    return null;
  } catch {
    return null;
  }
}

export function floorBDT(dollar: number, rate: number): number {
  return Math.floor(dollar * rate);
}

export async function getUSDBDTRate(env: { DB: D1Database }): Promise<{ rate: number; updatedAt: string | null }> {
  const row = await env.DB.prepare("SELECT setting_value FROM company_settings WHERE setting_key = 'usd_bdt_rate'").first<{ setting_value: string }>();
  const dateRow = await env.DB.prepare("SELECT setting_value FROM company_settings WHERE setting_key = 'usd_bdt_rate_updated_at'").first<{ setting_value: string }>();
  const rate = row?.setting_value ? Number(row.setting_value) : 122;
  return { rate: Number.isFinite(rate) && rate > 0 ? rate : 122, updatedAt: dateRow?.setting_value || null };
}

export async function saveUSDBDTRate(env: { DB: D1Database }, rate: number): Promise<void> {
  const now = new Date().toISOString();
  await env.DB.prepare("INSERT OR REPLACE INTO company_settings (setting_key, setting_value, setting_type) VALUES ('usd_bdt_rate', ?, 'text')").bind(String(rate)).run();
  await env.DB.prepare("INSERT OR REPLACE INTO company_settings (setting_key, setting_value, setting_type) VALUES ('usd_bdt_rate_updated_at', ?, 'text')").bind(now).run();
}
