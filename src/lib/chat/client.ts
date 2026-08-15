const CHAT_WORKER = "https://jgcareer-chat.earner.workers.dev";

export interface ChatMsg {
  role: "user" | "assistant" | "agent";
  content: string;
  created_at?: string;
}

let _sessionId: string | null = null;
let _offline = false;
let _lastTotal = 0;

function getSessionId(): string {
  if (_sessionId) return _sessionId;
  let stored = localStorage.getItem("chat_session_id");
  if (!stored) {
    stored = `web_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem("chat_session_id", stored);
  }
  _sessionId = stored;
  return stored;
}

async function chatFetch(path: string, init?: RequestInit): Promise<any> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${CHAT_WORKER}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    _offline = false;
    return data;
  } catch {
    _offline = true;
    return null;
  }
}

export async function sendMessage(text: string): Promise<string> {
  const sessionId = getSessionId();
  const data = await chatFetch("/webhook", {
    method: "POST",
    body: JSON.stringify({ message: text, sessionId }),
  });
  if (data?.total) _lastTotal = data.total;
  return data?.reply || "";
}

export async function pollNew(): Promise<ChatMsg[]> {
  const data = await chatFetch(`/poll?session=${getSessionId()}&after=${_lastTotal}`);
  if (data?.total != null) _lastTotal = data.total;
  return data?.messages || [];
}

export function isOffline(): boolean { return _offline; }

export function resetSession(): void {
  _sessionId = null;
  _lastTotal = 0;
  _offline = false;
  localStorage.removeItem("chat_session_id");
}