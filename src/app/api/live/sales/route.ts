import { NextResponse } from "next/server";
import { query } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { getCached, setCached } from "@/lib/cache";

const maskName = (name: string | null | undefined, phone: string | null | undefined): string => {
  const n = (name || "").trim();
  if (n) {
    if (n.length <= 1) return n;
    return n.slice(0, Math.max(1, n.length - 1)) + "***";
  }
  const p = (phone || "").trim();
  if (p.length >= 6) return "০১" + p.slice(2, 5) + "XXXXX";
  return "একজন সদস্য";
};

export async function GET() {
  try {
    const cached = await getCached<any>("live:sales", 30);
    if (cached) {
      const resp = NextResponse.json(cached);
      resp.headers.set("Cache-Control", "public, s-maxage=25, stale-while-revalidate=60");
      return resp;
    }

    const db = await getDB();
    const sales = await query<any>(
      db,
      `SELECT o.product_name, o.total_amount, o.created_at, w.name, w.phone
       FROM orders o
       LEFT JOIN workers w ON o.worker_id = w.worker_id
       WHERE o.payment_status = 'completed'
       ORDER BY o.created_at DESC
       LIMIT 8`
    );

    const result = {
      sales: (sales || []).map((s) => ({
        name: maskName(s.name, s.phone),
        product: s.product_name || "রিসোর্স",
        amount: s.total_amount || 0,
        at: s.created_at || null,
      })),
    };
    await setCached("live:sales", result);
    const resp = NextResponse.json(result);
    resp.headers.set("Cache-Control", "public, s-maxage=25, stale-while-revalidate=60");
    return resp;
  } catch (error) {
    return NextResponse.json({ sales: [] }, { status: 200 });
  }
}
