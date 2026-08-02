import { NextRequest, NextResponse } from "next/server";
import { analyzeRecentErrors } from "@/lib/system/ai-analyzer";

export async function POST() {
  const result = await analyzeRecentErrors();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result);
}
