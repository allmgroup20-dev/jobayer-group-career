import { NextRequest, NextResponse } from "next/server";
import { updateContactStatus, createContact } from "@/lib/whatsapp/contacts";
import { sendMessage, enqueueMessage } from "@/lib/whatsapp";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import {
  processMessage,
  analyzePainPoints,
  analyzeInterests,
  detectLanguage,
  detectMood,
  detectDialect,
  detectReligion,
  getOrCreateProfile,
  updateProfileFromChat,
  updateProfileScore,
  saveMessage,
  saveSkill,
  extractKeywords,
  isWorkerPhone,
  getWorkerByPhone,
  getWorkerPremiumStatus,
  getOrCreateLead,
  updateLeadStatus,
} from "@/lib/ai";
import { recordPlatformActivity } from "@/lib/platform-router";
import { linkWorkerToAgent, saveAgentKnowledge } from "@/lib/ai/brain/employee-link";
import type { MessageCtx } from "@/lib/ai/brain/types";
import type { MediaResult } from "@/lib/whatsapp/media";
import { storeContactInsight, extractInsightsFromText } from "@/lib/ai/contact-intelligence";

// ── In-memory follow-up tracker (persisted via DB) ──
const SEEN_FOLLOWUP_DELAY_MS = 120_000; // 2 min after "read" without reply
const PROACTIVE_INTERVAL_MS = 300_000;  // 5 min between proactive messages

async function handleStatusUpdate(body: any, env: any): Promise<boolean> {
  try {
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const statuses = value?.statuses;
    if (!statuses?.length) return false;

    const status = statuses[0];
    const msgId = status.id;
    const phone = status.recipient_id;
    const statusType = status.status; // "sent" | "delivered" | "read"
    const timestamp = status.timestamp;

    // Log status in wa_logs
    await execute(env,
      "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'status', ?, 'status', datetime('now'))",
      [phone, `status=${statusType} msgId=${msgId}`, statusType]
    );

    // If "read" (customer saw the message), schedule a follow-up
    if (statusType === "read") {
      // Store "seen" event so CRON can pick it up
      await execute(env,
        `INSERT INTO proactive_followups (phone, last_seen_at, last_outbound_at, followup_count, created_at)
         VALUES (?, datetime('now'), datetime('now'), 0, datetime('now'))
         ON CONFLICT(phone) DO UPDATE SET last_seen_at = datetime('now'), followup_count = followup_count + 1, updated_at = datetime('now')`,
        [phone]
      );
    }

    return true;
  } catch { return false; }
}

async function sendProactiveFollowup(phone: string, env: any): Promise<void> {
  try {
    const { processMessage } = await import("@/lib/ai");
    const { getOrCreateProfile, detectLanguage } = await import("@/lib/ai");

    const profile = await getOrCreateProfile(phone);
    const lang = detectLanguage(""); // default to Bengali
    const brainCtx: MessageCtx = {
      phone, text: "[Proactive Follow-up]",
      name: profile?.name_guess || undefined, role: "customer",
      language: lang, mood: "curious",
      totalChats: (profile?.total_chats || 0) + 1,
      painPoints: [], interests: [],
      isWorker: false, isPremium: false,
    };

    const brainResult = await processMessage(brainCtx);
    const reply = brainResult.text || (lang === "bn"
      ? `আপনি কি আমাদের প্রোগ্রাম সম্পর্কে আরও জানতে আগ্রহী? আমি আপনার জন্য কিছু গুরুত্বপূর্ণ তথ্য রাখছি...`
      : `Are you interested in learning more about our program? I have some important information for you...`);

    const { sendMessage } = await import("@/lib/whatsapp");
    await sendMessage(phone, reply);
    await execute(env,
      "UPDATE proactive_followups SET last_outbound_at = datetime('now'), followup_count = followup_count + 1, updated_at = datetime('now') WHERE phone = ?",
      [phone]
    );
    await execute(env,
      "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'outbound', 'sent', 'proactive_followup', datetime('now'))",
      [phone, reply]
    );
  } catch (e) {
    console.error(`[Proactive] Follow-up failed for ${phone}:`, (e as Error)?.message);
  }
}

