"use client";

import { useState, useEffect, useRef } from "react";

const CHAT_WORKER = "https://jgcareer-chat.allmgroup20.workers.dev";

interface Conversation {
  phone: string;
  lastMessage: string;
  messageCount: number;
  language: string;
  updatedAt: string;
}

interface ChatMsg {
  role: string;
  content: string;
  created_at?: string;
}

export default function CompanyChatPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${CHAT_WORKER}/conversations`)
      .then(r => r.json())
      .then((d: any) => { setConvs(d.conversations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`${CHAT_WORKER}/history?session=${selected}`)
      .then(r => r.json())
      .then((d: any) => setMessages(d.messages || []));
  }, [selected]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!selected) return;
    const id = setInterval(async () => {
      const r = await fetch(`${CHAT_WORKER}/poll?session=${selected}&after=${messages.length}`);
      const d: any = await r.json();
      if (d.messages?.length) setMessages(prev => [...prev, ...d.messages]);
    }, 3000);
    return () => clearInterval(id);
  }, [selected, messages.length]);

  const handleReply = async () => {
    if (!replyText.trim() || !selected || sending) return;
    setSending(true);
    await fetch(`${CHAT_WORKER}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selected, message: replyText, agentPhone: "admin" }),
    });
    setMessages(prev => [...prev, { role: "agent", content: `[Admin]: ${replyText}` }]);
    setReplyText("");
    setSending(false);
  };

  const filtered = convs.filter(c =>
    c.phone.toLowerCase().includes(search.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 bg-white flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#0F1E36]"
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No conversations</div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.phone}
                  onClick={() => setSelected(c.phone)}
                  className={`w-full text-left p-3 hover:bg-gray-50 ${
                    selected === c.phone ? "bg-blue-50 border-l-2 border-[#0F1E36]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{c.phone}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{c.messageCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{c.lastMessage}</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">{c.updatedAt}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">💬</div>
                <p>Select a conversation to view</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-2 shrink-0">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="font-medium text-sm">{selected}</span>
              </div>
              <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-[#0F1E36] text-white rounded-br-md"
                        : m.role === "agent"
                        ? "bg-yellow-100 border border-yellow-200 rounded-bl-md"
                        : "bg-white border border-gray-200 rounded-bl-md"
                    }`}>
                      <p className="text-[10px] opacity-60 mb-0.5 font-medium">
                        {m.role === "user" ? "Customer" : m.role === "agent" ? "Agent" : "AI"}
                      </p>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white border-t border-gray-200 p-3 shrink-0">
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleReply()}
                    placeholder="Type a reply..."
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F1E36]"
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="bg-[#0F1E36] text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-[#1a2f4e] disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
