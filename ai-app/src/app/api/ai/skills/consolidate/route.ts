import { NextResponse } from "next/server";
import { consolidateSkills } from "@/lib/ai";

export async function POST() {
  try {
    const result = await consolidateSkills();
    return NextResponse.json({ ok: true, faqs: result.faqs, shortcuts: result.shortcuts });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Consolidation failed",
    }, { status: 500 });
  }
}
