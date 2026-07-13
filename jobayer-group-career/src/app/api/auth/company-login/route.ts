import { NextRequest, NextResponse } from "next/server";
import { queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { verifyCompanyPassword, generateCompanyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json() as { username: string; password: string };
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const admin = await queryFirst<{ username: string; name: string; password: string; role: string }>(
      await getDB(),
      "SELECT username, name, password, role FROM company_users WHERE LOWER(username) = LOWER(?)",
      [username]
    );

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyCompanyPassword(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = generateCompanyToken(admin.username, process.env.JWT_SECRET || "default-secret");
    return NextResponse.json({ token, username: admin.username, name: admin.name, role: admin.role });
  } catch (error) {
    console.error("Company login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
