import { NextRequest, NextResponse } from "next/server";
import { ensureCampaignEngineTables, getSegmentCampaigns, registerSegmentCampaign, executeSegmentCampaign, runDueSegmentCampaigns, getCampaignAnalytics, seedDefaultCampaigns } from "@/lib/ai/campaign-engine";
import { ensureSMSTables, seedSMSTemplates } from "@/lib/ai/sms";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "list";
    const segment = searchParams.get("segment") || undefined;
    const campaignId = searchParams.get("campaignId") ? parseInt(searchParams.get("campaignId")!) : undefined;

    switch (action) {
      case "list":
        return NextResponse.json({ campaigns: await getSegmentCampaigns(segment) });
      case "analytics":
        return NextResponse.json({ analytics: await getCampaignAnalytics(campaignId) });
      case "run-due": {
        const results = await runDueSegmentCampaigns();
        return NextResponse.json({ results, total: results.length });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json();
    const { action } = body;

    switch (action) {
      case "seed": {
        await ensureCampaignEngineTables();
        await ensureSMSTables();
        await seedDefaultCampaigns();
        await seedSMSTemplates();
        return NextResponse.json({ success: true });
      }
      case "register": {
        if (!body.name || !body.segment) {
          return NextResponse.json({ error: "name and segment required" }, { status: 400 });
        }
        const id = await registerSegmentCampaign(body);
        return NextResponse.json({ success: true, id });
      }
      case "execute": {
        const cid = body.campaignId;
        const channel = body.channel || "whatsapp";
        if (!cid) return NextResponse.json({ error: "campaignId required" }, { status: 400 });
        const result = await executeSegmentCampaign(cid, channel);
        return NextResponse.json({ success: true, ...result });
      }
      case "execute-segment": {
        const segment = body.segment;
        const channel = body.channel || "whatsapp";
        if (!segment) return NextResponse.json({ error: "segment required" }, { status: 400 });
        const campaigns = await getSegmentCampaigns(segment);
        const results: any[] = [];
        for (const c of campaigns.filter((c) => c.isActive && c.id)) {
          const r = await executeSegmentCampaign(c.id!, channel);
          results.push({ campaign: c.name, ...r });
        }
        return NextResponse.json({ success: true, results });
      }
      case "run-due": {
        const results = await runDueSegmentCampaigns();
        return NextResponse.json({ success: true, results, total: results.length });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}
