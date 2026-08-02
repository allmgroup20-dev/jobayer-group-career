import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";
import { sendMessage } from "@/lib/whatsapp";
import { getOrCreateProfile, detectLanguage } from "@/lib/ai";
import { callAI } from "@/lib/ai/router";
import { getContactIntelligence } from "@/lib/ai/contact-intelligence";

const PROACTIVE_SYSTEM_PROMPT = `You are a proactive business assistant at Jobayer Group Career. Your job is to reach out to potential and existing members with personalized, persuasive messages.

## PRODUCT CATALOG
### Membership Plans
1. Standard (Free): Basic training, community access, 10% commission, weekly resources. Min withdrawal: 500 TK (10% fee).
2. Premium (1,500 TK one-time): Unlimited premium training, 0% withdrawal tax, 25% commission, priority support, contests, geometric target plan, team bonuses.
3. VIP (5,000 TK one-time): Personal mentor, VIP sessions, exclusive group, 35% commission, priority withdrawal (12-24h), monthly 1-on-1 strategy.

### Income Programs
- Direct Affiliate: 10-35% per referral
- Team Bonus: 3 members=500 TK, 10=2,000 TK, 25=5,000 TK, 50=15,000 TK
- Geometric Target Plan: Day1=100 TK, doubles daily. Complete 10 days=earn 153,450 TK
- Contests: Daily 200 TK, Weekly 1,000 TK, Monthly Grand 10,000 TK

### Success Stories
- Rahim: Joined Standard, upgraded to Premium, built team of 12, earning 8,000-12,000 TK/month
- Fatima: Homemaker turned earner, built team of 45+, completed 3 GTPs (earned 460,000 TK), now earning 25,000+ TK/month passive

## GUIDELINES
- Be warm, friendly, and professional
- Reference their specific situation if known
- Never sound like a generic sales pitch
- No emojis
- Keep messages concise (2-4 sentences)
- Always include a clear next step or question
- Output ONLY the message text, nothing else`;

async function generateProactiveMessage(phone: string, contextType: string, name: string): Promise<string> {
  try {
    const profile = await getOrCreateProfile(phone);
    const lang = detectLanguage("");
    const contextInfo = profile?.total_chats
      ? `Previous chats: ${profile.total_chats}.`
      : "New lead - no previous interaction.";

    let contactIntel = "";
    try { contactIntel = await getContactIntelligence(phone); } catch {}

    const baseInfo = contactIntel
      ? `KNOWN CONTACT INFO:\n${contactIntel}\n\n`
      : "";

    const contextPrompt = contextType === "new_lead"
      ? `${baseInfo}This is a NEW LEAD who has never been contacted. Name: ${name}. ${contextInfo} Send a warm welcome message introducing Jobayer Group Career's value proposition. Focus on income opportunity and free registration.`
      : contextType === "seen_no_reply"
        ? `${baseInfo}This lead SAW our message but didn't reply. Name: ${name}. ${contextInfo} Send a friendly follow-up that references the previous conversation and offers a different angle/value proposition.`
        : contextType === "stale"
          ? `${baseInfo}This contact has been INACTIVE for over 48 hours. Name: ${name}. ${contextInfo} Send a re-engagement message with a fresh perspective - share a success story or new opportunity angle. Focus on what they're missing out on.`
          : `${baseInfo}Send a general proactive message to ${name}. ${contextInfo} Be warm and value-focused.`;

    const result = await callAI(
      {
        messages: [
          { role: "system", content: PROACTIVE_SYSTEM_PROMPT },
          { role: "user", content: contextPrompt },
        ],
        temperature: 0.7,
      },
      150, "meta-llama/llama-3.3-70b-instruct:free", "openrouter"
    );
    return result.text || getFallbackMessage(name, contextType, lang);
  } catch {
    return getFallbackMessage(name, contextType, "bn");
  }
}

function getFallbackMessage(name: string, type: string, lang: string): string {
  if (type === "new_lead") {
    return lang === "en"
      ? `Assalamu Alaikum ${name}! I'm reaching out from Jobayer Group Career. We help people build sustainable online income through skill development and team building. Best part? Registration is completely free. Would you like to know more?`
      : `আসসালামু আলাইকুম ${name}! আমি Jobayer Group Career থেকে বলছি। আমরা মানুষকে স্কিল ডেভেলপমেন্ট এবং টিম বিল্ডিংয়ের মাধ্যমে অনলাইনে স্থায়ী আয় গড়তে সাহায্য করি। সবচেয়ে ভালো দিক? রেজিস্ট্রেশন সম্পূর্ণ ফ্রি। আরও জানতে চান?`;
  }
  if (type === "seen_no_reply") {
    return lang === "en"
      ? `${name}, I noticed you saw my previous message. I understand you're busy! Just wanted to share that our Premium members earn up to 25% commission and have 0% withdrawal tax. Worth a 5-minute look?`
      : `${name}, আমি দেখলাম আপনি আগের মেসেজটি দেখেছেন। বুঝতে পারছি আপনি ব্যস্ত! শুধু জানাতে চাই আমাদের প্রিমিয়াম মেম্বাররা ২৫% পর্যন্ত কমিশন পান এবং ০% withdrawal ট্যাক্স দেন। ৫ মিনিট সময় নিয়ে দেখবেন?`;
  }
  return lang === "en"
    ? `Assalamu Alaikum ${name}! It's been a while. I wanted to share an inspiring story - one of our members, Fatima, a homemaker from Chittagong, now earns 25,000+ TK monthly passive income with us. You could be next! Want to know how?`
    : `আসসালামু আলাইকুম ${name}! অনেক দিন পরে মনে করিয়ে দিচ্ছি। আমাদের একজন সদস্য ফাতিমা, চট্টগ্রামের একজন গৃহিণী, এখন আমাদের সাথে মাসে ২৫,০০০+ টাকা প্যাসিভ আয় করেন। আপনিও পারেন! কীভাবে জানতে চান?`;
}

