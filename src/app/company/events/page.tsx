"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface EventRow {
  id: number;
  worker_id: string;
  event_type: string;
  page_url: string | null;
  page_category: string | null;
  search_keyword: string | null;
  product_id: string | null;
  product_category: string | null;
  time_spent_seconds: number | null;
  device_info: string | null;
  session_id: string | null;
  created_at: string | null;
}

const EVENT_TYPES = ["", "page_view", "search", "click", "product_view", "add_to_cart", "purchase"];

export default function CompanyEventsPage() {
  const { lang } = useLanguageStore();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 25;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (filterType) params.set("eventType", filterType);
      if (search) params.set("search", search);
      const res = await fetch(`/api/track/events?${params}`);
      const data = await res.json() as { events: EventRow[]; total: number };
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, filterType]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString(lang === "bn" ? "bn-BD" : "en-US"); } catch { return d; }
  };

  const eventBadge = (type: string) => {
    const colors: Record<string, string> = {
      page_view: "bg-blue-50 text-blue-600",
      search: "bg-purple-50 text-purple-600",
      click: "bg-orange-50 text-orange-600",
      product_view: "bg-green-50 text-green-600",
      add_to_cart: "bg-yellow-50 text-yellow-600",
      purchase: "bg-emerald-50 text-emerald-600",
    };
    return `text-xs px-2 py-0.5 rounded-full font-medium ${colors[type] || "bg-gray-50 text-gray-600"}`;
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "ইভেন্ট লগ" : "Event Logs"}</h1>
            <p className="text-sm text-text-secondary mt-1">{total.toLocaleString()} {lang === "bn" ? "টি ইভেন্ট" : "events"}</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="input-field text-sm !py-2">
              <option value="">{lang === "bn" ? "সব টাইপ" : "All types"}</option>
              {EVENT_TYPES.filter(Boolean).map(t => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={lang === "bn" ? "খুঁজুন..." : "Search..."} className="input-field text-sm !py-2 w-40" />
            <button type="submit" className="btn-primary text-xs !px-4 !py-2">{lang === "bn" ? "অনুসন্ধান" : "Search"}</button>
          </form>
        </div>

        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-border">
                  <th className="text-left p-3 font-semibold text-primary text-xs">{lang === "bn" ? "ধরন" : "Type"}</th>
                  <th className="text-left p-3 font-semibold text-primary text-xs">{lang === "bn" ? "সদস্য" : "Worker"}</th>
                  <th className="text-left p-3 font-semibold text-primary text-xs">{lang === "bn" ? "পাতা" : "Page"}</th>
                  <th className="text-left p-3 font-semibold text-primary text-xs">{lang === "bn" ? "অনুসন্ধান" : "Search"}</th>
                  <th className="text-left p-3 font-semibold text-primary text-xs">{lang === "bn" ? "পণ্য" : "Product"}</th>
                  <th className="text-left p-3 font-semibold text-primary text-xs">{lang === "bn" ? "সময়" : "Time"}</th>
                  <th className="text-left p-3 font-semibold text-primary text-xs">{lang === "bn" ? "তারিখ" : "Date"}</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="p-3"><span className={eventBadge(ev.event_type)}>{ev.event_type.replace(/_/g, " ")}</span></td>
                    <td className="p-3"><span className="text-xs font-mono text-text-secondary">{ev.worker_id?.slice(0, 12)}</span></td>
                    <td className="p-3 max-w-[200px] truncate text-xs text-text-secondary" title={ev.page_url || ""}>{ev.page_url || "—"}</td>
                    <td className="p-3 max-w-[150px] truncate text-xs text-text-secondary" title={ev.search_keyword || ""}>{ev.search_keyword || "—"}</td>
                    <td className="p-3 text-xs text-text-secondary">{ev.product_id || ev.product_category || "—"}</td>
                    <td className="p-3 text-xs text-text-secondary">{ev.time_spent_seconds ? `${ev.time_spent_seconds}s` : "—"}</td>
                    <td className="p-3 text-xs text-text-secondary whitespace-nowrap">{formatDate(ev.created_at)}</td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-text-secondary text-sm">{lang === "bn" ? "কোনো ইভেন্ট নেই" : "No events found"}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-primary text-xs !px-3 !py-1.5 disabled:opacity-50">{lang === "bn" ? "পেছনে" : "Prev"}</button>
            <span className="text-xs text-text-secondary">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-primary text-xs !px-3 !py-1.5 disabled:opacity-50">{lang === "bn" ? "পরবর্তী" : "Next"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
