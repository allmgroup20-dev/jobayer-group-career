import { queryFirst } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";

export async function isWorkerPhone(phone: string): Promise<boolean> {
  const db = await ensureDB();
  const clean = phone.replace(/[^0-9]/g, "");
  const worker = await queryFirst<{ id: number }>(
    { DB: db },
    "SELECT id FROM workers WHERE REPLACE(REPLACE(phone, ' ', ''), '+', '') = ?",
    [clean]
  );
  return !!worker;
}

export async function getWorkerByPhone(phone: string): Promise<{
  workerId: string; name: string; level: number; sponsorId: string | null;
} | null> {
  const db = await ensureDB();
  const clean = phone.replace(/[^0-9]/g, "");
  return queryFirst(
    { DB: db },
    "SELECT worker_id, name, level, sponsor_id FROM workers WHERE REPLACE(REPLACE(phone, ' ', ''), '+', '') = ?",
    [clean]
  );
}

export async function getWorkerPremiumStatus(phone: string): Promise<boolean> {
  const db = await ensureDB();
  const clean = phone.replace(/[^0-9]/g, "");
  const worker = await queryFirst<{ membership_status: string }>(
    { DB: db },
    "SELECT membership_status FROM workers WHERE REPLACE(REPLACE(phone, ' ', ''), '+', '') = ?",
    [clean]
  );
  return worker?.membership_status === "premium";
}
