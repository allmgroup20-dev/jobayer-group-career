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
      "SELECT username, name, password, role FROM company_users WHERE username = ? COLLATE NOCASE",
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
    const response = NextResponse.json({ token, username: admin.username, name: admin.name, role: admin.role });
    response.cookies.set("company_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set("company_user", JSON.stringify({ name: admin.name, username: admin.username, role: admin.role }), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (error) {
    console.error("Company login error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
