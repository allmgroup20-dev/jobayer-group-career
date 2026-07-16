import { NextRequest, NextResponse } from "next/server";
import { updateContactStatus, createContact } from "@/lib/whatsapp/contacts";
import { sendMessage } from "@/lib/whatsapp/sender";
import { calculatePriorityScore } from "@/lib/whatsapp/numbers";
import { execute } from "@/lib/db/queries";
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
  findSkill,
  saveSkill,
  extractKeywords,
  isWorkerPhone,
  getWorkerByPhone,
  getOrCreateLead,
  updateLeadStatus,
} from "@/lib/ai";
import { recordPlatformActivity } from "@/lib/platform-router";
import { linkWorkerToAgent, saveAgentKnowledge } from "@/lib/ai/brain/employee-link";
import type { MessageCtx } from "@/lib/ai/brain/types";

function parseIncomingMessage(body: any): { phone: string; text: string; name?: string } | null {
  const entry = body?.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const messages = value?.messages;
  if (messages?.length) {
    const msg = messages[0];
    if (msg.type === "text" && msg.from && msg.text?.body) {
      return { phone: msg.from, text: msg.text.body, name: value?.contacts?.[0]?.profile?.name };
    }
  }
  const phone = body.phone || body.from;
  const text = body.text || body.message;
  if (phone && text) {
    return { phone, text, name: body.name };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>;

    const parsed = parseIncomingMessage(body);
    if (!parsed) {
      return NextResponse.json({ received: false });
    }

    const { phone, text, name } = parsed;

    const env = await getDB();
    await execute(env,
      "INSERT INTO wa_logs (phone, message, direction, status, message_type, created_at) VALUES (?, ?, 'inbound', 'received', 'text', datetime('now'))",
      [phone, text]
    );

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
    const score = calculatePriorityScore({
      gender_guess: profile?.gender_guess,
      age_group_guess: profile?.age_group_guess,
      sector: profile?.sector,
    });
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

    // Use Premium Employee Brain
    let reply: string | null = null;

    const cachedSkill = await findSkill(text);
    if (cachedSkill) {
      reply = cachedSkill;
    } else {
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
      };

      const brainResult = await processMessage(brainCtx);
      reply = brainResult.text;

      // Employee-agent link: save knowledge for workers
      if (isWorker && brainResult.agentsUsed.length > 0) {
        const agentName = brainResult.agentsUsed[0];
        await linkWorkerToAgent(env.DB, phone, agentName, agentName);
        await saveAgentKnowledge(env.DB, phone, agentName, agentName, reply.slice(0, 1000));
      }
    }

    // Ensure reply is never empty — fallback if brain returns nothing
    if (!reply || reply.trim().length === 0) {
      console.warn(`[WhatsApp Webhook] Brain returned empty reply for ${phone} — using fallback`);
      reply = "ধন্যবাদ আপনার মেসেজের জন্য। আমি আপনার সহায়তার জন্য প্রস্তুত আছি। বিস্তারিত জানাতে পারেন?";
    }

    // Auto-save to skills — so brain learns from this Q&A
    try {
      const keywords = extractKeywords(text);
      if (keywords.length >= 2 && reply.length > 10) {
        await saveSkill(keywords, text, reply, "auto_learned");
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