function parseIncomingMessage(body: any): { phone: string; text: string; name?: string; mediaId?: string; mediaType?: string; mimeType?: string; msgId?: string } | null {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const messages = value?.messages;
  if (messages?.length) {
    const msg = messages[0];
    if (msg.from) {
      const name = value?.contacts?.[0]?.profile?.name;
      const msgId = msg.id;
      // Voice message
      if (msg.type === "voice" || msg.type === "audio") {
        const id = msg.voice?.id || msg.audio?.id;
        if (id) return { phone: msg.from, text: "[Voice Message]", name, mediaId: id, mediaType: "voice", mimeType: msg.voice?.mime_type || msg.audio?.mime_type || "audio/ogg", msgId };
      }
      // Image message
      if (msg.type === "image") {
        const id = msg.image?.id;
        if (id) return { phone: msg.from, text: "[Image]", name, mediaId: id, mediaType: "image", mimeType: msg.image?.mime_type || "image/jpeg", msgId };
      }
      // Text message
      if (msg.type === "text" && msg.text?.body) {
        return { phone: msg.from, text: msg.text.body, name, msgId };
      }
    }
  }
  const phone = body.phone || body.from;
  const text = body.text || body.message;
  if (phone && text) {
    return { phone, text, name: body.name };
  }
  return null;
}

