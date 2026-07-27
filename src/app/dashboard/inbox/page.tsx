"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

const CHAT_WORKER = "https://jgcareer-chat.your-worker.workers.dev";

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

export default function InboxPage() {
  const { lang } = useLanguageStore();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${CHAT_WORKER}/conversations`)
      .then(r => r.json())
      .then((d: any) => { setConvs(d.conversations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setMsgLoading(true);
    fetch(`${CHAT_WORKER}/history?session=${selected}`)
      .then(r => r.json())
      .then((d: any) => { setMessages(d.messages || []); setMsgLoading(false); })
      .catch(() => setMsgLoading(false));
  }, [selected]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  // Poll for new messages on selected conversation
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
    const workerPhone = localStorage.getItem("worker_id") || "agent";
    await fetch(`${CHAT_WORKER}/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: selected, message: replyText, agentPhone: workerPhone }),
    });
    setMessages(prev => [...prev, { role: "agent", content: `[You]: ${replyText}` }]);
    setReplyText("");
    setSending(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-[#0F1E36] mb-2">
        {lang === "bn" ? "ইনবক্স" : "Inbox"}
      </h1>
      <p className="text-gray-500 text-sm mb-6">
        {lang === "bn"
          ? "ওয়েবসাইট থেকে আসা সকল মেসেজ দেখুন এবং উত্তর দিন"
          : "View and reply to all messages from the website"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conversation List */}
        <div className="md:col-span-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-sm text-gray-700">
              {lang === "bn" ? "কনভারসেশন" : "Conversations"}
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))
            ) : convs.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">
                {lang === "bn" ? "কোনো মেসেজ নেই" : "No messages yet"}
              </div>
            ) : (
              convs.map(c => (
                <button
                  key={c.phone}
                  onClick={() => setSelected(c.phone)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    selected === c.phone ? "bg-blue-50 border-l-2 border-[#0F1E36]" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-gray-800 truncate">
                      {c.phone.length > 15 ? `${c.phone.slice(0, 15)}...` : c.phone}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {c.messageCount} msgs
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{c.lastMessage}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{c.updatedAt}</p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat View */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              {lang === "bn"
                ? "বাম পাশ থেকে একটি কনভারসেশন সিলেক্ট করুন"
                : "Select a conversation from the left"}
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="font-medium text-sm text-gray-700">{selected}</span>
              </div>
              <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {msgLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-start">
                      <Skeleton className="h-10 w-48 rounded-2xl" />
                    </div>
                  ))
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-12">
                    {lang === "bn" ? "কোনো বার্তা নেই" : "No messages"}
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#0F1E36] text-white rounded-br-md"
                          : m.role === "agent"
                          ? "bg-yellow-100 text-gray-800 rounded-bl-md border border-yellow-200"
                          : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                      }`}>
                        <p className="text-[10px] opacity-60 mb-0.5 font-medium">
                          {m.role === "user" ? "Customer" : m.role === "agent" ? "Agent" : "AI"}
                        </p>
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-200 p-3 bg-white">
                <div className="flex gap-2">
                  <input
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleReply()}
                    placeholder={lang === "bn" ? "জবাব লিখুন..." : "Type a reply..."}
                    className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F1E36]"
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyText.trim()}
                    className="bg-[#0F1E36] text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-[#1a2f4e] disabled:opacity-50"
                  >
                    {lang === "bn" ? "পাঠান" : "Send"}
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
