import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { enqueueMessage } from "@/lib/whatsapp";

export async function GET() {
  try {
    const env = await getDB();
    const campaigns = await query(env,
      "SELECT id, name, message, status, target_filter, total_targets, sent_count, replied_count, started_at, completed_at, created_by, created_at FROM wa_campaigns ORDER BY created_at DESC LIMIT 20"
    );
    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load campaigns"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, message, targetFilter, action } = await request.json() as {
      name?: string; message?: string; targetFilter?: string; action?: string; campaignId?: number;
    };

    const env = await getDB();

    if (action === "start" || name) {
      let campaignId: number;

      if (action === "start") {
        const { campaignId: cid } = await request.json() as { campaignId: number };
        campaignId = cid;
      } else {
        if (!name || !message) {
          return NextResponse.json({ error: "Name and message required" }, { status: 400 });
        }
        const result = await execute(env,
          "INSERT INTO wa_campaigns (name, message, status, target_filter, created_at) VALUES (?, ?, 'draft', ?, datetime('now'))",
          [name, message, targetFilter || null]
        );
        if (!result.meta?.last_row_id) {
          return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
        }
        campaignId = result.meta.last_row_id;
      }

      const campaign = await queryFirst<{ message: string; target_filter: string | null }>(
        env, "SELECT id, message, target_filter FROM wa_campaigns WHERE id = ?", [campaignId]
      );
      if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

      let contacts = await query<{ phone: string }>(env,
        "SELECT phone FROM wa_contacts WHERE status = 'pending' ORDER BY priority_score DESC LIMIT 500"
      );

      await execute(env,
        "UPDATE wa_campaigns SET status = 'running', total_targets = ?, started_at = datetime('now') WHERE id = ?",
        [contacts.length, campaignId]
      );

      for (const contact of contacts) {
        await enqueueMessage(contact.phone, campaign.message, 0, {
          campaignId: String(campaignId),
          messageType: "campaign",
        });
      }

      return NextResponse.json({ campaignId, targets: contacts.length });
    }

    return NextResponse.json({ error: "Provide name+message or action='start'+campaignId" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Campaign failed"
    }, { status: 500 });
  }
}
