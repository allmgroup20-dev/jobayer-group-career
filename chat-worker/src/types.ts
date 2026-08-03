export interface Env {
  DB: D1Database;
  SITE_NAME?: string;
  OPENROUTER_API_KEY?: string;
  CHAT_API_SECRET?: string;
  ALLOWED_ORIGINS?: string;
  BRAIN_API_URL?: string;
}

export interface ChatMessage {
  id?: number;
  phone: string;
  role: "user" | "assistant" | "agent";
  content: string;
  source: "web" | "whatsapp" | "messenger" | "telegram";
  created_at?: string;
}

export interface AgentReply {
  sessionId: string;
  message: string;
  agentPhone: string;
}

export interface D1Conversation {
  id: number;
  phone: string;
  role: string;
  messages: string;
  language: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookBody {
  message: string;
  sessionId?: string;
  phone?: string;
  name?: string;
}

export interface PollResponse {
  messages: { role: string; content: string; created_at: string }[];
  hasMore: boolean;
}
