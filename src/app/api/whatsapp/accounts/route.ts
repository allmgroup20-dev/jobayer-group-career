import { NextRequest, NextResponse } from "next/server";
import { query, queryFirst, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const env = await getDB();
    const accounts = await query(env,
      "SELECT * FROM wa_accounts ORDER BY created_at ASC"
    );
    const warmups = await query(env,
      "SELECT * FROM wa_warmup ORDER BY account_id ASC"
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
    const { accountId, phone, provider, config, action } = await request.json() as {
      accountId?: string; phone?: string; provider?: string; config?: Record<string, string>; action?: string;
    };

    const env = await getDB();

    if (action === "add" || accountId) {
      const id = accountId || `acc_${Date.now()}`;
      await execute(env,
        `INSERT INTO wa_accounts (account_id, phone, provider, status, daily_limit, config, created_at)
         VALUES (?, ?, ?, 'disconnected', 100, ?, datetime('now'))
         ON CONFLICT(account_id) DO UPDATE SET phone=COALESCE(?,phone), provider=COALESCE(?,provider), config=COALESCE(?,config)`,
        [id, phone || null, provider || "meta", config ? JSON.stringify(config) : null, phone || null, provider || null, config ? JSON.stringify(config) : null]
      );
      await execute(env,
        "INSERT OR IGNORE INTO wa_warmup (account_id, day_count, current_limit, started_at) VALUES (?, 1, 20, datetime('now'))",
        [id]
      );
      return NextResponse.json({ accountId: id, created: true });
    }

    if (action === "connect") {
      await execute(env,
        "UPDATE wa_accounts SET status = 'connected' WHERE account_id = ?",
        [accountId]
      );
      return NextResponse.json({ connected: true });
    }

    if (action === "disconnect") {
      await execute(env,
        "UPDATE wa_accounts SET status = 'disconnected' WHERE account_id = ?",
        [accountId]
      );
      return NextResponse.json({ disconnected: true });
    }

    if (action === "remove") {
      await execute(env, "DELETE FROM wa_warmup WHERE account_id = ?", [accountId]);
      await execute(env, "DELETE FROM wa_accounts WHERE account_id = ?", [accountId]);
      return NextResponse.json({ removed: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Account action failed"
    }, { status: 500 });
  }
}
