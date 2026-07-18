import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db/queries";
import { getDB } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDB();
    const products = await query<any>(db,
      `SELECT id, name, name_bn as nameBn, price,
              enable_commission as enableCommission,
              commission_override as commissionOverride
       FROM products WHERE is_active = 1 ORDER BY name ASC LIMIT 200`
    );
    const levels = await query<any>(db,
      "SELECT level_number as levelNumber, percentage, fixed_amount as fixedAmount FROM commission_levels WHERE is_active = 1 ORDER BY level_number ASC"
    );
    return NextResponse.json({ products, globalLevels: levels });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as {
      productId: number;
      levels: { levelNumber: number; percentage: number; fixedAmount: number }[];
    };

    if (!body.productId || !body.levels) {
      return NextResponse.json({ error: "productId and levels required" }, { status: 400 });
    }

    const db = await getDB();
    const override = JSON.stringify(body.levels);

    await execute(db,
      "UPDATE products SET commission_override = ? WHERE id = ? AND is_active = 1",
      [override, body.productId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const db = await getDB();
    await execute(db,
      "UPDATE products SET commission_override = NULL WHERE id = ? AND is_active = 1",
      [parseInt(productId)]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}
