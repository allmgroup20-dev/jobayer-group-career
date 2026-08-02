const CHAT_WORKER = "https://jgcareer-chat.allmgroup20.workers.dev";

export interface ChatMsg {
  role: "user" | "assistant" | "agent";
  content: string;
  created_at?: string;
}

let _sessionId: string | null = null;
let _offline = false;

function getSessionId(): string {
  if (_sessionId) return _sessionId;
  const stored = localStorage.getItem("chat_session_id");
  if (stored) { _sessionId = stored; return stored; }
  const workerId = localStorage.getItem("worker_id");
  if (workerId) { _sessionId = workerId; return workerId; }
  const id = `web_${Date.now().toString(36)}`;
  _sessionId = id;
  localStorage.setItem("chat_session_id", id);
  return id;
}

async function chatFetch(path: string, init?: RequestInit): Promise<any> {
  if (_offline) return null;
  try {
    const res = await fetch(`${CHAT_WORKER}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    _offline = true;
    return null;
  }
}

export async function sendMessage(text: string): Promise<string> {
  const data = await chatFetch("/webhook", {
    method: "POST",
    body: JSON.stringify({ message: text, sessionId: getSessionId() }),
  });
  return data?.reply || "";
}

export async function getHistory(): Promise<ChatMsg[]> {
  const data = await chatFetch(`/history?session=${getSessionId()}`);
  return data?.messages || [];
}

let _lastTotal = 0;

export async function pollNew(): Promise<ChatMsg[]> {
  const data = await chatFetch(`/poll?session=${getSessionId()}&after=${_lastTotal}`);
  if (data?.total) _lastTotal = data.total;
  return data?.messages || [];
}

export function isOffline(): boolean { return _offline; }

export function resetSession(): void {
  _sessionId = null;
  _lastTotal = 0;
  _offline = false;
  localStorage.removeItem("chat_session_id");
}
