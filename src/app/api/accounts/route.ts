import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workerId = searchParams.get("workerId");
  if (!workerId) return NextResponse.json({ error: "workerId required" }, { status: 400 });
  try {
    const rows = await query(await getDB(),
      "SELECT id, worker_id, account_type, account_number, account_name, is_default, created_at FROM saved_accounts WHERE worker_id = ? ORDER BY is_default DESC, created_at ASC",
      [workerId]
    );
    return NextResponse.json({ accounts: rows });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workerId, accountType, accountNumber, accountName, isDefault } = await request.json() as {
      workerId: string; accountType: string; accountNumber: string; accountName?: string; isDefault?: number;
    };
    if (!workerId || !accountType || !accountNumber) {
      return NextResponse.json({ error: "workerId, accountType, accountNumber required" }, { status: 400 });
    }
    const env = await getDB();
    if (isDefault) {
      await execute(env, "UPDATE saved_accounts SET is_default = 0 WHERE worker_id = ?", [workerId]);
    }
    await execute(env,
      "INSERT INTO saved_accounts (worker_id, account_type, account_number, account_name, is_default) VALUES (?, ?, ?, ?, ?)",
      [workerId, accountType, accountNumber, accountName || null, isDefault ? 1 : 0]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, workerId, isDefault, accountName } = await request.json() as {
      id?: number; workerId?: string; isDefault?: number; accountName?: string;
    };
    const env = await getDB();
    if (isDefault !== undefined && workerId && id) {
      await execute(env, "UPDATE saved_accounts SET is_default = 0 WHERE worker_id = ?", [workerId]);
      await execute(env, "UPDATE saved_accounts SET is_default = 1 WHERE id = ?", [id]);
    }
    if (accountName !== undefined && id) {
      await execute(env, "UPDATE saved_accounts SET account_name = ? WHERE id = ?", [accountName, id]);
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json() as { id: number };
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await execute(await getDB(), "DELETE FROM saved_accounts WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
