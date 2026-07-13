import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const products = await query(
      await getDB(),
      "SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC",
      []
    );
    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { name: string; nameBn?: string; description?: string; descriptionBn?: string; price: number; currency?: string; commissionPercentage?: number; commissionFixed?: number; imageUrl?: string; category?: string };
    const env = await getDB();

    await execute(env,
      `INSERT INTO products (name, name_bn, description, description_bn, price, currency, commission_percentage, commission_fixed, image_url, category, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [body.name, body.nameBn || null, body.description || null, body.descriptionBn || null,
       body.price, body.currency || "BDT", body.commissionPercentage || 0, body.commissionFixed || 0,
       body.imageUrl || null, body.category || null]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
