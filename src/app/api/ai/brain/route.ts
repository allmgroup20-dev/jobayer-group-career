import { NextRequest, NextResponse } from "next/server";
import {
  processMessage,
  detectLanguage, detectMood, detectDialect, detectReligion,
  analyzePainPoints, analyzeInterests,
  getOrCreateProfile, isWorkerPhone, getWorkerPremiumStatus,
  getOrCreateLead,
} from "@/lib/ai";
import type { MessageCtx } from "@/lib/ai/brain/types";
import { execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCache } from "@/lib/ai/brain/cache";
import { checkRateLimit } from "@/lib/ai/brain/rate-limit";
import { recordFailure, recordSuccess, isCircuitOpen } from "@/lib/ai/brain/circuit-breaker";
import { getGracefulResponse } from "@/lib/ai/brain/graceful-fallback";

let dbPromise: Promise<any> | null = null;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  // Lazy-init DB connection (reused across calls)
  if (!dbPromise) dbPromise = getDB().catch(() => null);

  try {
    const body = await request.json() as {
      phone: string;
      text: string;
      name?: string;
      role?: string;
    };

    if (!body.phone || !body.text) {
      return NextResponse.json({ error: "phone and text required" }, { status: 400 });
    }

    const { phone, text, name } = body;

    // ── Rate limiting ──
    const rateCheck = checkRateLimit(phone);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        success: false,
        reply: "You are sending too many requests. Please wait a moment and try again.",
        rateLimited: true,
        retryAfterMs: rateCheck.resetMs,
      }, {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)) },
      });
    }

    // ── Circuit breaker check ──
    if (isCircuitOpen("brain_ai")) {
      const lang = detectLanguage(text);
      const intent = text.includes("দাম") || text.includes("price") ? "purchase"
        : text.includes("অভিযোগ") || text.includes("complaint") ? "complaint"
        : text.includes("সাহায্য") || text.includes("help") ? "support"
        : "general";
      return NextResponse.json({
        success: true,
        reply: getGracefulResponse(intent, {
          name: name || "Valued Customer",
          language: lang,
        }),
        model: "graceful_fallback",
        tokens: 0,
        processingMs: 0,
        circuitOpen: true,
      });
    }

    const isWorker = await isWorkerPhone(phone);
    const isPremium = isWorker ? await getWorkerPremiumStatus(phone) : false;
    const role = body.role === "admin" ? "admin" : isWorker ? "worker" : "customer";

    const profile = await getOrCreateProfile(phone);
    const lang = detectLanguage(text);
    const mood = detectMood(text);
    const dialect = detectDialect(text);
    const religion = detectReligion(text);
    const painPoints = analyzePainPoints(text);
    const interests = analyzeInterests(text);

    await getOrCreateLead(phone);

    const ctx: MessageCtx = {
      phone,
      text,
      name: name || profile?.name_guess || undefined,
      role,
      language: lang,
      mood,
      dialect,
      religion,
      totalChats: profile?.total_chats || 0,
      painPoints,
      interests,
      isWorker,
      isPremium,
    };

    // ── Check cache — skip processing if cached ──
    const cached = getCached(text, lang, mood);
    let result: Awaited<ReturnType<typeof processMessage>> = {
      text: "", model: "pending", tokens: 0,
      agentsUsed: [], departmentsUsed: [],
      department: "customer_experience", intent: "general", ms: 0,
    };

    if (cached && cached.response.length > 10) {
      result = {
        text: cached.response,
        model: cached.model,
        tokens: cached.tokens,
        agentsUsed: cached.agentsUsed,
        departmentsUsed: cached.departmentsUsed as any,
        department: cached.department as any,
        intent: cached.intent as any,
        ms: 0,
        chainType: cached.chainType as any,
      };
    } else {
      try {
        result = await processMessage(ctx);
        recordSuccess("brain_ai");
      } catch (e) {
        recordFailure("brain_ai");
        const graceful = getGracefulResponse(result?.intent || "general", {
          name: name || "Valued Customer", language: lang,
        });
        result = {
          text: graceful, model: "graceful_fallback", tokens: 0,
          agentsUsed: [], departmentsUsed: [],
          department: "customer_experience", intent: "general", ms: Date.now() - startTime,
        };
      }
      setCache(text, lang, mood, {
        response: result.text, model: result.model, tokens: result.tokens,
        agentsUsed: result.agentsUsed, departmentsUsed: result.departmentsUsed,
        department: result.department, intent: result.intent,
        chainType: result.chainType || "single",
      });
    }

    // ── Log usage to D1 ──
    try {
      const db = dbPromise ? await dbPromise : await getDB();
      await execute(
        db,
        `INSERT INTO brain_usage (phone, text, intent, primary_department, departments_used, agents_used, chain_type, model_used, tokens_used, processing_ms, success) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          phone, text.slice(0, 500), result.intent,
          result.department, result.departmentsUsed?.join(",") || result.department,
          result.agentsUsed?.join(",") || "",
          result.chainType || "single", result.model, result.tokens,
          result.ms, 1,
        ],
      );
    } catch {}

    const headers: Record<string, string> = {
      "X-Processing-Ms": String(result.ms),
      "X-Model": result.model,
      "X-Intent": result.intent,
      "X-Queue-Time": String(Date.now() - startTime),
    };
    if (result.model === "graceful_fallback") {
      headers["X-Graceful"] = "1";
    }
    if (result.chainType) {
      headers["X-Chain-Type"] = result.chainType;
    }

    return NextResponse.json({
      success: true,
      reply: result.text,
      model: result.model,
      tokens: result.tokens,
      agentsUsed: result.agentsUsed,
      departmentsUsed: result.departmentsUsed,
      department: result.department,
      intent: result.intent,
      processingMs: result.ms,
      chainType: result.chainType,
      seniorReview: result.seniorReview,
    }, { headers });
  } catch (error) {
    console.error("Brain chat error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Brain chat failed",
    }, { status: 500 });
  }
}
