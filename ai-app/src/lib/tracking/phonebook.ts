import { ensureDB } from "@/lib/db";

export async function syncPhonebookContact(
  phone: string,
  name?: string | null,
  source?: string
): Promise<void> {
  const db = await ensureDB();
  const clean = phone.replace(/[^0-9]/g, "").replace(/^88/, "");
  if (!clean || clean.length < 10) return;

  const now = new Date().toISOString();

  const workers = await db.prepare(
    "SELECT worker_id FROM workers WHERE membership_status IN ('general', 'premium')"
  ).bind().all() as { results: { worker_id: string }[] };

  for (const w of workers.results) {
    const existing = await db.prepare(
      "SELECT id FROM user_phonebooks WHERE worker_id = ? AND contact_phone = ?"
    ).bind(w.worker_id, clean).first() as { id: number } | undefined;

    if (existing) {
      await db.prepare(
        "UPDATE user_phonebooks SET has_whatsapp = 1, last_checked_at = ?, source = COALESCE(?, source) WHERE id = ?"
      ).bind(now, source || "whatsapp_sync", existing.id).run();
    }
  }
}

function getSurname(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
}

export async function resolveReferrerForContact(
  contactPhone: string,
  contactName?: string | null
): Promise<{ sponsorId: string; sponsorName: string; matchType: "family" | "friend" | "lottery" } | null> {
  const db = await ensureDB();
  const clean = contactPhone.replace(/[^0-9]/g, "").replace(/^88/, "");
  if (!clean || clean.length < 10) return null;

  const referrers = await db.prepare(`
    SELECT p.worker_id, p.contact_name, w.name as worker_name
    FROM user_phonebooks p
    JOIN workers w ON w.worker_id = p.worker_id
    WHERE p.contact_phone = ? AND p.has_whatsapp = 1
  `).bind(clean).all() as { results: { worker_id: string; contact_name: string | null; worker_name: string }[] };

  if (referrers.results.length === 0) return null;
  if (referrers.results.length === 1) {
    return {
      sponsorId: referrers.results[0].worker_id,
      sponsorName: referrers.results[0].worker_name,
      matchType: "friend",
    };
  }

  const contactSurname = contactName ? getSurname(contactName) : null;

  // Priority 1: Family — same surname as the contact
  if (contactSurname) {
    for (const r of referrers.results) {
      const workerSurname = getSurname(r.worker_name);
      if (workerSurname === contactSurname) {
        return { sponsorId: r.worker_id, sponsorName: r.worker_name, matchType: "family" };
      }
    }
  }

  // Priority 2: Family — workers who saved this contact with matching surname
  if (contactSurname) {
    for (const r of referrers.results) {
      if (r.contact_name) {
        const savedSurname = getSurname(r.contact_name);
        if (savedSurname === contactSurname) {
          return { sponsorId: r.worker_id, sponsorName: r.worker_name, matchType: "family" };
        }
      }
    }
  }

  // Priority 3: Friends — pick one from the list (first match)
  const friend = referrers.results[0];
  return { sponsorId: friend.worker_id, sponsorName: friend.worker_name, matchType: "friend" };
}

export async function resolveReferrerLottery(
  contactPhone: string,
  preferredWorkerIds?: string[]
): Promise<{ sponsorId: string; sponsorName: string; matchType: "family" | "friend" | "lottery" } | null> {
  const db = await ensureDB();
  const clean = contactPhone.replace(/[^0-9]/g, "").replace(/^88/, "");
  if (!clean || clean.length < 10) return null;

  const referrers = await db.prepare(`
    SELECT p.worker_id, p.contact_name, w.name as worker_name
    FROM user_phonebooks p
    JOIN workers w ON w.worker_id = p.worker_id
    WHERE p.contact_phone = ? AND p.has_whatsapp = 1
  `).bind(clean).all() as { results: { worker_id: string; contact_name: string | null; worker_name: string }[] };

  if (referrers.results.length === 0) return null;

  // Filter by preferred workers if provided (family members)
  let candidates = referrers.results;
  if (preferredWorkerIds && preferredWorkerIds.length > 0) {
    const filtered = candidates.filter(r => preferredWorkerIds.includes(r.worker_id));
    if (filtered.length > 0) candidates = filtered;
  }

  // Lottery: random selection
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  return { sponsorId: pick.worker_id, sponsorName: pick.worker_name, matchType: "lottery" };
}
