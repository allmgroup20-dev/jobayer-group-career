import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { query, execute } from "@/lib/db/queries";
import {
  processMessage, detectLanguage, detectMood, detectDialect,
  detectReligion, analyzePainPoints, analyzeInterests,
  getOrCreateProfile, updateProfileFromChat, updateProfileScore,
  saveMessage, saveSkill, extractKeywords, fastLane,
  isWorkerPhone, getWorkerByPhone, getWorkerPremiumStatus,
  getOrCreateLead, updateLeadStatus,
} from "@/lib/ai";
import { recordPlatformActivity } from "@/lib/platform-router";
import { logEmotion } from "@/lib/ai/emotion-tracker";
import { storeContactInsight, extractInsightsFromText } from "@/lib/ai/contact-intelligence";
import { scoreQuality, QUALITY_THRESHOLD } from "@/lib/ai/quality-gate";
import type { MessageCtx } from "@/lib/ai/brain/types";

function generateSessionId(): string {
  return "web_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function getOrCreateSession(env: any, sessionId: string, phone?: string): Promise<string> {
  let sid = sessionId;
  if (!sid || sid === "null" || sid === "undefined") {
    sid = generateSessionId();
  }
  if (phone) {
    const existing = await query<any>(env,
      "SELECT session_id FROM web_chat_sessions WHERE phone = ? LIMIT 1", [phone]
    );
    if (existing.length > 0) return existing[0].session_id;
    await execute(env,
      "INSERT OR REPLACE INTO web_chat_sessions (session_id, phone, created_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
      [sid, phone]
    );
  } else {
    await execute(env,
      "INSERT OR IGNORE INTO web_chat_sessions (session_id, created_at, updated_at) VALUES (?, datetime('now'), datetime('now'))",
      [sid]
    );
  }
  return sid;
}

