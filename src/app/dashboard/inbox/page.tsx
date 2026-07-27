"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguageStore } from "@/lib/store";

interface Conversation {
  phone: string;
  name?: string;
  last_message: string;
  last_time: string;
  unread: number;
  source: string;
}

interface Message {
  id: number;
  role: string;
  content: string;
  created_at: string;
}

export default function InboxPage() {
  const { lang } = useLanguageStore();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Get worker phone from localStorage
  const workerPhone = typeof window !== "undefined" ? localStorage.getItem("worker_phone") || localStorage.getItem("worker_id") || "" : "";

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  // Load conversation list
  useEffect(() => {
    fetch("/api/chat/conversations?agent=" + encodeURIComponent(workerPhone))
      .then((r) => r.json())
      .then((d: any) => {
        if (d.conversations) setConvs(d.conversations);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workerPhone]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedPhone) return;
    fetch(`/api/chat/history?phone=${encodeURIComponent(selectedPhone)}&limit=100`)
      .then((r) => r.json())
      .then((d: any) => {
        if (d.messages) setMessages(d.messages);
        setTimeout(scrollToBottom, 100);
      })
      .catch(() => {});
  }, [selectedPhone]);

  // Real-time updates via SSE
  useEffect(() => {
    if (!selectedPhone) return;
    const evtSource = new EventSource(`/api/chat/realtime?phone=${encodeURIComponent(selectedPhone)}`);
    evtSource.onmessage = (e: MessageEvent) => {
      try {
        const data: any = JSON.parse(e.data as string);
        if (data.type === "heartbeat" || data.type === "keepalive" || data.type === "connected") return;
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.id)) return prev;
          return [...prev, data];
        });
        setTimeout(scrollToBottom, 50);
      } catch {}
    };
    return () => evtSource.close();
  }, [selectedPhone]);

  const sendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedPhone) return;
    const text = replyText.trim();
    setReplyText("");

    const tempMsg: Message = {
      id: Date.now(), role: "assistant", content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(scrollToBottom, 50);

    await fetch("/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: selectedPhone, text, agentName: workerPhone }),
    });
  }, [replyText, selectedPhone, workerPhone]);

  const timeAgo = (t: string) => {
    const diff = Date.now() - new Date(t).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-5xl mx-auto my-4">
      {/* Conversation List */}
      <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-3 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-800">{lang === "bn" ? "ইনবক্স" : "Inbox"}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm mt-8">
              {lang === "bn" ? "কোনো কনভারসেশন নেই" : "No conversations yet"}
            </div>
          ) : convs.map((c) => (
            <button
              key={c.phone}
              onClick={() => setSelectedPhone(c.phone)}
              className={`w-full text-left px-3 py-3 border-b border-gray-100 hover:bg-white transition-colors cursor-pointer ${
                selectedPhone === c.phone ? "bg-white shadow-sm" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {(c.name || c.phone)[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-sm text-gray-800 truncate">
                      {c.name || c.phone}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(c.last_time)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className="text-xs text-gray-500 truncate">{c.last_message?.slice(0, 60)}</span>
                    {c.unread > 0 && (
                      <span className="bg-[#25D366] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0">
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedPhone ? (
          <>
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-sm font-bold">
                {selectedPhone[0].toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">{selectedPhone}</div>
                <div className="text-[11px] text-gray-400">Online</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 bg-[#ECE5DD] space-y-2">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm mt-12">
                  {lang === "bn" ? "কোনো মেসেজ নেই" : "No messages yet"}
                </div>
              ) : messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#DCF8C6] text-gray-800 rounded-br-sm"
                      : "bg-white text-gray-800 rounded-bl-sm"
                  }`}>
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    <div className="text-[10px] mt-1 text-gray-400">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply Input */}
            <div className="px-3 py-2 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                placeholder={lang === "bn" ? "লিখুন..." : "Type a reply..."}
                className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
              />
              <button
                onClick={sendReply}
                disabled={!replyText.trim()}
                className="w-9 h-9 bg-primary disabled:bg-gray-300 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {lang === "bn" ? "একটি কনভারসেশন সিলেক্ট করুন" : "Select a conversation"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
