import { NextRequest, NextResponse } from "next/server";
import { ensureDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const { workerId, productId, productType, rating, reviewText } = body;

    if (!workerId || !productId || !rating) {
      return NextResponse.json({ error: "workerId, productId, rating required" }, { status: 400 });
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });
    }

    const db = await ensureDB();

    const existing = await db.prepare(
      "SELECT id FROM product_reviews WHERE worker_id = ? AND product_id = ? AND product_type = ?"
    ).bind(workerId, productId, productType || "course").first() as { id: number } | undefined;

    if (existing) {
      await db.prepare(
        "UPDATE product_reviews SET rating = ?, review_text = ?, is_approved = 0, created_at = datetime('now') WHERE id = ?"
      ).bind(rating, reviewText || null, existing.id).run();
    } else {
      await db.prepare(
        "INSERT INTO product_reviews (worker_id, product_id, product_type, rating, review_text) VALUES (?, ?, ?, ?, ?)"
      ).bind(workerId, productId, productType || "course", rating, reviewText || null).run();
    }

    // Trigger interest score update
    fetch(`${req.nextUrl.origin}/api/track/score?workerId=${workerId}`).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Review POST error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const productId = req.nextUrl.searchParams.get("productId");
    const workerId = req.nextUrl.searchParams.get("workerId");
    const productType = req.nextUrl.searchParams.get("productType") || "course";
    const unapproved = req.nextUrl.searchParams.get("unapproved");

    const db = await ensureDB();
    let query = "SELECT r.id, r.worker_id, r.product_id, r.product_type, r.rating, r.review_text, r.is_approved, r.created_at, w.name as worker_name FROM product_reviews r LEFT JOIN workers w ON r.worker_id = w.worker_id WHERE 1=1";
    const params: unknown[] = [];

    if (!unapproved) {
      query += " AND r.is_approved = 1";
    }
    if (productId && productType) {
      query += " AND r.product_id = ? AND r.product_type = ?";
      params.push(productId, productType);
    }
    if (workerId) {
      query += " AND r.worker_id = ?";
      params.push(workerId);
    }

    query += " ORDER BY r.created_at DESC LIMIT 100";

    const stmt = db.prepare(query);
    const bound = params.length > 0 ? stmt.bind(...params) : stmt.bind();
    const { results: reviews } = await bound.all() as { results: any[] };

    return NextResponse.json({ reviews: reviews || [] });
  } catch (err) {
    console.error("Review GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
