import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const env = await getDB();
    const accounts = await query(env,
      "SELECT account_id, phone, provider, status, daily_limit, daily_sent, total_sent, config, session_data IS NOT NULL as has_session, last_used_at, created_at FROM wa_accounts ORDER BY created_at ASC"
    );
    const warmups = await query(env,
      "SELECT id, account_id, day_count, current_limit, started_at, last_increment_at FROM wa_warmup ORDER BY account_id ASC"
    );
    return NextResponse.json({ accounts, warmups });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to load accounts"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      accountId?: string; phone?: string; provider?: string; config?: Record<string, string>;
      action?: string; sessionData?: string;
    };

    const env = await getDB();

    if (body.action === "add" || (body.accountId && !body.action)) {
      const id = body.accountId || `web_${Date.now()}`;
      const provider = body.provider || "web";
      await execute(env,
        `INSERT INTO wa_accounts (account_id, phone, provider, status, daily_limit, config, created_at)
         VALUES (?, ?, ?, 'disconnected', 100, ?, datetime('now'))
         ON CONFLICT(account_id) DO UPDATE SET phone=COALESCE(?,phone), provider=COALESCE(?,provider), config=COALESCE(?,config)`,
        [id, body.phone || null, provider, body.config ? JSON.stringify(body.config) : null,
         body.phone || null, provider, body.config ? JSON.stringify(body.config) : null]
      );
      await execute(env,
        "INSERT OR IGNORE INTO wa_warmup (account_id, day_count, current_limit, started_at) VALUES (?, 1, 20, datetime('now'))",
        [id]
      );
      return NextResponse.json({ accountId: id, created: true });
    }

    if (body.action === "connect") {
      await execute(env,
        "UPDATE wa_accounts SET status = 'connected' WHERE account_id = ?",
        [body.accountId]
      );
      return NextResponse.json({ connected: true });
    }

    if (body.action === "disconnect") {
      await execute(env,
        "UPDATE wa_accounts SET status = 'disconnected' WHERE account_id = ?",
        [body.accountId]
      );
      return NextResponse.json({ disconnected: true });
    }

    if (body.action === "remove") {
      await execute(env, "DELETE FROM wa_warmup WHERE account_id = ?", [body.accountId]);
      await execute(env, "DELETE FROM wa_accounts WHERE account_id = ?", [body.accountId]);
      return NextResponse.json({ removed: true });
    }

    if (body.action === "save_session") {
      if (!body.accountId || !body.sessionData) {
        return NextResponse.json({ error: "accountId and sessionData required" }, { status: 400 });
      }
      await execute(env,
        "UPDATE wa_accounts SET session_data = ?, status = 'connected' WHERE account_id = ?",
        [body.sessionData, body.accountId]
      );
      return NextResponse.json({ saved: true });
    }

    if (body.action === "get_session") {
      if (!body.accountId) {
        return NextResponse.json({ error: "accountId required" }, { status: 400 });
      }
      const account = await queryFirst<{ session_data: string | null }>(env,
        "SELECT session_data FROM wa_accounts WHERE account_id = ?",
        [body.accountId]
      );
      if (account?.session_data) {
        return NextResponse.json({ sessionData: account.session_data });
      }
      return NextResponse.json({ sessionData: null });
    }

    if (body.action === "update_stats") {
      if (!body.accountId) {
        return NextResponse.json({ error: "accountId required" }, { status: 400 });
      }
      await execute(env,
        "UPDATE wa_accounts SET daily_sent = daily_sent + 1, total_sent = total_sent + 1, last_used_at = datetime('now') WHERE account_id = ?",
        [body.accountId]
      );
      return NextResponse.json({ updated: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Account action failed"
    }, { status: 500 });
  }
}