// Bangladesh time (UTC+6) send window: 8AM - 10PM
function isWithinSendWindow(): boolean {
  try {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const bdHour = (utcHour + 6) % 24;
    return bdHour >= 8 && bdHour < 22;
  } catch { return true; }
}

async function hasHardObjection(phone: string, env: any): Promise<boolean> {
  try {
    const rows = await query<{ value: string }>(
      env,
      "SELECT value FROM agent_memory WHERE phone = ? AND agent_id = '_profile' AND key = 'objections'",
      [phone]
    );
    if (rows.length === 0) return false;
    const objections = rows[0].value.toLowerCase();
    const hardNos = /(don't contact|stop|block|never|not interested|না বলেছি|থামান|বিরক্ত)/i;
    return hardNos.test(objections);
  } catch { return false; }
}

export async function GET(request: NextRequest) {
  try {
    const auth = request.nextUrl.searchParams.get("token");
    if (auth !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only send during reasonable hours (8AM-10PM BD time)
    if (!isWithinSendWindow()) {
      return NextResponse.json({ skipped: "outside_send_window", window: "8AM-10PM BD time" });
    }

    const env = await getDB();

    const newLeads = await query<any>(
      env,
      `SELECT p.phone, COALESCE(p.name_guess, 'Valued Customer') as name
       FROM ai_phone_profiles p
       LEFT JOIN proactive_followups f ON p.phone = f.phone
       WHERE f.phone IS NULL
         AND p.total_chats <= 1
         AND p.created_at < datetime('now', '-1 hour')
       ORDER BY p.created_at ASC
       LIMIT 5`
    );

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

    const staleContacts = await query<any>(
      env,
      `SELECT p.phone, COALESCE(p.name_guess, 'Valued Customer') as name
       FROM ai_phone_profiles p
       LEFT JOIN proactive_followups f ON p.phone = f.phone
       WHERE (f.phone IS NULL OR f.followup_count < 3)
         AND p.total_chats > 1
         AND p.updated_at < datetime('now', '-48 hours')
         AND p.updated_at > datetime('now', '-7 days')
       ORDER BY p.updated_at ASC
       LIMIT 5`
    );

    let sent = 0;
    let errors = 0;
    let generated = 0;
    let skipped_by_objection = 0;

    for (const lead of newLeads) {
      try {
        if (await hasHardObjection(lead.phone, env)) { skipped_by_objection++; continue; }
        const text = await generateProactiveMessage(lead.phone, "new_lead", lead.name || "Valued Customer");
        generated++;
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
      } catch (e) {
        errors++;
        console.error("[Proactive] new lead error:", (e as Error)?.message);
      }
    }

    for (const lead of seenNoReply) {
      try {
        if (await hasHardObjection(lead.phone, env)) { skipped_by_objection++; continue; }
        const text = await generateProactiveMessage(lead.phone, "seen_no_reply", lead.phone);
        generated++;
        const result = await sendMessage(lead.phone, text);
        if (result.success) {
          sent++;
          await execute(env,
            "UPDATE proactive_followups SET last_outbound_at = datetime('now'), followup_count = followup_count + 1, updated_at = datetime('now') WHERE phone = ?",
            [lead.phone]
          );
          await execute(env,
            "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'sent', 'proactive_followup', datetime('now'))",
            [lead.phone, text]
          );
        }
      } catch (e) {
        errors++;
        console.error("[Proactive] seen_no_reply error:", (e as Error)?.message);
      }
    }

    for (const lead of staleContacts) {
      try {
        if (await hasHardObjection(lead.phone, env)) { skipped_by_objection++; continue; }
        const text = await generateProactiveMessage(lead.phone, "stale", lead.name || "Valued Customer");
        generated++;
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
            "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'sent', 'proactive_reengagement', datetime('now'))",
            [lead.phone, text]
          );
        }
      } catch (e) {
        errors++;
        console.error("[Proactive] stale error:", (e as Error)?.message);
      }
    }

    return NextResponse.json({
      scanned: { newLeads: newLeads.length, seenNoReply: seenNoReply.length, staleContacts: staleContacts.length },
      generated, sent, errors, skipped_by_objection,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
