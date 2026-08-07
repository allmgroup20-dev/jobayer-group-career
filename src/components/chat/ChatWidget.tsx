"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { sendMessage, pollNew, isOffline } from "@/lib/chat/client";
import type { ChatMsg } from "@/lib/chat/client";

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOffline(isOffline());
  }, []);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const tick = async () => {
      const msgs = await pollNew();
      if (!active) return;
      setOffline(isOffline());
      if (msgs.length) {
        setMessages(prev => [...prev, ...msgs]);
      }
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => { active = false; clearInterval(id); };
  }, [open]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || offline) return;
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    const reply = await sendMessage(text);
    setLoading(false);
    if (reply) {
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    }
  }, [input, loading, offline]);

  return (
    <div className="fixed right-5 z-[9999] flex flex-col items-end gap-3 float-slot">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[380px] max-w-[92vw] h-[540px] max-h-[80vh] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[#0F1E36] to-[#1a2f4e] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                <ChatIcon />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">Jobayer Group Career</p>
                <p className="text-[10px] text-white/60">{offline ? "সার্ভার সংযুক্ত নয়" : "অনলাইনে থাকুন"}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white">
              <CloseIcon />
            </button>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/70">
            {messages.length === 0 && !loading && (
              <div className="text-center text-gray-400 text-sm py-8">
                <p className="text-3xl mb-2">👋</p>
                <p>আপনার প্রশ্ন লিখুন বা সাহায্য নিন</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#0F1E36] text-white rounded-br-sm"
                    : m.role === "agent"
                    ? "bg-amber-50 text-gray-800 rounded-bl-sm border border-amber-200"
                    : "bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 p-3 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder={offline ? "ওয়েট… সংযোগ ফিরে আসছে" : "আপনার বার্তা লিখুন..."}
                disabled={offline}
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]/20 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim() || offline}
                className="bg-[#0F1E36] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[#1a2f4e] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                <SendIcon />
                <span className="hidden sm:inline">পাঠান</span>
              </button>
            </div>
            {offline && (
              <p className="text-[10px] text-red-400 mt-1.5 text-center">
                চ্যাট সার্ভার বর্তমানে উপলব্ধ নয়। পরে আবার চেষ্টা করুন।
              </p>
            )}
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: open ? "#4B5563" : "linear-gradient(135deg, #0F1E36, #1a2f4e)",
        }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>
    </div>
  );
}