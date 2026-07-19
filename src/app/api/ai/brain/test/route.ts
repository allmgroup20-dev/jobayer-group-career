import { NextResponse } from "next/server";
import { processMessage } from "@/lib/ai/brain/orchestrator";
import { getCached, setCache } from "@/lib/ai/brain/cache";
import type { MessageCtx, BrainResult } from "@/lib/ai/brain/types";

const TEST_SCENARIOS: Array<{ label: string; text: string; role: string; expectedIntent?: string; expectedDept?: string }> = [
  { label: "greeting_bn", text: "আসসালামু আলাইকুম", role: "customer", expectedIntent: "greeting", expectedDept: "customer_experience" },
  { label: "product_price_bn", text: "আপনার প্রোডাক্টের দাম কত?", role: "customer", expectedIntent: "price_inquiry", expectedDept: "sales" },
  { label: "purchase_interest", text: "আমি একটা প্যাকেজ কিনতে চাই", role: "customer", expectedIntent: "purchase", expectedDept: "sales" },
  { label: "complaint_angry", text: "আমি খুবই অসন্তুষ্ট! আমার টাকা ফেরত দিন!", role: "customer", expectedIntent: "complaint", expectedDept: "psychology" },
  { label: "registration", text: "আমি জয়েন করতে চাই", role: "customer", expectedIntent: "registration", expectedDept: "member_success" },
  { label: "withdrawal", text: "আমার টাকা তুলতে চাই", role: "worker", expectedIntent: "withdrawal", expectedDept: "operations" },
  { label: "training", text: "আমাকে ট্রেনিং দিন প্লিজ", role: "worker", expectedIntent: "training", expectedDept: "member_success" },
  { label: "commission", text: "আমার কমিশন কত?", role: "worker", expectedIntent: "commission_inquiry", expectedDept: "member_success" },
  { label: "english_greeting", text: "Hello, I'm interested in your products", role: "customer", expectedIntent: "greeting", expectedDept: "customer_experience" },
  { label: "support", text: "আমার অর্ডারটা এখনো হাতే পাইনি", role: "customer", expectedIntent: "support", expectedDept: "customer_experience" },
];

export async function GET() {
  const results: Array<{
    label: string;
    text: string;
    passed: boolean;
    intent: string;
    department: string;
    expectedIntent?: string;
    expectedDept?: string;
    error?: string;
    ms: number;
    chainType?: string;
    agentsCount: number;
  }> = [];

  let passed = 0;
  let failed = 0;

  for (const scenario of TEST_SCENARIOS) {
    const start = Date.now();
    try {
      const ctx: MessageCtx = {
        phone: `test-${scenario.label}`,
        text: scenario.text,
        name: "Test User",
        role: scenario.role as any,
        language: /[আ-হ]/.test(scenario.text) ? "bn" : "en",
        mood: "neutral",
        totalChats: 0,
        painPoints: [],
        interests: [],
        isWorker: scenario.role === "worker",
        isPremium: false,
      };

      // Check cache first
      const cached = getCached(scenario.text, ctx.language, ctx.mood);
      let result: BrainResult;
      if (cached) {
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
        result = await processMessage(ctx);
        setCache(scenario.text, ctx.language, ctx.mood, {
          response: result.text, model: result.model, tokens: result.tokens,
          agentsUsed: result.agentsUsed, departmentsUsed: result.departmentsUsed,
          department: result.department, intent: result.intent, chainType: result.chainType || "single",
        });
      }

      const intentOk = scenario.expectedIntent ? result.intent === scenario.expectedIntent : true;
      const deptOk = scenario.expectedDept ? result.department === scenario.expectedDept : true;
      const ok = intentOk && deptOk;

      if (ok) passed++; else failed++;

      results.push({
        label: scenario.label,
        text: scenario.text.slice(0, 50),
        passed: ok,
        intent: result.intent,
        department: result.department,
        expectedIntent: scenario.expectedIntent,
        expectedDept: scenario.expectedDept,
        ms: Date.now() - start,
        chainType: result.chainType,
        agentsCount: result.agentsUsed?.length || 0,
      });
    } catch (e: any) {
      failed++;
      results.push({
        label: scenario.label,
        text: scenario.text.slice(0, 50),
        passed: false,
        intent: "error",
        department: "error",
        error: e.message?.slice(0, 200) || "Unknown error",
        ms: Date.now() - start,
        agentsCount: 0,
      });
    }
  }

  return NextResponse.json({
    total: TEST_SCENARIOS.length,
    passed,
    failed,
    passRate: `${((passed / TEST_SCENARIOS.length) * 100).toFixed(0)}%`,
    results,
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const customText = (body as any).text;
  if (!customText) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  const start = Date.now();
  const ctx: MessageCtx = {
    phone: "test-custom",
    text: customText,
    name: "Custom Test",
    role: (body as any).role || "customer",
    language: /[আ-হ]/.test(customText) ? "bn" : "en",
    mood: "neutral",
    totalChats: 0,
    painPoints: [],
    interests: [],
    isWorker: (body as any).role === "worker",
    isPremium: (body as any).role === "premium",
  };

  try {
    const result = await processMessage(ctx);
    return NextResponse.json({
      success: true,
      text: result.text,
      model: result.model,
      tokens: result.tokens,
      intent: result.intent,
      department: result.department,
      departmentsUsed: result.departmentsUsed,
      agentsUsed: result.agentsUsed,
      chainType: result.chainType,
      ms: Date.now() - start,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Test failed" }, { status: 500 });
  }
}
