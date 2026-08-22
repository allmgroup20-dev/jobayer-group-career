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
    const row = await queryFirst<{ membership_status: string; elite_certificate_id: string | null }>(
      env, "SELECT membership_status, elite_certificate_id FROM workers WHERE worker_id = ?", [payload.sub]
    );
    const isPremium = row?.membership_status === "premium";
    // Auto-issue Elite certificate when premium (admin or payment) — any amount
    let eliteCertificateId = row?.elite_certificate_id || null;
    if (isPremium && !eliteCertificateId) {
      try {
        const { generateEliteCertificateId } = await import("@/lib/share");
        const { execute } = await import("@/lib/queries");
        let eliteId = "";
        for (let attempt = 0; attempt < 5; attempt++) {
          const candidate = generateEliteCertificateId();
          const clash = await queryFirst<{ worker_id: string }>(env, "SELECT worker_id FROM workers WHERE elite_certificate_id = ? OR certificate_id = ?", [candidate, candidate]);
          if (!clash) { eliteId = candidate; break; }
        }
        if (eliteId) {
          await execute(env, "UPDATE workers SET elite_certificate_id = ?, elite_certificate_issued_at = datetime('now') WHERE worker_id = ?", [eliteId, payload.sub]);
          eliteCertificateId = eliteId;
        }
      } catch {}
    }
    return NextResponse.json({
      isPremium,
      membershipStatus: row?.membership_status || "general",
      eliteCertificateId,
      amount: 99,
      currency: "BDT",
      tier: "elite",
    });
  } catch (error) {
    console.error("Membership status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
