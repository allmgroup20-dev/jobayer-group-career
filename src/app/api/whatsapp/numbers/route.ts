import { NextRequest, NextResponse } from "next/server";
import { generateNumbers, saveGeneratedNumbers, getScannedNumbers, validateNumber } from "@/lib/whatsapp/numbers";

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50");
    const offset = parseInt(request.nextUrl.searchParams.get("offset") || "0");
    const numbers = await getScannedNumbers(limit, offset);
    return NextResponse.json({ numbers, total: numbers.length });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load numbers"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, count, phone } = await request.json() as {
      action: "generate" | "validate";
      count?: number;
      phone?: string;
    };

    if (action === "generate") {
      const nums = generateNumbers(count || 10);
      await saveGeneratedNumbers(nums);
      return NextResponse.json({ generated: nums.length, numbers: nums });
    }

    if (action === "validate") {
      if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
      const result = await validateNumber(phone);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action. Use: generate, validate" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Action failed"
    }, { status: 500 });
  }
}
