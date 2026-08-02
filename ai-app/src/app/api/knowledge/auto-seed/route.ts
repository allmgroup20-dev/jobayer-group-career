import { NextRequest, NextResponse } from "next/server";
import { autoSeedKnowledge } from "@/lib/ai/knowledge-auto-seed";

export async function GET(request: NextRequest) {
  try {
    const auth = request.nextUrl.searchParams.get("token");
    if (auth !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await autoSeedKnowledge();
    return NextResponse.json({
      success: true,
      seeded: result.seeded,
      categories: result.categories,
      message: `${result.seeded} knowledge entries seeded across ${result.categories.length} categories`,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