const WEBHOOK_TIMEOUT = 45000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;
    let { text, sessionId, phone, name } = body as { text?: string; sessionId?: string; phone?: string; name?: string };

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }
    text = text.trim();

    const env = await getDB();

    // Session management
    sessionId = await getOrCreateSession(env, sessionId || "", phone);

    // If no phone but has session, check if session has a phone
    if (!phone) {
      const sess = await query<any>(env,
        "SELECT phone FROM web_chat_sessions WHERE session_id = ?", [sessionId]
      );
      if (sess.length > 0 && sess[0].phone) {
        phone = sess[0].phone;
      }
    }

    // For anonymous users, generate a pseudo-phone from session
    const effectivePhone = phone || `web_anon_${sessionId.slice(0, 20)}`;

    // Detect role
    const isWorker = phone ? await isWorkerPhone(phone) : false;
    const role = isWorker ? "worker" : "customer";

    // Get or create profile
    const profile = await getOrCreateProfile(effectivePhone);
    const lang = detectLanguage(text);
    const mood = detectMood(text);
    const dialect = detectDialect(text);
    const religion = detectReligion(text);
    const painPoints = analyzePainPoints(text);
    const interests = analyzeInterests(text);

    await updateProfileFromChat(effectivePhone, text);
    try { logEmotion(effectivePhone, mood); } catch {}

    // Priority scoring
    const score = calculateSimpleScore(profile);
    if (score > 0) await updateProfileScore(effectivePhone, score);

    const totalMessages = (profile?.total_chats || 0) + 1;
    let funnelStage: string | undefined;
    if (role === "customer") {
      if (totalMessages <= 4) funnelStage = "1-4";
      else if (totalMessages <= 6) funnelStage = "5-6";
      else if (totalMessages <= 8) funnelStage = "7-8";
      else if (totalMessages <= 10) funnelStage = "9-10";
      else funnelStage = "11-12";
    }

    const isPremium = phone ? await getWorkerPremiumStatus(phone) : false;

    // Track funnel from profile
    await getOrCreateLead(effectivePhone);

    const brainCtx: MessageCtx = {
      phone: effectivePhone, text, name, role,
      language: lang, mood, dialect, religion,
      funnelStage, totalChats: profile?.total_chats || 0,
      painPoints, interests, isWorker, isPremium,
    };

    // Fast Lane
    const fastHit = fastLane(text, lang as "en" | "bn");
    if (fastHit) {
      await saveMessage(effectivePhone, "user", text, { language: lang, painPoints, interests, source: "web" });
      await saveMessage(effectivePhone, "assistant", fastHit.reply, { language: lang, source: "web" });
      await recordPlatformActivity(effectivePhone, "web");
      return NextResponse.json({
        ok: true, fastLane: fastHit.lane, reply: fastHit.reply,
        sessionId, phone, effectivePhone,
      });
    }

    const brainResult = await Promise.race([
      processMessage(brainCtx),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Brain processing timed out")), WEBHOOK_TIMEOUT)
      ),
    ]).catch(async () => {
      const isBuyIntent = /(buy|purchase|join|register|কিনতে|জয়েন|রেজিস্টার|দাম|price|cost)/i.test(text);
      const isComplaint = /(problem|complaint|fraud|scam|cheat|ভুয়া|প্রতারনা|সমস্যা|অভিযোগ)/i.test(text);
      if (isBuyIntent) {
        return {
          text: lang === "en"
            ? `Great to hear from you! I'd love to help you get started with Jobayer Group Career. We have Standard (free), Premium (1,500 TK), and VIP (5,000 TK) plans. Which one interests you? I can explain the benefits of each.`
            : `আপনার আগ্রহ দেখে ভালো লাগলো! Jobayer Group Career-এ শুরু করতে আমরা Standard (ফ্রি), Premium (১,৫০০ টাকা), এবং VIP (৫,০০০ টাকা) প্ল্যান অফার করি। কোনটি আপনার আগ্রহের? আমি প্রতিটির সুবিধা বিস্তারিত বলতে পারি।`,
          model: "smart-fallback" as const, tokens: 0, agentsUsed: [], departmentsUsed: [], department: "sales" as any, intent: "general" as any, ms: WEBHOOK_TIMEOUT,
        };
      }
      if (isComplaint) {
        return {
          text: lang === "en"
            ? `I understand you're frustrated. Please tell me what happened - I'm here to listen and help resolve any issue you're facing. Your satisfaction is our priority.`
            : `আমি বুঝতে পারছি আপনি frustrated। দয়া করে বলুন কী হয়েছে - আমি শুনতে এবং আপনার সমস্যা সমাধান করতে এখানে আছি। আপনার সন্তুষ্টি আমাদের অগ্রাধিকার।`,
          model: "smart-fallback" as const, tokens: 0, agentsUsed: [], departmentsUsed: [], department: "customer_experience" as any, intent: "general" as any, ms: WEBHOOK_TIMEOUT,
        };
      }
      const fallbackText = lang === "en"
        ? `I appreciate your message! I'm here to help you explore how Jobayer Group Career can create new income opportunities for you. Would you like to know about our training programs, membership plans, or commission structure?`
        : `আপনার মেসেজের জন্য ধন্যবাদ! আমি আপনাকে সাহায্য করতে এখানে আছি। Jobayer Group Career কীভাবে আপনার জন্য নতুন আয়ের সুযোগ তৈরি করতে পারে তা জানতে চান? আমাদের ট্রেনিং প্রোগ্রাম, মেম্বারশিপ প্ল্যান, বা কমিশন স্ট্রাকচার সম্পর্কে জানতে চান?`;
      return { text: fallbackText, model: "smart-fallback" as const, tokens: 0, agentsUsed: [], departmentsUsed: [], department: "customer_experience" as any, intent: "general" as any, ms: WEBHOOK_TIMEOUT };
    });
    let reply = brainResult.text;

    if (!reply || reply.trim().length === 0) {
      reply = lang === "en"
        ? `I understand you might not be ready yet. But let me ask you this — what if you're missing out on something that could truly change your life? Many of our members felt the same way at first. Let me share just one quick story...`
        : `আমি বুঝতে পারছি আপনি এখনই আগ্রহী নন। কিন্তু একটা কথা বলি — যদি আপনি সত্যিই এমন কিছু মিস করছেন যা আপনার জীবন বদলে দিতে পারে? আমাদের অনেক মেম্বার প্রথমে আপনার মতই অনুভব করেছিলেন। শুধু একটা ছোট গল্প বলি...`;
    }

    // Store contact intelligence
    try {
      const insights = extractInsightsFromText(text, brainResult.intent || "general");
      await storeContactInsight(effectivePhone, {
        name: name || undefined, language: lang,
        intent: brainResult.intent || "general", mood, ...insights,
      });
    } catch {}

    // Auto-save to skills
    try {
      const keywords = extractKeywords(text);
      const replyTrimmed = reply.trim();
      const q = scoreQuality(text, replyTrimmed);
      if (q.score >= QUALITY_THRESHOLD && keywords.length >= 2) {
        await saveSkill(keywords, text, replyTrimmed, "auto_learned");
      }
    } catch {}

    await recordPlatformActivity(effectivePhone, "web");

    // Save conversation
    await saveMessage(effectivePhone, "user", text, { language: lang, painPoints, interests });
    await saveMessage(effectivePhone, "assistant", reply, { language: lang });

    if (phone) await updateLeadStatus(phone, "replied");

    return NextResponse.json({
      ok: true, reply, sessionId, phone, effectivePhone,
      language: lang, mood, dialect, role,
      model: brainResult.model,
      tokens: brainResult.tokens,
      agentsUsed: brainResult.agentsUsed,
      department: brainResult.department,
    });
  } catch (error) {
    console.error("Chat webhook error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Chat webhook failed",
    }, { status: 500 });
  }
}

function calculateSimpleScore(profile: any): number {
  let score = 0;
  if (profile?.gender_guess === "female") score += 5;
  if (profile?.age_group_guess === "18-25") score += 3;
  else if (profile?.age_group_guess === "26-35") score += 2;
  if (profile?.sector) score += 2;
  return score;
}
