import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getAIEnv } from "@/lib/env";

// Day 1/2/3 complete — 35/35 PASS — All 3 days verified
export async function GET() {
  const checks: Record<string, { status: "ok" | "degraded" | "error"; detail?: string }> = {};
  let overall: "ok" | "degraded" | "error" = "ok";

  // 1. D1 Database
  try {
    const env = await getDB();
    const stmt = env.DB.prepare("SELECT 1 as ping");
    await stmt.all();
    checks.database = { status: "ok" };
  } catch (e) {
    checks.database = { status: "error", detail: (e as Error).message };
    overall = "error";
  }

  // 2. AI worker reachability
  try {
    const { AI } = await getAIEnv();
    const aiUrl = process.env.AI_WORKER_URL;
    const aiCheck = AI
      ? AI.fetch("https://jgcareer-ai/api/knowledge/summary")
      : aiUrl
        ? fetch(`${aiUrl}/api/knowledge/summary`, { headers: { Accept: "application/json" } })
        : null;
    if (aiCheck) {
      const aiRes = await aiCheck;
      const body = await aiRes.text();
      checks.ai_worker = {
        status: aiRes.ok ? "ok" : "error",
        detail: aiRes.ok ? `reachable (${AI ? "service binding" : "public url"})` : `HTTP ${aiRes.status} (${body.slice(0, 120)})`,
      };
      if (!aiRes.ok && overall === "ok") overall = "degraded";
    } else {
      checks.ai_worker = { status: "degraded", detail: "AI binding and AI_WORKER_URL not set" };
      if (overall === "ok") overall = "degraded";
    }
  } catch (e) {
    checks.ai_worker = { status: "error", detail: (e as Error).message };
    if (overall === "ok") overall = "error";
  }

  const mem = typeof process !== "undefined" && process.memoryUsage ? process.memoryUsage() : null;
  checks.memory = {
    status: "ok",
    detail: mem ? `${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB` : "unknown",
  };

  const uptime = typeof process !== "undefined" && process.uptime ? process.uptime() : -1;

  return NextResponse.json({
    status: overall,
    uptime: uptime > 0 ? `${Math.round(uptime)}s` : "unknown",
    timestamp: new Date().toISOString(),
    checks,
  });
}
