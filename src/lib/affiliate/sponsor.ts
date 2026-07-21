import { queryFirst } from "../db/queries";

interface SponsorRow { sponsor_id: string; }

export async function getSponsorUpline(env: { DB: D1Database }, workerId: string): Promise<{ workerId: string; level: number }[]> {
  const chain: { workerId: string; level: number }[] = [];
  let currentId: string | null = workerId;
  let lvl = 1;

  while (currentId && lvl <= 10) {
    const sponsorRow: SponsorRow | null = await queryFirst<SponsorRow>(
      env, "SELECT sponsor_id FROM workers WHERE worker_id = ?", [currentId]
    );
    if (!sponsorRow?.sponsor_id) break;

    const exists = await queryFirst<{ worker_id: string }>(
      env, "SELECT worker_id FROM workers WHERE worker_id = ?", [sponsorRow.sponsor_id]
    );
    if (!exists) break;

    chain.push({ workerId: sponsorRow.sponsor_id, level: lvl });
    currentId = sponsorRow.sponsor_id;
    lvl++;
  }

  return chain;
}
