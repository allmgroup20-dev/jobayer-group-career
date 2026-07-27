import type { Env } from "./types";
import { handleIncoming } from "./webhook";
import { getHistory, getConversations, markAgentReply } from "./d1";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return cors(preflight());
    }

    try {
      // POST /webhook — receive message from browser
      if (path === "/webhook" && request.method === "POST") {
        const body = await request.json() as any;
        const result = await handleIncoming(env, body);
        return cors(Response.json(result));
      }

      // GET /history?session=X — get conversation history
      if (path === "/history" && request.method === "GET") {
        const session = url.searchParams.get("session");
        if (!session) return cors(Response.json({ error: "Missing session" }, { status: 400 }));
        const messages = await getHistory(env, session);
        return cors(Response.json({ messages }));
      }

      // GET /poll?session=X&after=Y — polling for new messages
      if (path === "/poll" && request.method === "GET") {
        const session = url.searchParams.get("session");
        if (!session) return cors(Response.json({ error: "Missing session" }, { status: 400 }));

        const messages = await getHistory(env, session);
        const after = parseInt(url.searchParams.get("after") || "0");
        const newMessages = messages.filter((_, i) => i >= after);

        return cors(Response.json({
          messages: newMessages,
          hasMore: newMessages.length > 0,
          total: messages.length,
        }));
      }

      // POST /agent — agent/admin reply
      if (path === "/agent" && request.method === "POST") {
        const { sessionId, message, agentPhone } = await request.json() as any;
        if (!sessionId || !message) {
          return cors(Response.json({ error: "Missing sessionId or message" }, { status: 400 }));
        }
        await markAgentReply(env, sessionId, agentPhone || "agent", message);
        return cors(Response.json({ ok: true }));
      }

      // GET /conversations — list all web chat sessions (for admin)
      if (path === "/conversations" && request.method === "GET") {
        const list = await getConversations(env);
        return cors(Response.json({ conversations: list }));
      }

      // GET /health
      if (path === "/health") {
        return cors(Response.json({ status: "ok", worker: "jgcareer-chat" }));
      }

      return cors(Response.json({ error: "Not found" }, { status: 404 }));
    } catch (err: any) {
      console.error("Chat worker error:", err);
      return cors(Response.json(
        { error: "Internal error", detail: err?.message },
        { status: 500 },
      ));
    }
  },
};

function cors(res: Response): Response {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(res.body, { status: res.status, headers });
}

function preflight(): Response {
  return new Response(null, { status: 204 });
}
