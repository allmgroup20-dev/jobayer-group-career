"use client";

import { useState, useRef, useEffect } from "react";
import { sendMessage, getHistory, pollNew } from "@/lib/chat/client";
import type { ChatMsg } from "@/lib/chat/client";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    if (!initialized) {
      setInitialized(true);
      getHistory().then(setMessages);
    }
  }, [open, initialized]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(async () => {
      const msgs = await pollNew();
      if (msgs.length) setMessages(prev => {
        const existing = new Set(prev.map(m => `${m.role}:${m.content}`));
        const newOnes = msgs.filter(m => !existing.has(`${m.role}:${m.content}`));
        return [...prev, ...newOnes];
      });
    }, 3000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    setMessages(prev => [...prev, { role: "user", content: text }]);
    const reply = await sendMessage(text);
    setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-[360px] max-w-[90vw] h-[520px] max-h-[80vh] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[#0F1E36] to-[#1a2f4e] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-semibold text-sm">Jobayer Group Career</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#0F1E36] text-white rounded-br-md"
                    : m.role === "agent"
                    ? "bg-yellow-100 text-gray-800 rounded-bl-md border border-yellow-200"
                    : "bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm border border-gray-100">
                  <div className="flex gap-1">
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
                placeholder="আপনার বার্তা লিখুন..."
                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#0F1E36] focus:ring-1 focus:ring-[#0F1E36]/20"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-[#0F1E36] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#1a2f4e] disabled:opacity-50 shrink-0"
              >
                পাঠান
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all ${
          open ? "bg-gray-600 rotate-45" : "bg-gradient-to-r from-[#0F1E36] to-[#1a2f4e] hover:scale-105"
        }`}
      >
        {open ? "+" : "💬"}
      </button>
    </div>
  );
}
