"use client";
import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

interface Props {
  sessionId: string;
  phone: string;
  onNewMessage?: () => void;
}

const WELCOME_MSG: Message = {
  id: -1,
  role: "assistant",
  content: "👋 Welcome! I'm your AI assistant from Jobayer Group Career. How can I help you today? Feel free to ask about our programs, pricing, or anything else!",
  created_at: new Date().toISOString(),
};

export default function ChatPanel({ sessionId, phone, onNewMessage }: Props) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, agentTyping]);

  // Load history on mount
  useEffect(() => {
    const params = new URLSearchParams({ sessionId });
    fetch(`/api/chat/history?${params}`)
      .then((r) => r.json())
      .then((d: any) => {
        if (d.messages?.length > 0) {
          setMessages(d.messages);
          setShowSuggestions(false);
        }
      })
      .catch(() => {});
  }, [sessionId]);

  // SSE listener for agent replies
  useEffect(() => {
    if (!phone) return;
    const evtSource = new EventSource(`/api/chat/realtime?phone=${encodeURIComponent(phone)}`);
    evtSource.onmessage = (e: MessageEvent) => {
      try {
        const data: any = JSON.parse(e.data as string);
        if (data.type === "heartbeat" || data.type === "keepalive" || data.type === "connected") return;
        if (data.role === "assistant") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.id)) return prev;
            return [...prev, data];
          });
          onNewMessage?.();
        }
      } catch {}
    };
    return () => evtSource.close();
  }, [phone, onNewMessage]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    setShowSuggestions(false);

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setAgentTyping(true);

    try {
      const res = await fetch("/api/chat/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          phone: phone || undefined,
          text: text.trim(),
        }),
      });
      const data: any = await res.json();
      if (data.reply) {
        const aiMsg: Message = {
          id: Date.now() + 1,
          role: "assistant",
          content: data.reply as string,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      const errMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
    setLoading(false);
    setAgentTyping(false);
  };

  const suggestions = [
    "What programs do you offer?",
    "How can I earn money?",
    "Tell me about pricing",
    "I want to join",
    "কিভাবে জয়েন করব?",
    "কমিশন কত?",
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#075E54] to-[#128C7E] text-white px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
          AI
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">Jobayer Group AI</div>
          <div className="text-[11px] text-white/70">{agentTyping ? "Typing..." : "Online"}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 bg-[#ECE5DD] space-y-2">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {agentTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length <= 2 && (
        <div className="px-3 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-2 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white transition-all"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-[#25D366] disabled:bg-gray-300 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </>
  );
}
