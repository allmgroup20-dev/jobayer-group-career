import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { ensureWorkerProfileColumns, queryFirst } from "@/lib/queries";
import { verifyWorkerFromCookies } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyWorkerFromCookies(request);
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const env = await getDB();
    await ensureWorkerProfileColumns(env);
    const row = await queryFirst<{ membership_status: string }>(
      env, "SELECT membership_status FROM workers WHERE worker_id = ?", [payload.sub]
    );
    const isPremium = row?.membership_status === "premium";
    return NextResponse.json({
      isPremium,
      membershipStatus: row?.membership_status || "general",
      amount: 99,
      currency: "BDT",
      tier: "elite",
    });
  } catch (error) {
    console.error("Membership status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
