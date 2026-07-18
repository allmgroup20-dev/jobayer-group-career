"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface SessionRow {
  id: number;
  worker_id: string;
  session_start: string;
  session_end: string | null;
  duration_seconds: number | null;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen_resolution: string | null;
  referrer: string | null;
  city: string | null;
  country: string | null;
  language: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  created_at: string | null;
}

interface SessionDetail {
  session: SessionRow;
  events: { event_type: string; page_url: string; page_category: string; time_spent_seconds: number; created_at: string }[];
}

export default function CompanySessionsPage() {
  const { lang } = useLanguageStore();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/track/events?limit=100")
      .then(r => r.json())
      .then(() => {
        // We need a separate endpoint for sessions. Let me query via a custom approach
        // For now, load from the existing data
        return fetch("/api/customer360/_sessions");
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Actually let's make a direct DB query via a custom endpoint
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/track/analytics?allSessions=1`);
      const data = await res.json() as { sessions: SessionRow[] };
      setSessions(data.sessions || []);
    } catch {} finally { setLoading(false); }
  };

  const loadSessionDetail = async (sessionStart: string) => {
    setDetailLoading(true);
    setSelectedSession(null);
    try {
      const res = await fetch(`/api/track/session/${encodeURIComponent(sessionStart)}`);
      const data = await res.json() as SessionDetail;
      setSelectedSession(data);
    } catch {} finally { setDetailLoading(false); }
  };

  const filtered = sessions.filter(s =>
    s.worker_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.device_type?.toLowerCase().includes(search.toLowerCase()) ||
    s.browser?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString(lang === "bn" ? "bn-BD" : "en-US"); } catch { return d; }
  };

  const deviceIcon = (dt: string | null) => dt === "mobile" ? "📱" : dt === "tablet" ? "📟" : "💻";

  const eventIcon = (type: string) => {
    const icons: Record<string, string> = { page_view: "👁️", click: "👆", search: "🔍", product_view: "📦", add_to_cart: "🛒", purchase: "✅" };
    return icons[type] || "•";
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "bn" ? "সেশন ইন্টেলিজেন্স" : "Session Intelligence"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {sessions.length} {lang === "bn" ? "টি সেশন" : "sessions"}
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text" placeholder={lang === "bn" ? "ওয়ার্কার/ডিভাইস অনুসন্ধান..." : "Search worker/device..."}
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-56 px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button onClick={loadSessions} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90">
              {lang === "bn" ? "রিফ্রেশ" : "Refresh"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session List */}
          <div className={`${selectedSession ? "hidden lg:block" : ""} lg:col-span-1`}>
            <Card className="!p-0 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-text-secondary text-sm">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm">{lang === "bn" ? "কোন সেশন নেই" : "No sessions"}</div>
              ) : (
                filtered.slice(0, showAll ? filtered.length : 50).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => loadSessionDetail(s.session_start)}
                    className={`w-full text-left p-4 border-b border-border last:border-0 hover:bg-gray-50 transition-all ${selectedSession?.session.session_start === s.session_start ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{deviceIcon(s.device_type)}</span>
                      <span className="text-xs font-mono text-text-secondary truncate">{s.worker_id}</span>
                      {s.duration_seconds && (
                        <span className="ml-auto text-xs text-text-secondary">{Math.round(s.duration_seconds / 60)}m</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="capitalize">{s.device_type || "—"}</span>
                      <span>·</span>
                      <span>{s.browser || "—"}</span>
                      {s.city && <><span>·</span><span>{s.city}</span></>}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{formatDate(s.session_start)}</div>
                  </button>
                ))
              )}
              {!showAll && filtered.length > 50 && (
                <button onClick={() => setShowAll(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {lang === "bn" ? `আরও ${filtered.length - 50}টি দেখুন` : `Show ${filtered.length - 50} more`}
                </button>
              )}
            </Card>
          </div>

          {/* Session Detail */}
          <div className={`${!selectedSession ? "hidden lg:block" : ""} lg:col-span-2`}>
            {detailLoading ? (
              <div className="text-center py-12 text-text-secondary">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</div>
            ) : selectedSession ? (
              <div className="space-y-4">
                {/* Session Info */}
                <Card className="!p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm text-primary">
                      {lang === "bn" ? "সেশন বিস্তারিত" : "Session Details"}
                    </h3>
                    <button onClick={() => setSelectedSession(null)} className="text-xs text-text-secondary hover:text-primary lg:hidden">✕</button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    {[
                      { label: lang === "bn" ? "শুরু" : "Start", val: formatDate(selectedSession.session.session_start) },
                      { label: lang === "bn" ? "শেষ" : "End", val: formatDate(selectedSession.session.session_end) || lang === "bn" ? "চলমান" : "Active" },
                      { label: lang === "bn" ? "সময়" : "Duration", val: selectedSession.session.duration_seconds ? `${Math.round(selectedSession.session.duration_seconds / 60)}m ${selectedSession.session.duration_seconds % 60}s` : "—" },
                      { label: lang === "bn" ? "ডিভাইস" : "Device", val: selectedSession.session.device_type || "—" },
                      { label: lang === "bn" ? "ব্রাউজার" : "Browser", val: `${selectedSession.session.browser || "—"} / ${selectedSession.session.os || "—"}` },
                      { label: lang === "bn" ? "স্ক্রিন" : "Screen", val: selectedSession.session.screen_resolution || "—" },
                      { label: lang === "bn" ? "ভাষা" : "Language", val: selectedSession.session.language || "—" },
                      { label: lang === "bn" ? "অবস্থান" : "Location", val: [selectedSession.session.city, selectedSession.session.country].filter(Boolean).join(", ") || "—" },
                      { label: "UTM", val: [selectedSession.session.utm_source, selectedSession.session.utm_campaign].filter(Boolean).join(" / ") || "—" },
                      { label: lang === "bn" ? "রেফারার" : "Referrer", val: selectedSession.session.referrer || "—", fullWidth: true },
                      { label: "IP", val: selectedSession.session.ip_address || "—" },
                      { label: lang === "bn" ? "মোট ইভেন্ট" : "Events", val: String(selectedSession.events.length) },
                    ].map((item, i) => (
                      <div key={i} className={`${(item as any).fullWidth ? "col-span-full" : ""} bg-gray-50 rounded-lg p-3`}>
                        <div className="text-xs text-text-secondary">{item.label}</div>
                        <div className="font-medium text-primary text-sm truncate">{item.val}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Page Flow Timeline */}
                <Card className="!p-5">
                  <h3 className="font-semibold text-sm text-primary mb-4">
                    {lang === "bn" ? "পৃষ্ঠা ফ্লো" : "Page Flow Timeline"} ({selectedSession.events.length} {lang === "bn" ? "টি ইভেন্ট" : "events"})
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div className="space-y-0">
                      {selectedSession.events.map((e, i) => {
                        const isFirst = i === 0;
                        const isLast = i === selectedSession.events.length - 1;
                        return (
                          <div key={i} className="relative flex items-start gap-4 pb-4 last:pb-0">
                            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${isFirst ? "bg-primary text-white" : isLast && e.event_type !== "page_view" ? "bg-green-500 text-white" : "bg-gray-100 text-text-secondary"}`}>
                              {eventIcon(e.event_type)}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-primary capitalize">{e.event_type?.replace(/_/g, " ")}</span>
                                <span className="text-xs text-gray-400">{formatDate(e.created_at)}</span>
                              </div>
                              {e.page_url && <p className="text-xs text-text-secondary truncate">{e.page_url}</p>}
                              {e.page_category && <span className="inline-block text-xs text-text-secondary bg-gray-100 px-1.5 py-0.5 rounded mt-0.5">{e.page_category}</span>}
                              {e.time_spent_seconds > 0 && <span className="text-xs text-gray-400 ml-1">{e.time_spent_seconds}s</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-text-secondary text-sm">
                {lang === "bn" ? "বাম পাশ থেকে একটি সেশন নির্বাচন করুন" : "Select a session from the left"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
