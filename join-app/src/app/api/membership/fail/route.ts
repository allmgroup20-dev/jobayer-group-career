import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";
import { execute } from "@/lib/queries";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData().catch(() => null);
    let tranId = "";
    if (form) tranId = String(form.get("tran_id") || "");
    if (!tranId) tranId = request.nextUrl.searchParams.get("tran_id") || "";
    if (tranId) {
      const env = await getDB();
      await execute(await getDB().then(e => e).catch(() => ({ DB: null as unknown as D1Database })), "UPDATE membership_payments SET status = 'FAILED', verified_at = datetime('now') WHERE tran_id = ?", [tranId]).catch(() => {});
      try {
        const env2 = await getDB();
        await env2.DB.prepare("UPDATE membership_payments SET status = 'FAILED', verified_at = datetime('now') WHERE tran_id = ?").bind(tranId).run();
      } catch {}
    }
  } catch {}
  return NextResponse.redirect(new URL("/complete?membership=failed", request.nextUrl.origin));
}

export async function GET(request: NextRequest) {
  return POST(request);
}
