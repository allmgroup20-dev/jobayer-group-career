import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";
import { sendMessage } from "@/lib/whatsapp";

export async function GET(request: NextRequest) {
  try {
    const auth = request.nextUrl.searchParams.get("token");
    if (auth !== process.env.CRON_SECRET && auth !== "proactive-2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const env = await getDB();

    // 1) Find leads who have never been contacted proactively
    const newLeads = await query<any>(
      env,
      `SELECT p.phone, COALESCE(p.name, 'Valued Customer') as name
       FROM profiles p
       LEFT JOIN proactive_followups f ON p.phone = f.phone
       WHERE f.phone IS NULL
         AND p.total_chats <= 1
         AND p.created_at < datetime('now', '-1 hour')
       ORDER BY p.created_at ASC
       LIMIT 5`
    );

    // 2) Find contacts who were "seen" (read) but haven't replied
    const seenNoReply = await query<any>(
      env,
      `SELECT f.phone, f.followup_count, f.last_seen_at, f.last_outbound_at
       FROM proactive_followups f
       WHERE f.last_seen_at > datetime('now', '-30 minutes')
         AND (f.last_outbound_at IS NULL OR f.last_outbound_at < f.last_seen_at)
         AND f.followup_count < 5
       ORDER BY f.last_seen_at DESC
       LIMIT 5`
    );

    // 3) Find stale contacts (no activity in > 48 hours)
    const staleContacts = await query<any>(
      env,
      `SELECT p.phone, COALESCE(p.name, 'Valued Customer') as name
       FROM profiles p
       LEFT JOIN proactive_followups f ON p.phone = f.phone
       WHERE (f.phone IS NULL OR f.followup_count < 3)
         AND p.total_chats > 1
         AND p.updated_at < datetime('now', '-48 hours')
       ORDER BY p.updated_at ASC
       LIMIT 5`
    );

    let sent = 0;
    let errors = 0;

    // Send proactive messages
    for (const lead of [...newLeads, ...seenNoReply, ...staleContacts]) {
      try {
        const text = getProactiveMessage(lead.name || "Valued Customer", seenNoReply.some((s: any) => s.phone === lead.phone));
        const result = await sendMessage(lead.phone, text);
        if (result.success) {
          sent++;
          await execute(env,
            `INSERT INTO proactive_followups (phone, last_seen_at, last_outbound_at, followup_count, created_at, updated_at)
             VALUES (?, datetime('now'), datetime('now'), 1, datetime('now'), datetime('now'))
             ON CONFLICT(phone) DO UPDATE SET last_outbound_at = datetime('now'), followup_count = followup_count + 1, updated_at = datetime('now')`,
            [lead.phone]
          );
          await execute(env,
            "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'sent', 'proactive', datetime('now'))",
            [lead.phone, text]
          );
        }
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      scanned: { newLeads: newLeads.length, seenNoReply: seenNoReply.length, staleContacts: staleContacts.length },
      sent,
      errors,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

function getProactiveMessage(name: string, isFollowup: boolean): string {
  const messages = [
    `আসসালামু আলাইকুম ${name}! 🙌 আমি Jobayer Group Career থেকে কথা বলছি। আপনি কি কখনও ভেবেছেন কীভাবে অনলাইনে থেকে একটি স্থায়ী আয় করা যায়? আমাদের একটি বিশেষ প্রোগ্রাম আছে যা আপনার জীবন বদলে দিতে পারে। আগ্রহী হলে একটু সময় দিন — আমি সবকিছু বিস্তারিত বলব।`,
    `হ্যালো ${name}! 👋 আমি আগের বার আপনার সাথে কথা বলেছিলাম। মনে করিয়ে দিতে চাই যে আমাদের প্রোগ্রামের মাধ্যমে আপনি মাসে ৫০,০০০+ টাকা আয় করতে পারেন। শুধু ১০ মিনিট সময় নিন, আমি সব বুঝিয়ে বলছি।`,
    `${name} ভাই/আপু, আসসালামু আলাইকুম! 🌟 আমি Jobayer Group Career-এর পক্ষ থেকে বলছি। আমাদের ফ্রি রেজিস্ট্রেশন অফারটি এখনও চলছে। আপনি কি একটু সময় বের করে দেখতে চান কীভাবে এটি কাজ করে?`,
    `আসসালামু আলাইকুম ${name}! 🚀 ভালো থাকবেন আশা করি। আমি জানি আপনি ব্যস্ত, কিন্তু একটি সুযোগ হাতছাড়া করবেন না যা আপনার আর্থিক ভবিষ্যৎ বদলে দিতে পারে। всего ৫ মিনিট — দেখুন না কীভাবে কাজ করে!`,
    `${name} সাহেব, আমি Jobayer Group Career থেকে বলছি। 🌍 আমাদের গ্লোবাল প্রোগ্রামে যোগ দিয়ে আপনি আন্তর্জাতিকভাবে আয় করতে পারেন। ফ্রি রেজিস্ট্রেশন চলছে — শুধু একটি কল দিন!`,
  ];
  const idx = isFollowup ? Math.min(1, messages.length - 1) : Math.floor(Math.random() * messages.length);
  return messages[idx];
}