const WEBHOOK_TIMEOUT = 45000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;

    // ── Handle status updates (sent/delivered/read) BEFORE messages ──
    const env = await getDB();
    const statusHandled = await handleStatusUpdate(body, env);
    if (statusHandled) {
      return NextResponse.json({ received: true, type: "status" });
    }

    const parsed = parseIncomingMessage(body);
    if (!parsed) {
      return NextResponse.json({ received: false });
    }

    let { phone, text, name, mediaId, mediaType, mimeType, msgId } = parsed;

    // Deduplication: skip duplicate webhook deliveries within last 30s
    if (msgId) {
      try {
        const existing = await query<any>(env,
          "SELECT id FROM wa_logs WHERE phone = ? AND message = ? AND direction = 'inbound' AND created_at > datetime('now', '-30 seconds') LIMIT 1",
          [phone, text]
        );
        if (existing.length > 0) {
          return NextResponse.json({ received: true, deduplicated: true });
        }
      } catch {}
    }

    // ── Process media (voice/image) if present ──
    let mediaDescription = "";
    let mediaLogText = text;
    if (mediaId && mediaType === "voice") {
      const { downloadMedia, transcribeAudio } = await import("@/lib/whatsapp/media");
      const media = await downloadMedia(mediaId);
      if (media) {
        const sttResult = await transcribeAudio(media.buffer, env);
        if (sttResult) {
          text = `[Voice: ${sttResult}]`;
          mediaDescription = `Customer sent a voice message. Transcription: "${sttResult}"`;
          mediaLogText = sttResult;
        }
      }
      await execute(env,
        "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'inbound', 'received', 'voice', datetime('now'))",
        [phone, mediaLogText]
      );
    } else if (mediaId && mediaType === "image") {
      const { downloadMedia, analyzeImage } = await import("@/lib/whatsapp/media");
      const media = await downloadMedia(mediaId);
      if (media) {
        const imageDesc = await analyzeImage(media.buffer, mimeType || "image/jpeg", env);
        if (imageDesc) {
          text = `[Image: ${imageDesc.slice(0, 200)}]`;
          mediaDescription = `Customer sent an image. Description: "${imageDesc}"`;
          mediaLogText = imageDesc.slice(0, 100);
        }
      }
      await execute(env,
        "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'inbound', 'received', 'image', datetime('now'))",
        [phone, mediaLogText]
      );
    } else {
      await execute(env,
        "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'inbound', 'received', 'text', datetime('now'))",
        [phone, text]
      );
    }

    // Update or create contact
    if (name) {
      await createContact(phone, { name, source: "whatsapp_inbound" });
    } else {
      await createContact(phone, { source: "whatsapp_inbound" });
    }

    // Detect role: is this a worker or a customer?
    const isWorker = await isWorkerPhone(phone);
    const role = isWorker ? "worker" : "customer";

    // Get or create lead record
    await getOrCreateLead(phone);

    // Detect language, mood, dialect, religion
    const profile = await getOrCreateProfile(phone);
    const lang = detectLanguage(text);
    const mood = detectMood(text);
    const dialect = detectDialect(text);
    const religion = detectReligion(text);
    const painPoints = analyzePainPoints(text);
    const interests = analyzeInterests(text);

    await updateProfileFromChat(phone, text);

    // Priority scoring
    const score = calculateSimpleScore(profile);
    if (score > 0) {
      await updateProfileScore(phone, score);
    }

    // Track funnel stage based on conversation count
    const totalMessages = (profile?.total_chats || 0) + 1;
    let funnelStage: string | undefined;
    if (role === "customer") {
      if (totalMessages <= 4) funnelStage = "1-4";
      else if (totalMessages <= 6) funnelStage = "5-6";
      else if (totalMessages <= 8) funnelStage = "7-8";
      else if (totalMessages <= 10) funnelStage = "9-10";
      else funnelStage = "11-12";
    }

    const isPremium = isWorker ? await getWorkerPremiumStatus(phone) : false;
    const brainCtx: MessageCtx = {
      phone,
      text,
      name,
      role,
      language: lang,
      mood,
      dialect,
      religion,
      funnelStage,
      totalChats: profile?.total_chats || 0,
      painPoints,
      interests,
      isWorker,
      isPremium,
    };

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

    if (isWorker && brainResult.agentsUsed.length > 0) {
      const agentName = brainResult.agentsUsed[0];
      await linkWorkerToAgent(env.DB, phone, agentName, agentName);
      await saveAgentKnowledge(env.DB, phone, agentName, agentName, reply.slice(0, 1000));
    }

    if (!reply || reply.trim().length === 0) {
      console.warn(`[WhatsApp Webhook] Brain returned empty reply for ${phone} — using persistent fallback`);
      reply = lang === "en"
        ? `I understand you might not be ready yet. But let me ask you this — what if you're missing out on something that could truly change your life? Many of our members felt the same way at first. Let me share just one quick story...`
        : `আমি বুঝতে পারছি আপনি এখনই আগ্রহী নন। কিন্তু একটা কথা বলি — যদি আপনি সত্যিই এমন কিছু মিস করছেন যা আপনার জীবন বদলে দিতে পারে? আমাদের অনেক মেম্বার প্রথমে আপনার মতই অনুভব করেছিলেন। শুধু একটা ছোট গল্প বলি...`;
    }

    // Store contact intelligence
    try {
      const insights = extractInsightsFromText(text, brainResult.intent || "general");
      await storeContactInsight(phone, {
        name: name || undefined,
        language: lang,
        intent: brainResult.intent || "general",
        mood,
        ...insights,
      });
    } catch {}

    // Auto-save to skills — so brain learns from this Q&A (with validation)
    try {
      const keywords = extractKeywords(text);
      const replyTrimmed = reply.trim();
      const systemMarkers = /(We need to respond|You are (a|an)|Respond as|your task|Review criteria|Keep responses|NEVER|IMPORTANT|test answer|debug|System instructions)/i;
      if (
        keywords.length >= 2 &&
        replyTrimmed.length > 10 &&
        replyTrimmed.length < 2000 &&
        !systemMarkers.test(replyTrimmed) &&
        !replyTrimmed.startsWith("[") &&
        !replyTrimmed.startsWith("{")
      ) {
        await saveSkill(keywords, text, replyTrimmed, "auto_learned");
      }
    } catch (e) {
      console.error("[Skills] Failed to auto-save:", (e as Error)?.message);
    }

    // Record platform preference — user replied on WhatsApp
    await recordPlatformActivity(phone, "whatsapp");

    // Save conversation
    await saveMessage(phone, "user", text, {
      language: lang,
      painPoints,
      interests,
    });

    await saveMessage(phone, "assistant", reply, {
      language: lang,
    });

    // Update lead status
    await updateLeadStatus(phone, "replied");

    const fromBrowser = body.fromBrowser === true;

    if (!fromBrowser) {
      const sendResult = await sendMessage(phone, reply);
      if (!sendResult.success) {
        console.error(`[WhatsApp Webhook] Reply send failed for ${phone}: ${sendResult.error}`);
      } else {
        await updateContactStatus(phone, "replied", reply);
      }
      return NextResponse.json({
        received: true,
        replied: sendResult.success,
        messageId: sendResult.messageId,
        phone, text: reply,
      });
    }

    // fromBrowser = relay (Baileys) mode → also enqueue as pending_web for reliability
    await enqueueMessage(phone, reply, 2, {
      accountId: "web_main",
      messageType: "reply",
      viaRelay: true,
    });
    await updateContactStatus(phone, "replied", reply);
    return NextResponse.json({
      received: true,
      replied: true,
      phone, reply,
      mood, dialect, role,
    });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Webhook failed",
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

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe") {
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    }
    console.error(`[WhatsApp Webhook] Verify token mismatch: received "${token}", expected "${process.env.WHATSAPP_VERIFY_TOKEN}"`);
  }
  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}
