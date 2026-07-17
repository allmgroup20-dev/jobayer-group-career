"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { useSWRFetch } from "@/lib/use-swr-fetch";

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

export default function NotificationsPage() {
  const { lang } = useLanguageStore();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const workerId = typeof window !== "undefined" ? localStorage.getItem("worker_id") || "" : "";

  const params = new URLSearchParams({ workerId, limit: "100" });
  if (filter === "unread") params.set("unreadOnly", "1");
  const { data, loading } = useSWRFetch<{ notifications: Notification[]; unreadCount: number }>(
    workerId ? `/api/notifications?${params}` : null,
    { ttlMs: 180_000 }
  );

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markRead = async (id: number) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PUT" });
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString(lang === "bn" ? "bn-BD" : "en-US"); } catch { return d; }
  };

  const typeIcon = (t: string) => t === "success" ? "✅" : t === "warning" ? "⚠️" : t === "alert" ? "🔴" : "ℹ️";

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "bn" ? "বিজ্ঞপ্তি" : "Notifications"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {notifications.length} {lang === "bn" ? "টি বিজ্ঞপ্তি" : "notifications"}
              {unreadCount > 0 && ` (${unreadCount} ${lang === "bn" ? "না পড়া" : "unread"})`}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "all" ? "bg-primary text-white" : "bg-white border border-border text-text-secondary"}`}>
              {lang === "bn" ? "সব" : "All"}
            </button>
            <button onClick={() => setFilter("unread")} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === "unread" ? "bg-primary text-white" : "bg-white border border-border text-text-secondary"}`}>
              {lang === "bn" ? "না পড়া" : "Unread"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-secondary">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">{lang === "bn" ? "কোনো বিজ্ঞপ্তি নেই" : "No notifications"}</div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Card key={n.id} className={`!p-4 ${!n.is_read ? "border-l-4 border-l-primary" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-primary">{n.title}</span>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    {n.message && <p className="text-sm text-text-secondary mt-1">{n.message}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">{formatDate(n.created_at)}</span>
                      {n.link && (
                        <a href={n.link} className="text-xs text-primary hover:underline">
                          {lang === "bn" ? "দেখুন" : "View"} →
                        </a>
                      )}
                      {!n.is_read && (
                        <button onClick={() => markRead(n.id)} className="text-xs text-text-secondary hover:text-primary">
                          {lang === "bn" ? "পড়া হয়েছে" : "Mark read"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
