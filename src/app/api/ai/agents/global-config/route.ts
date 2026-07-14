import { NextRequest, NextResponse } from "next/server";
import { getGlobalConfig, updateGlobalConfig } from "@/lib/ai/agents";

export async function GET() {
  try {
    const config = await getGlobalConfig();
    return NextResponse.json({ config });
  } catch (e) {
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as { mode?: string; provider?: string; model_id?: string };
    await updateGlobalConfig(body);
    const updated = await getGlobalConfig();
    return NextResponse.json({ success: true, config: updated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}
