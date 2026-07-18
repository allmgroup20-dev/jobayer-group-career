"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguageStore } from "@/lib/store";
import Link from "next/link";

interface Notification {
  id: number;
  worker_id: string;
  title: string;
  message: string | null;
  type: string;
  link: string | null;
  is_read: number;
  created_at: string;
}

export function NotificationBell() {
  const { lang } = useLanguageStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") || "" : "";

  const load = async () => {
    if (!workerId) return;
    try {
      const res = await fetch(`/api/notifications?workerId=${workerId}&unreadOnly=1&limit=10`);
      const data = await res.json() as { notifications: Notification[]; unreadCount: number };
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  const markRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    const ids = notifications.map(n => n.id);
    if (ids.length === 0) return;
    await fetch("/api/notifications/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setNotifications([]);
    setUnreadCount(0);
  };

  useEffect(() => { load(); }, [workerId]);

  useEffect(() => {
    if (!open) return;
    const iv = setInterval(load, 120000);
    return () => clearInterval(iv);
  }, [open, workerId]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formatDate = (d: string) => {
    try { const diff = Date.now() - new Date(d).getTime(); const mins = Math.round(diff / 60000); if (mins < 60) return `${mins}m`; const hrs = Math.round(mins / 60); if (hrs < 24) return `${hrs}h`; return new Date(d).toLocaleDateString(); } catch { return d; }
  };

  const typeIcon = (t: string) => t === "success" ? "✅" : t === "warning" ? "⚠️" : t === "alert" ? "🔴" : "ℹ️";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-primary/5 transition-all text-text-secondary hover:text-primary"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm text-primary">
              {lang === "bn" ? "বিজ্ঞপ্তি" : "Notifications"}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                {lang === "bn" ? "সব পড়া হয়েছে" : "Mark all read"}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-text-secondary text-sm">
                {lang === "bn" ? "কোনো বিজ্ঞপ্তি নেই" : "No notifications"}
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-border last:border-0">
                  <span className="text-base mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={n.link || "#"} onClick={() => markRead(n.id)} className="text-sm font-medium text-primary block truncate">
                      {n.title}
                    </Link>
                    {n.message && <p className="text-xs text-text-secondary truncate mt-0.5">{n.message}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                  <button onClick={() => markRead(n.id)} className="text-xs text-gray-400 hover:text-primary shrink-0 mt-1">✕</button>
                </div>
              ))
            )}
          </div>
          <Link
            href="/dashboard/notifications"
            className="block text-center text-sm text-primary font-medium py-3 border-t border-border hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            {lang === "bn" ? "সব বিজ্ঞপ্তি দেখুন" : "View all notifications"} →
          </Link>
        </div>
      )}
    </div>
  );
}
