import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

const WARMUP_LIMITS = [
  { day: 1, limit: 20 },
  { day: 2, limit: 30 },
  { day: 3, limit: 50 },
  { day: 4, limit: 70 },
  { day: 5, limit: 100 },
  { day: 6, limit: 150 },
  { day: 7, limit: 200 },
  { day: 10, limit: 300 },
  { day: 14, limit: 500 },
  { day: 21, limit: 1000 },
  { day: 30, limit: 1500 },
];

export async function getWarmupStatus(accountId: string): Promise<{
  dayCount: number;
  currentLimit: number;
  dailySent: number;
  remaining: number;
}> {
  const db = await ensureDB();
  const warmup = await queryFirst<{ day_count: number; current_limit: number }>(
    { DB: db },
    "SELECT day_count, current_limit FROM wa_warmup WHERE account_id = ?",
    [accountId]
  );

  const account = await queryFirst<{ daily_sent: number }>(
    { DB: db },
    "SELECT daily_sent FROM wa_accounts WHERE account_id = ?",
    [accountId]
  );

  const dayCount = warmup?.day_count || 0;
  const currentLimit = warmup?.current_limit || 20;
  const dailySent = account?.daily_sent || 0;

  return {
    dayCount,
    currentLimit,
    dailySent,
    remaining: Math.max(0, currentLimit - dailySent),
  };
}

export async function incrementWarmup(accountId: string): Promise<void> {
  const db = await ensureDB();
  let warmup = await queryFirst<{ id: number; day_count: number; current_limit: number }>(
    { DB: db },
    "SELECT * FROM wa_warmup WHERE account_id = ?",
    [accountId]
  );

  if (!warmup) {
    await execute(
      { DB: db },
      "INSERT INTO wa_warmup (account_id, day_count, current_limit, started_at, last_increment_at) VALUES (?, 1, 20, datetime('now'), datetime('now'))",
      [accountId]
    );
    return;
  }

  const newDay = warmup.day_count + 1;
  const limitEntry = WARMUP_LIMITS.slice().reverse().find((e) => newDay >= e.day);
  const newLimit = limitEntry?.limit || 2000;

  await execute(
    { DB: db },
    "UPDATE wa_warmup SET day_count = ?, current_limit = ?, last_increment_at = datetime('now') WHERE id = ?",
    [newDay, newLimit, warmup.id]
  );

  await execute(
    { DB: db },
    "UPDATE wa_accounts SET daily_limit = ? WHERE account_id = ?",
    [newLimit, accountId]
  );

  await resetDailyCount(accountId);
}

async function resetDailyCount(accountId: string): Promise<void> {
  const db = await ensureDB();
  await execute(
    { DB: db },
    "UPDATE wa_accounts SET daily_sent = 0 WHERE account_id = ?",
    [accountId]
  );
}
