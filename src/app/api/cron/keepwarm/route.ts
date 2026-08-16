import { NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";
import { querySafe, query, execute } from "@/lib/db/queries";
import { setCached } from "@/lib/cache";
import { scoreAllWorkers } from "@/lib/tracking/scoring";
import { sendMessage } from "@/lib/whatsapp";
import { isFeatureEnabled } from "@/lib/features";

const PROACTIVE_MESSAGES = [
  (name: string) => `আসসালামু আলাইকুম ${name}! 🙌 আমি Jobayer Group Career থেকে কথা বলছি। আমাদের কাছে ৯৭০+ প্রিমিয়াম রিসোর্স আছে যেখানে দক্ষতা শেখা যায় এবং রেফারেল কমিশনে আয়ের সুযোগ আছে। আগ্রহী হলে একটু সময় দিন — আমি বিস্তারিত বলব।`,
  (name: string) => `হ্যালো ${name}! 👋 আমি আগের বার আপনার সাথে কথা বলেছিলাম। আমাদের প্রোগ্রামে প্রতিটি সফল রেফারেলে ৳২০ কমিশন (৪ স্তর পর্যন্ত) পাওয়া যায়। শুধু ১০ মিনিট সময় নিন, আমি সব বুঝিয়ে বলছি।`,
  (name: string) => `${name} ভাই/আপু, আসসালামু আলাইকুম! 🌟 আমি Jobayer Group Career-এর পক্ষ থেকে বলছি। আমাদের ফ্রি রেজিস্ট্রেশন চলছে। আপনি কি একটু সময় বের করে দেখতে চান কীভাবে এটি কাজ করে?`,
  (name: string) => `আসসালামু আলাইকুম ${name}! 🚀 ভালো থাকবেন আশা করি। আমি জানি আপনি ব্যস্ত, কিন্তু একটি সুযোগ দেখে নিন যা আপনাকে নতুন দক্ষতা শেখাতে পারে। মাত্র ৫ মিনিট — দেখুন না কীভাবে কাজ করে!`,
  (name: string) => `${name} সাহেব, আমি Jobayer Group Career থেকে বলছি। 🌍 আমাদের রিসোর্স কালেকশনে যোগ দিয়ে আপনি নতুন দক্ষতা শিখতে পারেন। ফ্রি রেজিস্ট্রেশন চলছে — শুধু একটি কল দিন!`,
];

async function runProactiveFollowups(): Promise<{ newLeads: number; seenNoReply: number; stale: number; sent: number }> {
  const env = await ensureDB();
  let sent = 0;

  // 1) New leads (never contacted, 1+ hour old)
  const newLeads = await query<any>(
    { DB: env },
    `SELECT p.phone, COALESCE(p.name_guess, 'Valued Customer') as name
     FROM ai_phone_profiles p
     LEFT JOIN proactive_followups f ON p.phone = f.phone
     WHERE f.phone IS NULL AND p.total_chats <= 1
       AND p.created_at < datetime('now', '-1 hour')
     ORDER BY p.created_at ASC LIMIT 3`
  );

  // 2) Seen but no reply (read within 30 min, no outbound after that)
  const seenNoReply = await query<any>(
    { DB: env },
    `SELECT f.phone, f.followup_count, f.last_seen_at, f.last_outbound_at
     FROM proactive_followups f
     WHERE f.last_seen_at > datetime('now', '-30 minutes')
       AND (f.last_outbound_at IS NULL OR f.last_outbound_at < f.last_seen_at)
       AND f.followup_count < 5
     ORDER BY f.last_seen_at DESC LIMIT 3`
  );

  // 3) Stale contacts (no activity > 48h, < 3 followups)
  const staleContacts = await query<any>(
    { DB: env },
    `SELECT p.phone, COALESCE(p.name_guess, 'Valued Customer') as name
     FROM ai_phone_profiles p
     LEFT JOIN proactive_followups f ON p.phone = f.phone
     WHERE (f.phone IS NULL OR f.followup_count < 3)
       AND p.total_chats > 1
       AND p.updated_at < datetime('now', '-48 hours')
     ORDER BY p.updated_at ASC LIMIT 3`
  );

  for (const lead of [...newLeads, ...staleContacts]) {
    try {
      const text = PROACTIVE_MESSAGES[Math.floor(Math.random() * PROACTIVE_MESSAGES.length)](lead.name || "Valued Customer");
      const result = await sendMessage(lead.phone, text);
      if (result.success) {
        sent++;
        await execute({ DB: env },
          `INSERT INTO proactive_followups (phone, last_outbound_at, followup_count, created_at, updated_at)
           VALUES (?, datetime('now'), 1, datetime('now'), datetime('now'))
           ON CONFLICT(phone) DO UPDATE SET last_outbound_at = datetime('now'), followup_count = followup_count + 1, updated_at = datetime('now')`,
          [lead.phone]
        );
      }
    } catch (e) { console.error("[Keepwarm] send lead error:", (e as Error)?.message); }
  }

  for (const contact of seenNoReply) {
    try {
      const text = PROACTIVE_MESSAGES[1](contact.phone || "Valued Customer");
      const result = await sendMessage(contact.phone, text);
      if (result.success) {
        sent++;
        await execute({ DB: env },
          `UPDATE proactive_followups SET last_outbound_at = datetime('now'), followup_count = followup_count + 1, updated_at = datetime('now') WHERE phone = ?`,
          [contact.phone]
        );
      }
    } catch (e) { console.error("[Keepwarm] send seenNoReply error:", (e as Error)?.message); }
  }

  return { newLeads: newLeads.length, seenNoReply: seenNoReply.length, stale: staleContacts.length, sent };
}

async function warmCourses(db: { DB: D1Database }): Promise<string> {
  const sql = `SELECT c.id, c.title, c.title_bn as titleBn, c.is_new as isNew, c.is_visible as isVisible,
            c.price, c.is_premium as isPremium, c.created_at as createdAt, c.updated_at as updatedAt,
            c.trainer_id as trainerId, c.institution_id as institutionId,
            t.name as trainerName, t.name_bn as trainerNameBn, t.image_url as trainerImageUrl,
            i.name as institutionName, i.name_bn as institutionNameBn, i.logo_url as institutionLogoUrl,
            COALESCE(cat_agg.category_ids, '[]') as categoryIds,
            COALESCE(cat_agg.category_names, '[]') as categoryNames,
            COALESCE(cat_agg.category_names_bn, '[]') as categoryNamesBn,
            COALESCE(files.file_url, '') as fileUrl,
            COALESCE(files.file_count, 0) as fileCount,
            COALESCE(ratings.avg_rating, 0) as avgRating,
            COALESCE(ratings.rating_count, 0) as ratingCount
            FROM courses c
            LEFT JOIN trainers t ON t.id = c.trainer_id
            LEFT JOIN institutions i ON i.id = c.institution_id
            LEFT JOIN (SELECT m.course_id, json_group_array(DISTINCT m.category_id) as category_ids,
                       json_group_array(DISTINCT cat.name) as category_names,
                       json_group_array(DISTINCT cat.name_bn) as category_names_bn
                       FROM course_category_map m LEFT JOIN course_categories cat ON m.category_id = cat.id
                       GROUP BY m.course_id) cat_agg ON cat_agg.course_id = c.id
            LEFT JOIN (SELECT course_id, MIN(url) as file_url, COUNT(*) as file_count
                       FROM course_files GROUP BY course_id) files ON files.course_id = c.id
            LEFT JOIN (SELECT course_id, ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as rating_count
                       FROM course_ratings GROUP BY course_id) ratings ON ratings.course_id = c.id
            ORDER BY c.is_new DESC, c.created_at DESC LIMIT 500`;
  const rows = await querySafe<any>(db, sql, [], 15000);
  const courses = rows.map((r: any) => ({
    ...r, categoryIds: JSON.parse(r.categoryIds), categoryNames: JSON.parse(r.categoryNames), categoryNamesBn: JSON.parse(r.categoryNamesBn),
  }));
  await setCached("courses:c::n::v:", courses);
  return `courses: ${courses.length}`;
}

export async function GET() {
  try {
    const d1 = await ensureDB();
    await d1.prepare("SELECT 1").run();
    // Proactive WhatsApp outreach is the biggest recurring cost (cron every 5min).
    // When the keepwarm_cron flag is OFF we skip all outbound sending entirely.
    const keepwarmEnabled = await isFeatureEnabled("keepwarm_cron");
    const [warm, proactive] = await Promise.all([
      warmCourses({ DB: d1 }),
      keepwarmEnabled
        ? runProactiveFollowups().catch(() => ({ newLeads: 0, seenNoReply: 0, stale: 0, sent: 0 }))
        : Promise.resolve({ newLeads: 0, seenNoReply: 0, stale: 0, sent: 0 }),
    ]);
    let scoring = { scored: 0, errors: 0 };
    try {
      scoring = await scoreAllWorkers();
    } catch (e) {
      console.error("Scoring error:", e);
    }
    return NextResponse.json({
      ok: true, warm, scoring: `${scoring.scored} scored, ${scoring.errors} errors`,
      proactive, ts: Date.now(),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
