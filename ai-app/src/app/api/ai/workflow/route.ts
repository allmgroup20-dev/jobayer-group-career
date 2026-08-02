import { NextRequest, NextResponse } from "next/server";
import { ensureWorkflowTables, getActiveWorkflows, registerWorkflow, getDefaultWorkflows, triggerWorkflows } from "@/lib/ai/workflow/engine";
import { ensureEmailTables, seedEmailTemplates } from "@/lib/ai/email";
import { getFunnelAnalytics, getCampaignPerformance, getFunnelBreakdown } from "@/lib/ai/analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "list";

    switch (action) {
      case "list": {
        const workflows = await getActiveWorkflows();
        return NextResponse.json({ workflows, total: workflows.length });
      }
      case "funnel": {
        const days = parseInt(searchParams.get("days") || "30");
        const analytics = await getFunnelAnalytics(days);
        const breakdown = await getFunnelBreakdown(days);
        return NextResponse.json({ analytics, breakdown });
      }
      case "campaigns": {
        const campaignId = searchParams.get("campaignId") ? parseInt(searchParams.get("campaignId")!) : undefined;
        return NextResponse.json({ campaigns: await getCampaignPerformance(campaignId) });
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
        await ensureWorkflowTables();
        await ensureEmailTables();
        const defaults = await getDefaultWorkflows();
        for (const wf of defaults) await registerWorkflow(wf);
        await seedEmailTemplates();
        return NextResponse.json({ success: true, workflows: defaults.length });
      }
      case "register": {
        const wf = body.workflow;
        if (!wf?.id || !wf?.name || !wf?.trigger || !wf?.steps) {
          return NextResponse.json({ error: "Invalid workflow definition" }, { status: 400 });
        }
        await registerWorkflow(wf);
        return NextResponse.json({ success: true, id: wf.id });
      }
      case "trigger": {
        const { trigger, context } = body;
        if (!trigger || !context) {
          return NextResponse.json({ error: "trigger and context required" }, { status: 400 });
        }
        triggerWorkflows(trigger, context).catch((e: any) => console.error("[Workflow] trigger error:", e));
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: (e as Error)?.message }, { status: 500 });
  }
}
