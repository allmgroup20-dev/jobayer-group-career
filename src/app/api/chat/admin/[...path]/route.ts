import { NextRequest, NextResponse } from "next/server";
import { verifyCompanyToken, getJwtSecret } from "@/lib/auth";

const CHAT_BASE =
  process.env.CHAT_WORKER_URL?.replace(/\/+$/, "") ||
  "https://jgcareer-chat.earner.workers.dev";

const CHAT_API_SECRET = process.env.CHAT_API_SECRET || "";

type Ctx = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, path: string[]) {
  if (!CHAT_API_SECRET) {
    return NextResponse.json(
      { error: "Chat admin API is not configured (CHAT_API_SECRET missing)" },
      { status: 503 },
    );
  }

  const target = new URL(`${CHAT_BASE}/${path.join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${CHAT_API_SECRET}`);
  headers.delete("cookie");

  const init: RequestInit = { method: request.method, headers, redirect: "manual" };
  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    init.body = request.body;
  }

  const res = await fetch(target.toString(), init);

  const resHeaders = new Headers(res.headers);
  resHeaders.delete("access-control-allow-origin");
  resHeaders.delete("access-control-allow-methods");
  resHeaders.delete("access-control-allow-headers");

  return new Response(res.body, { status: res.status, headers: resHeaders });
}

async function requireCompany(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("company_token")?.value;
  if (!token) return false;
  const payload = await verifyCompanyToken(token, getJwtSecret());
  return payload?.type === "company";
}

export async function GET(request: NextRequest, ctx: Ctx) {
  if (!(await requireCompany(request))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return forward(request, (await ctx.params).path);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  if (!(await requireCompany(request))) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return forward(request, (await ctx.params).path);
}
