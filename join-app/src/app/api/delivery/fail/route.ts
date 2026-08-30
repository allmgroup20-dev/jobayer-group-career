import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const ct = request.headers.get("content-type") || "";
    let data: Record<string, string> = {};
    if (ct.includes("application/json")) {
      const j = await request.json().catch(() => ({}));
      for (const [k, v] of Object.entries(j as Record<string, unknown>)) data[k] = String(v);
    } else {
      const form = await request.formData().catch(() => null);
      if (form) for (const [k, v] of form.entries()) data[k] = String(v);
    }
    for (const [k, v] of request.nextUrl.searchParams.entries()) if (!data[k]) data[k] = v;
    const tranId = data.tran_id || data.tranId || "";
    if (tranId) {
      try {
        const env = await getDB();
        await env.DB.prepare("UPDATE delivery_orders SET status = 'FAILED', gateway_response = ?, verified_at = datetime('now') WHERE tran_id = ?").bind(JSON.stringify(data), tranId).run();
      } catch {}
    }
  } catch {}
  return NextResponse.redirect(new URL("/certificate?delivery=failed", request.nextUrl.origin));
}
export async function GET(request: NextRequest) { return POST(request); }
