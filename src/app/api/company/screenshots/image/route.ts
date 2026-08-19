import { NextRequest, NextResponse } from "next/server";
import { initEnv } from "@/lib/env";
import { verifyCompanyToken, getJwtSecret } from "@/lib/auth";

// Serves a stored screenshot to the admin panel from KV.
// GET /api/company/screenshots/image?key=shots:<workerId>:2:...
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("company_token")?.value;
    if (!token || !(await verifyCompanyToken(token, getJwtSecret()))) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const key = request.nextUrl.searchParams.get("key");
    if (!key || !key.startsWith("shots:")) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const db = await initEnv();
    const buf = await db.CACHE.get(key).catch(() => null);
    if (!buf) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const mime = key.endsWith(".png")
      ? "image/png"
      : key.endsWith(".webp")
        ? "image/webp"
        : "image/jpeg";
    return new Response(buf, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (error) {
    console.error("Screenshot image error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}