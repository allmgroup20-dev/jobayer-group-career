import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyToken, getJwtSecret } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("company_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const payload = await verifyCompanyToken(token, getJwtSecret());
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
  const userCookie = request.cookies.get("company_user")?.value;
  let name = payload.sub;
  let role = "admin";
  if (userCookie) {
    try {
      const parsed = JSON.parse(userCookie);
      name = parsed.name || payload.sub;
      role = parsed.role || "admin";
    } catch {}
  }
  return NextResponse.json({ username: payload.sub, name, role });
}
