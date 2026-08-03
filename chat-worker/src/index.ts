import type { Env } from "./types";
import { handleIncoming } from "./webhook";
import { getHistory, getConversations, markAgentReply } from "./d1";

const ADMIN_PATHS = ["/conversations", "/history", "/agent"];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return cors(preflight(), request, env);
    }

    try {
      if (ADMIN_PATHS.includes(path)) {
        if (!isAuthorized(request, env)) {
          return cors(Response.json({ error: "Unauthorized" }, { status: 401 }), request, env);
        }
      }

      // POST /webhook — receive message from browser
      if (path === "/webhook" && request.method === "POST") {
        const body = await request.json() as any;
        const result = await handleIncoming(env, body);
        return cors(Response.json(result), request, env);
      }

      // GET /history?session=X — get conversation history
      if (path === "/history" && request.method === "GET") {
        const session = url.searchParams.get("session");
        if (!session) return cors(Response.json({ error: "Missing session" }, { status: 400 }), request, env);
        const messages = await getHistory(env, session);
        return cors(Response.json({ messages }), request, env);
      }

      // GET /poll?session=X&after=Y — polling for new messages
      if (path === "/poll" && request.method === "GET") {
        const session = url.searchParams.get("session");
        if (!session) return cors(Response.json({ error: "Missing session" }, { status: 400 }), request, env);

        const messages = await getHistory(env, session);
        const after = parseInt(url.searchParams.get("after") || "0");
        const newMessages = messages.filter((_, i) => i >= after);

        return cors(Response.json({
          messages: newMessages,
          hasMore: newMessages.length > 0,
          total: messages.length,
        }), request, env);
      }

      // POST /agent — agent/admin reply
      if (path === "/agent" && request.method === "POST") {
        const { sessionId, message, agentPhone } = await request.json() as any;
        if (!sessionId || !message) {
          return cors(Response.json({ error: "Missing sessionId or message" }, { status: 400 }), request, env);
        }
        await markAgentReply(env, sessionId, agentPhone || "agent", message);
        return cors(Response.json({ ok: true }), request, env);
      }

      // GET /conversations — list all web chat sessions (for admin)
      if (path === "/conversations" && request.method === "GET") {
        const list = await getConversations(env);
        return cors(Response.json({ conversations: list }), request, env);
      }

      // GET /health
      if (path === "/health") {
        return cors(Response.json({ status: "ok", worker: "jgcareer-chat" }), request, env);
      }

      return cors(Response.json({ error: "Not found" }, { status: 404 }), request, env);
    } catch (err: any) {
      console.error("Chat worker error:", err);
      return cors(Response.json(
        { error: "Internal error", detail: err?.message },
        { status: 500 },
      ), request, env);
    }
  },
};

function isAuthorized(request: Request, env: Env): boolean {
  const secret = env.CHAT_API_SECRET;
  if (!secret) {
    console.warn("[auth] CHAT_API_SECRET not configured; admin endpoints open (fail-open)");
    return true;
  }
  const auth = request.headers.get("Authorization") || "";
  const expected = `Bearer ${secret}`;
  if (auth.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < auth.length; i++) diff |= auth.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

const DEFAULT_ORIGINS = ["https://career.jobayergroup.com", "http://localhost:3000"];

function allowedOrigin(request: Request, env: Env): string | null {
  const origin = request.headers.get("Origin");
  if (!origin) return null;
  const list = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origins = list.length > 0 ? list : DEFAULT_ORIGINS;
  return origins.includes(origin) ? origin : null;
}

function cors(res: Response, request: Request, env: Env): Response {
  const headers = new Headers(res.headers);
  const origin = allowedOrigin(request, env);
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(res.body, { status: res.status, headers });
}

function preflight(): Response {
  return new Response(null, { status: 204 });
}
