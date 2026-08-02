import { NextRequest, NextResponse } from "next/server";
import { getLeads, getLeadStats, updateLeadStatus } from "@/lib/ai/leads";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const getStats = url.searchParams.get("stats") === "true";

    if (getStats) {
      const stats = await getLeadStats();
      return NextResponse.json(stats);
    }

    const result = await getLeads({ status, limit, offset });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to fetch leads",
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as { phone: string; status: string; notes?: string };
    if (!body.phone || !body.status) {
      return NextResponse.json({ error: "phone and status required" }, { status: 400 });
    }
    await updateLeadStatus(body.phone, body.status, body.notes);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to update lead",
    }, { status: 500 });
  }
}
