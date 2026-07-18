import { query, queryFirst, execute } from "@/lib/db/queries";
import { ensureDB } from "@/lib/db";
import { syncPhonebookContact } from "@/lib/tracking/phonebook";

export interface WAContact {
  id: number;
  phone: string;
  name: string | null;
  status: string;
  priority_score: number;
  source: string;
  assigned_account: string | null;
  last_contacted_at: string | null;
  last_reply: string | null;
  notes: string | null;
}

export async function getContact(phone: string): Promise<WAContact | null> {
  const db = await ensureDB();
  return queryFirst<WAContact>(
    { DB: db },
    "SELECT id, phone, name, status, priority_score, source, assigned_account, last_contacted_at, last_reply, notes FROM wa_contacts WHERE phone = ?",
    [phone]
  );
}

export async function createContact(
  phone: string,
  data?: { name?: string; source?: string; notes?: string }
): Promise<void> {
  const db = await ensureDB();
  const existing = await getContact(phone);
  if (existing) {
    await execute(
      { DB: db },
      "UPDATE wa_contacts SET notes = COALESCE(?, notes), updated_at = datetime('now') WHERE phone = ?",
      [data?.notes || null, phone]
    );
    return;
  }
  await execute(
    { DB: db },
    "INSERT INTO wa_contacts (phone, name, status, source, notes, created_at, updated_at) VALUES (?, ?, 'pending', ?, ?, datetime('now'), datetime('now'))",
    [phone, data?.name || null, data?.source || "manual", data?.notes || null]
  );

  syncPhonebookContact(phone, data?.name, data?.source).catch(() => {});
}

export async function updateContactStatus(
  phone: string,
  status: string,
  reply?: string
): Promise<void> {
  const db = await ensureDB();
  await execute(
    { DB: db },
    "UPDATE wa_contacts SET status = ?, last_reply = COALESCE(?, last_reply), last_contacted_at = datetime('now'), updated_at = datetime('now') WHERE phone = ?",
    [status, reply || null, phone]
  );
}
