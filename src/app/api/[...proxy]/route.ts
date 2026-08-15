import { NextRequest } from "next/server";
import { getAIEnv } from "@/lib/env";

// AI routes (and their libs) now live in the separate jgcareer-ai worker.
// Any /api/* path without a dedicated route in this app is proxied there via
// the AI service binding (fallback: public AI_WORKER_URL).
const AI_BASE =
  process.env.AI_WORKER_URL?.replace(/\/+$/, "") ||
  "https://jgcareer-ai.earn.workers.dev";

const HOP_HEADERS = [
  "cf-ray",
  "cf-connecting-ip",
  "cf-visitor",
  "cf-ipcountry",
  "cf-worker",
  "cf-cache-status",
  "cf-edge-cache-status",
  "cf-cdn-request-id",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "upgrade",
];

async function proxy(request: NextRequest, path: string[]) {
  const { AI } = await getAIEnv();
  if (AI) {
    try {
      // Build a fresh request for the binding (host is ignored by the
      // binding, but must be a valid https URL). Forwarding the original
      // NextRequest object directly is not reliable.
      const url = new URL(request.url);
      url.protocol = "https:";
      url.host = "jgcareer-ai.invalid";

      const headers = new Headers(request.headers);
      for (const h of HOP_HEADERS) headers.delete(h);

      const init: RequestInit = {
        method: request.method,
        headers,
        redirect: "manual",
      };
      if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = request.body;
      }

      return AI.fetch(new Request(url.toString(), init));
    } catch (e) {
      // fall through to the public URL below
    }
  }

  const target = new URL(`${AI_BASE}/api/${path.join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  for (const h of HOP_HEADERS) headers.delete(h);

  const init: RequestInit = { method: request.method, headers, redirect: "manual" };
  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    init.body = request.body;
  }

  const res = await fetch(target.toString(), init);

  const resHeaders = new Headers(res.headers);
  for (const h of HOP_HEADERS) resHeaders.delete(h);

  return new Response(res.body, { status: res.status, headers: resHeaders });
}

type Ctx = { params: Promise<{ proxy: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).proxy);
}
export async function POST(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).proxy);
}
export async function PUT(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).proxy);
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).proxy);
}
export async function DELETE(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).proxy);
}
export async function OPTIONS(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).proxy);
}
export async function HEAD(request: NextRequest, ctx: Ctx) {
  return proxy(request, (await ctx.params).proxy);
}
