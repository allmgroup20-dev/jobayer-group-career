import { NextRequest, NextResponse } from "next/server";
import { query, execute, queryFirst } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { verifyCompanyToken, hashCompanyPassword, verifyCompanyPassword, getJwtSecret } from "@/lib/auth";

async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get("company_token")?.value;
  if (!token) return null;
  return await verifyCompanyToken(token, getJwtSecret());
}

export async function GET() {
  try {
    const rows = await query<{ id: number; username: string; name: string; role: string; created_at: string }>(
      await getDB(),
      "SELECT id, username, name, role, created_at FROM company_users ORDER BY created_at DESC LIMIT 100"
    );
    return NextResponse.json({ users: rows });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { username, password, name, role } = await request.json() as {
      username: string;
      password: string;
      name: string;
      role?: string;
    };

    if (!username || !password || !name) {
      return NextResponse.json({ error: "Username, password and name are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await queryFirst<{ id: number }>(
      await getDB(),
      "SELECT id FROM company_users WHERE username = ? COLLATE NOCASE",
      [username]
    );
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const hashed = await hashCompanyPassword(password);
    await execute(
      await getDB(),
      "INSERT INTO company_users (username, password, name, role) VALUES (?, ?, ?, ?)",
      [username, hashed, name, role || "admin"]
    );

    return NextResponse.json({ success: true, user: { username, name, role: role || "admin" } });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await getAuthUser(request);
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id, currentPassword } = await request.json() as { id: number; currentPassword: string };

    if (!id || !currentPassword) {
      return NextResponse.json({ error: "User ID and current password are required" }, { status: 400 });
    }

    const admin = await queryFirst<{ username: string; password: string }>(
      await getDB(),
      "SELECT username, password FROM company_users WHERE username = ? COLLATE NOCASE",
      [auth.sub]
    );
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    const valid = await verifyCompanyPassword(currentPassword, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }

    const target = await queryFirst<{ username: string; name: string }>(
      await getDB(),
      "SELECT username, name FROM company_users WHERE id = ?",
      [id]
    );
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.username.toLowerCase() === auth.sub.toLowerCase()) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 403 });
    }

    await execute(
      await getDB(),
      "DELETE FROM company_users WHERE id = ?",
      [id]
    );

    return NextResponse.json({ success: true, deleted: target.username });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
