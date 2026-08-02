import { NextRequest, NextResponse } from "next/server";
import { createCampaign, executeCampaign, getCampaigns, getCampaignLogs } from "@/lib/ai/outreach";

export async function GET(request: NextRequest) {
  try {
    const campaignId = request.nextUrl.searchParams.get("campaign_id");
    if (campaignId) {
      const logs = await getCampaignLogs(Number(campaignId));
      return NextResponse.json({ logs });
    }
    const campaigns = await getCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load campaigns"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: string;
      campaignId?: number;
      name?: string;
      targetStatus?: string;
      targetMinPriority?: number;
      targetDaysSinceContact?: number;
      messageTemplate?: string;
      aiGenerated?: boolean;
      batchSize?: number;
    };

    if (body.action === "create") {
      const campaign = await createCampaign({
        name: body.name || "New Campaign",
        targetStatus: body.targetStatus,
        targetMinPriority: body.targetMinPriority,
        targetDaysSinceContact: body.targetDaysSinceContact,
        messageTemplate: body.messageTemplate,
        aiGenerated: body.aiGenerated,
      });
      return NextResponse.json({ campaign });
    }

    if (body.action === "start") {
      if (!body.campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });
      const { ensureDB } = await import("@/lib/db");
      const { execute } = await import("@/lib/db/queries");
      const db = await ensureDB();
      await execute(
        { DB: db },
        "UPDATE wa_outreach_campaigns SET status = 'running', started_at = datetime('now'), updated_at = datetime('now') WHERE id = ?",
        [body.campaignId]
      );
      const result = await executeCampaign(body.campaignId, body.batchSize || 10);
      return NextResponse.json(result);
    }

    if (body.action === "run_batch") {
      if (!body.campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });
      const result = await executeCampaign(body.campaignId, body.batchSize || 10);
      return NextResponse.json(result);
    }

    if (body.action === "pause") {
      if (!body.campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });
      const { ensureDB } = await import("@/lib/db");
      const { execute } = await import("@/lib/db/queries");
      const db = await ensureDB();
      await execute(
        { DB: db },
        "UPDATE wa_outreach_campaigns SET status = 'paused', updated_at = datetime('now') WHERE id = ?",
        [body.campaignId]
      );
      return NextResponse.json({ paused: true });
    }

    return NextResponse.json({ error: "Unknown action. Try: create, start, run_batch, pause" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Outreach failed"
    }, { status: 500 });
  }
}
