"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface SegmentItem { segment: string; count: number }
interface TopInterest { category: string; avgScore: number; workerCount: number }
interface EventStat { event_type: string; count: number }

export default function CompanyAnalyticsPage() {
  const { lang } = useLanguageStore();
  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [topInterests, setTopInterests] = useState<TopInterest[]>([]);
  const [eventStats, setEventStats] = useState<EventStat[]>([]);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);

  const scoredWorkers = useMemo(() =>
    segments.filter(s => s.segment !== "unscored").reduce((s, r) => s + r.count, 0),
    [segments]
  );

  useEffect(() => {
    fetch("/api/track/analytics")
      .then(r => r.json() as Promise<Record<string, unknown>>)
      .then(data => {
        if (data.segments) setSegments(data.segments as SegmentItem[]);
        if (data.topInterestCategories) setTopInterests(data.topInterestCategories as TopInterest[]);
        if (data.eventStats) setEventStats(data.eventStats as EventStat[]);
        setTotalWorkers(data.totalWorkers as number || 0);
        setTotalEvents(data.totalEvents as number || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const segmentColors: Record<string, string> = {
    vip: "bg-amber-50 text-amber-700 border-amber-200",
    active: "bg-green-50 text-green-700 border-green-200",
    at_risk: "bg-orange-50 text-orange-700 border-orange-200",
    churned: "bg-red-50 text-red-700 border-red-200",
    new: "bg-blue-50 text-blue-700 border-blue-200",
    unscored: "bg-gray-50 text-gray-600 border-gray-200",
  };

  const maxSegmentCount = Math.max(...segments.map(s => s.count), 1);

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "অ্যানালিটিক্স" : "Analytics"}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "ব্যবহারকারীর আচরণ ও আগ্রহের সারাংশ" : "User behavior & interest overview"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{lang === "bn" ? "মোট সদস্য" : "Total Workers"}</p>
            <p className="text-3xl font-bold text-primary mt-1">{totalWorkers}</p>
          </Card>
          <Card>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{lang === "bn" ? "মোট ইভেন্ট" : "Total Events"}</p>
            <p className="text-3xl font-bold text-primary mt-1">{totalEvents.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">{lang === "bn" ? "স্কোরকৃত সদস্য" : "Scored Workers"}</p>
            <p className="text-3xl font-bold text-primary mt-1">{scoredWorkers}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "সেগমেন্ট বিতরণ" : "Segment Distribution"}</h3>
            <div className="space-y-3">
              {segments.map(s => {
                const pct = Math.round((s.count / maxSegmentCount) * 100);
                return (
                  <div key={s.segment}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${segmentColors[s.segment] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                        {s.segment}
                      </span>
                      <span className="text-xs text-text-secondary">{s.count} ({totalWorkers > 0 ? Math.round(s.count / totalWorkers * 100) : 0}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        s.segment === "vip" ? "bg-amber-400" :
                        s.segment === "active" ? "bg-green-400" :
                        s.segment === "at_risk" ? "bg-orange-400" :
                        s.segment === "churned" ? "bg-red-400" :
                        s.segment === "new" ? "bg-blue-400" :
                        "bg-gray-300"
                      }`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {segments.length === 0 && <p className="text-sm text-text-secondary text-center py-4">{lang === "bn" ? "কোনো ডেটা নেই" : "No data"}</p>}
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "সর্বোচ্চ আগ্রহ" : "Top Interests"}</h3>
            <div className="space-y-2">
              {topInterests.map((item, i) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-xs font-medium text-text-secondary truncate">{item.category.replace(/_/g, " ")}</span>
                    <span className="text-xs text-text-secondary">{item.workerCount} {lang === "bn" ? "জন" : "users"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full" style={{ width: `${item.avgScore}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-primary w-6 text-right">{item.avgScore}</span>
                  </div>
                </div>
              ))}
              {topInterests.length === 0 && <p className="text-sm text-text-secondary text-center py-4">{lang === "bn" ? "কোনো আগ্রহের ডেটা নেই" : "No interest data"}</p>}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary">{lang === "bn" ? "কনভার্সন ফানেল" : "Conversion Funnel"}</h3>
              <a href="/company/funnel" className="text-xs text-primary hover:underline">
                {lang === "bn" ? "পূর্ণ বিশ্লেষণ" : "Full Analysis"}
              </a>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[{s:"visit",ico:"👁️",bn:"ভিজিট"},{s:"interest",ico:"🔍",bn:"আগ্রহ"},{s:"view",ico:"📦",bn:"দেখা"},{s:"cart",ico:"🛒",bn:"কার্ট"},{s:"purchase",ico:"✅",bn:"ক্রয়"}].map((item) => {
                let cnt = 0;
                for (const e of eventStats) {
                  if (item.s === "visit" && e.event_type === "page_view") cnt += e.count;
                  else if (item.s === "interest" && (e.event_type === "search" || e.event_type === "product_view")) cnt += e.count;
                  else if (item.s === "view" && e.event_type === "product_view") cnt += e.count;
                  else if (item.s === "cart" && e.event_type === "add_to_cart") cnt += e.count;
                  else if (item.s === "purchase" && e.event_type === "purchase") cnt += e.count;
                }
                return (
                  <div key={item.s} className="text-center p-2 rounded-lg bg-gray-50">
                    <div className="text-lg">{item.ico}</div>
                    <div className="text-xs text-text-secondary capitalize mt-1">{lang === "bn" ? item.bn : item.s}</div>
                    <div className="text-sm font-bold text-primary">{cnt.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
          <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "ইভেন্ট টাইপ" : "Event Types"}</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {eventStats.map(e => {
              const pct = totalEvents > 0 ? Math.round(e.count / totalEvents * 100) : 0;
              return (
                <div key={e.event_type} className="p-3 rounded-xl bg-gray-50">
                  <p className="text-lg font-bold text-primary">{e.count.toLocaleString()}</p>
                  <p className="text-xs text-text-secondary capitalize">{e.event_type.replace(/_/g, " ")}</p>
                  <div className="mt-1.5 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {eventStats.length === 0 && <p className="text-sm text-text-secondary col-span-4 text-center py-4">{lang === "bn" ? "কোনো ইভেন্ট নেই" : "No events"}</p>}
          </div>
        </Card>
      </div>
    </div>
    </div>
  );
}
