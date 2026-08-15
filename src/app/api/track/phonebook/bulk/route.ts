import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      workerId: string;
      contacts: { name: string; phone: string }[];
      skipBonus?: boolean;
      bonusCount?: number;
    };
    if (!body.workerId) {
      return NextResponse.json({ error: "workerId required" }, { status: 400 });
    }
    if (!body.contacts?.length && typeof body.bonusCount !== "number") {
      return NextResponse.json({ error: "workerId and contacts required" }, { status: 400 });
    }

    const db = await ensureDB();
    const now = new Date().toISOString();
    let matchedCount = 0;
    const matchedWorkers: string[] = [];

    // Get all active workers for matching
    const workers = await db.prepare(
      "SELECT worker_id, name, phone FROM workers WHERE membership_status IN ('general', 'premium')"
    ).bind().all() as { results: { worker_id: string; name: string; phone: string }[] };

    const phoneToWorker = new Map<string, { worker_id: string; name: string }>();
    for (const w of workers.results) {
      const clean = w.phone.replace(/[^0-9]/g, "").replace(/^88/, "");
      phoneToWorker.set(clean, { worker_id: w.worker_id, name: w.name });
    }

    // Process each contact (skipped for the bonus-only settlement call)
    for (const contact of body.contacts || []) {
      const cleanPhone = contact.phone.replace(/[^0-9]/g, "").replace(/^88/, "");
      if (!cleanPhone || cleanPhone.length < 10) continue;

      const match = phoneToWorker.get(cleanPhone);
      let contactWorkerId = match?.worker_id || null;

      // Upsert into user_phonebooks
      const existing = await db.prepare(
        "SELECT id FROM user_phonebooks WHERE worker_id = ? AND contact_phone = ?"
      ).bind(body.workerId, cleanPhone).first() as { id: number } | undefined;

      if (existing) {
        await db.prepare(
          "UPDATE user_phonebooks SET contact_name = COALESCE(?, contact_name), contact_worker_id = ?, has_whatsapp = 1, last_checked_at = ?, updated_at = ? WHERE id = ?"
        ).bind(contact.name || null, contactWorkerId, now, now, existing.id).run();
      } else {
        await db.prepare(
          "INSERT INTO user_phonebooks (worker_id, contact_phone, contact_name, contact_worker_id, has_whatsapp, source, created_at, updated_at) VALUES (?, ?, ?, ?, 1, 'contact_sync', ?, ?)"
        ).bind(body.workerId, cleanPhone, contact.name || null, contactWorkerId, now, now).run();
      }

      if (match) {
        matchedCount++;
        matchedWorkers.push(match.worker_id);
      }
    }

    // If contact matched workers, try to resolve referrer
    let bonusAmount = 0;
    if (matchedCount > 0) {
      // Try to find referrer from the matched contacts' own phonebooks
      for (const matchedWorkerId of matchedWorkers) {
        const referrer = await db.prepare(`
          SELECT p.worker_id, w.name as worker_name
          FROM user_phonebooks p
          JOIN workers w ON w.worker_id = p.worker_id
          WHERE p.contact_phone = (SELECT phone FROM workers WHERE worker_id = ?)
          AND p.has_whatsapp = 1
          LIMIT 1
        `).bind(matchedWorkerId).first() as { worker_id: string; worker_name: string } | undefined;

        if (referrer) {
          // Update sponsor if not already set
          await db.prepare(
            "UPDATE workers SET sponsor_id = COALESCE(sponsor_id, ?), sponsor_name = COALESCE(sponsor_name, ?) WHERE worker_id = ? AND sponsor_id IS NULL"
          ).bind(referrer.worker_id, referrer.worker_name, body.workerId).run();
          break;
        }
      }
    }

    // Award bonus. For chunked syncs, the final (bonus-only) call passes the
    // cumulative matched count so the cap applies across the whole phonebook.
    if (!body.skipBonus) {
      const bonusBase = typeof body.bonusCount === "number" ? body.bonusCount : matchedCount;
      if (bonusBase > 0) {
        bonusAmount = Math.min(50, bonusBase * 5);
        await db.prepare(
          "UPDATE workers SET balance = COALESCE(balance, 0) + ? WHERE worker_id = ?"
        ).bind(bonusAmount, body.workerId).run();
      }
    }

    return NextResponse.json({
      ok: true,
      totalContacts: body.contacts.length,
      matchedCount,
      bonusAmount,
    });
  } catch (err) {
    console.error("Bulk phonebook error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
