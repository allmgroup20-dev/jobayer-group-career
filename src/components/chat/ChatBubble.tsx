"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ChatPanel from "./ChatPanel";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [unread, setUnread] = useState(0);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const stored = localStorage.getItem("chat_session_id");
    const workerPhone = localStorage.getItem("worker_phone") || localStorage.getItem("worker_id") || "";
    if (workerPhone) setPhone(workerPhone);

    if (stored) {
      setSessionId(stored);
    } else {
      fetch("/api/chat/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: workerPhone || undefined }),
      })
        .then((r) => r.json())
        .then((d: any) => {
          if (d.sessionId) {
            setSessionId(d.sessionId);
            localStorage.setItem("chat_session_id", d.sessionId);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleNewMessage = useCallback(() => {
    if (!open) setUnread((u) => u + 1);
  }, [open]);

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => { setOpen(!open); setUnread(0); }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Chat"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200">
          <ChatPanel sessionId={sessionId} phone={phone} onNewMessage={handleNewMessage} />
        </div>
      )}
    </>
  );
}
