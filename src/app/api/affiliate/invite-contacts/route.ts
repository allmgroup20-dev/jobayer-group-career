import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, queryFirst } from "@/lib/db/queries";
import { requireWorker } from "@/lib/auth/guard";

function cleanPhone(raw: string): string {
  return raw.replace(/[^0-9]/g, "").replace(/^88/, "");
}

export async function GET(req: NextRequest) {
  try {
    const workerId = req.nextUrl.searchParams.get("workerId");
    if (!workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }

    const payload = await requireWorker(req, workerId);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const env = await getDB();

    const [contacts, workers, workerInfo] = await Promise.all([
      query<{ phone: string; name: string | null; hasWhatsapp: number }>(
        env,
        "SELECT contact_phone AS phone, contact_name AS name, has_whatsapp AS hasWhatsapp FROM user_phonebooks WHERE worker_id = ? ORDER BY contact_name ASC LIMIT 2000",
        [workerId]
      ),
      query<{ workerId: string; phone: string; name: string }>(
        env,
        "SELECT worker_id AS workerId, phone, name FROM workers WHERE membership_status IN ('general', 'premium')"
      ),
      queryFirst<{ workerId: string; name: string; phone: string }>(
        env,
        "SELECT worker_id AS workerId, name, phone FROM workers WHERE worker_id = ?",
        [workerId]
      ),
    ]);

    const phoneToWorker = new Map<string, { workerId: string; name: string }>();
    for (const w of workers) {
      phoneToWorker.set(cleanPhone(w.phone), { workerId: w.workerId, name: w.name });
    }

    const joined: { name: string | null; phone: string; joinedName: string | null; hasWhatsapp: boolean }[] = [];
    const notJoined: { name: string | null; phone: string }[] = [];

    for (const c of contacts) {
      const clean = cleanPhone(c.phone);
      if (!clean || clean.length < 10) continue;
      if (workerInfo && cleanPhone(workerInfo.phone) === clean) continue;
      const match = phoneToWorker.get(clean);
      if (match) {
        joined.push({ name: c.name, phone: clean, joinedName: match.name, hasWhatsapp: c.hasWhatsapp === 1 });
      } else {
        notJoined.push({ name: c.name, phone: clean });
      }
    }

    return NextResponse.json({
      ok: true,
      total: contacts.length,
      joinedCount: joined.length,
      notJoinedCount: notJoined.length,
      joined,
      notJoined,
    });
  } catch (error) {
    console.error("Invite contacts error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}