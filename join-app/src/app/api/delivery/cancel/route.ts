import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData().catch(() => null);
    let tranId = "";
    if (form) tranId = String(form.get("tran_id") || "");
    if (!tranId) tranId = request.nextUrl.searchParams.get("tran_id") || "";
    if (tranId) {
      try {
        const env = await getDB();
        await env.DB.prepare("UPDATE delivery_orders SET status = 'CANCELLED', verified_at = datetime('now') WHERE tran_id = ?").bind(tranId).run();
      } catch {}
    }
  } catch {}
  return NextResponse.redirect(new URL("/certificate?delivery=cancelled", request.nextUrl.origin));
}
export async function GET(request: NextRequest) { return POST(request); }
