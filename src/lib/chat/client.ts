const CHAT_WORKER = "https://jgcareer-chat.your-worker.workers.dev";

export interface ChatMsg {
  role: "user" | "assistant" | "agent";
  content: string;
  created_at?: string;
}

let _sessionId: string | null = null;

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

export async function sendMessage(text: string): Promise<string> {
  const res = await fetch(`${CHAT_WORKER}/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text, sessionId: getSessionId() }),
  });
  const data: any = await res.json();
  return data.reply || "দুঃখিত, উত্তর পেতে ব্যর্থ হয়েছে।";
}

export async function getHistory(): Promise<ChatMsg[]> {
  const res = await fetch(`${CHAT_WORKER}/history?session=${getSessionId()}`);
  const data: any = await res.json();
  return data.messages || [];
}

let _lastTotal = 0;

export async function pollNew(): Promise<ChatMsg[]> {
  const res = await fetch(`${CHAT_WORKER}/poll?session=${getSessionId()}&after=${_lastTotal}`);
  const data: any = await res.json();
  if (data.total) _lastTotal = data.total;
  return data.messages || [];
}

export function resetSession(): void {
  _sessionId = null;
  _lastTotal = 0;
  localStorage.removeItem("chat_session_id");
}
