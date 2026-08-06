import { NextRequest, NextResponse } from "next/server";
import { queryFirstSafe } from "@/lib/db/queries";
import { getDB } from "@/lib/db";
import { verifyCompanyPassword, hashCompanyPassword, generateCompanyToken, getJwtSecret } from "@/lib/auth";
import { getCached, setCached } from "@/lib/cache";

const MEMO = "__companyAuthMemo";

const DEFAULT_ADMINS: { username: string; name: string; passwordHash: string; role: string }[] = [
  { username: "admin", name: "Company Admin", passwordHash: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9", role: "superadmin" },
  { username: "jobayer group", name: "Jobayer Group", passwordHash: "52d1d87c3b2027f3f2660015ddf6463e97430b4e60099217143ac75a45646aa1", role: "superadmin" },
];

const D1_TIMEOUT_MS = 5000;

async function hashUsername(username: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(username.toLowerCase()))))
    .map(b => b.toString(16).padStart(2, "0")).join("");
}

function getMemo(): Map<string, { username: string; name: string; password: string; role: string }> {
  const g = globalThis as any;
  if (!g[MEMO]) g[MEMO] = new Map();
  return g[MEMO];
}

async function respond(admin: { username: string; name: string; role: string }): Promise<NextResponse> {
  const token = await generateCompanyToken(admin.username, getJwtSecret());
  const response = NextResponse.json({ token, username: admin.username, name: admin.name, role: admin.role });
  response.cookies.set("company_token", token, { httpOnly: true, secure: false, sameSite: "lax", path: "/", maxAge: 86400 });
  response.cookies.set("company_user", JSON.stringify({ name: admin.name, username: admin.username, role: admin.role }), { httpOnly: false, secure: false, sameSite: "lax", path: "/", maxAge: 86400 });
  return response;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { username: string; password: string };
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const usernameHash = await hashUsername(username);
    const memo = getMemo();

    // 1. In-memory cache (0ms)
    const memoized = memo.get(usernameHash);
    if (memoized) {
      const valid = await verifyCompanyPassword(password, memoized.password);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      return respond(memoized);
    }

    // 2. KV cache (20ms)
    const cached = await getCached<{ username: string; name: string; password: string; role: string }>(`auth:company:${usernameHash}`, 1800);
    if (cached) {
      const valid = await verifyCompanyPassword(password, cached.password);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      memo.set(usernameHash, cached);
      return respond(cached);
    }

    // 3. Hardcoded default admin check (0ms — no D1)
    const lowerUser = username.toLowerCase();
    for (const def of DEFAULT_ADMINS) {
      if (def.username === lowerUser) {
        // Default admin hashes are stored in the legacy SHA-256 hex format
        const inputHash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password))))
          .map((b) => b.toString(16).padStart(2, "0")).join("");
        if (inputHash === def.passwordHash) {
          const adminData = { username: def.username, name: def.name, password: def.passwordHash, role: def.role };
          memo.set(usernameHash, adminData);
          setCached(`auth:company:${usernameHash}`, adminData).catch(() => {});
          return respond(adminData);
        }
      }
    }

    // 4. D1 query (last resort — 5s timeout)
    const admin = await queryFirstSafe<{ username: string; name: string; password: string; role: string }>(
      await getDB(),
      "SELECT username, name, password, role FROM company_users WHERE username = ? COLLATE NOCASE",
      [username],
      D1_TIMEOUT_MS
    );

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyCompanyPassword(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    setCached(`auth:company:${usernameHash}`, { username: admin.username, name: admin.name, password: admin.password, role: admin.role }).catch(() => {});
    memo.set(usernameHash, { username: admin.username, name: admin.name, password: admin.password, role: admin.role });

    return respond(admin);
  } catch (error) {
    console.error("Company login error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
