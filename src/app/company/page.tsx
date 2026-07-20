"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, useRef } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card, StatCard } from "@/components/ui/Card";
import { fetchWithCache } from "@/lib/use-swr-fetch";

interface AgentStats { total: number; active: number; error: number; totalReports: number; totalSubmissions: number; }
interface SegmentItem { segment: string; count: number }
interface EventStat { event_type: string; count: number }
interface Predictions { total_scored: number; churn_risk: number; high_intent: number; high_lead: number; high_ltv: number; avg_churn: number; avg_intent: number; avg_lead: number; }

const linkGroups = [
  {
    label: { en: "People", bn: "সদস্য" },
    links: [
      { href: "/company/members", en: "All Members", bn: "সকল সদস্য", icon: "👥", color: "bg-blue-50 text-blue-600" },
      { href: "/company/users", en: "Users", bn: "ব্যবহারকারী", icon: "🔐", color: "bg-pink-50 text-pink-600" },
      { href: "/company/commissions", en: "Commissions", bn: "আয়", icon: "💰", color: "bg-emerald-50 text-emerald-600" },
    ],
  },
  {
    label: { en: "Products & Orders", bn: "পণ্য ও অর্ডার" },
    links: [
      { href: "/company/products", en: "Manage Products", bn: "পণ্য ব্যবস্থাপনা", icon: "📦", color: "bg-green-50 text-green-600" },
      { href: "/company/levels", en: "Commission Levels", bn: "আয় লেভেল", icon: "📊", color: "bg-purple-50 text-purple-600" },
      { href: "/dashboard/ai-predictions", en: "Predictions", bn: "প্রেডিকশন", icon: "🔮", color: "bg-violet-50 text-violet-600" },
    ],
  },
  {
    label: { en: "AI & Automation", bn: "এআই ও অটোমেশন" },
    links: [
      { href: "/company/ai", en: "AI Hub", bn: "এআই হাব", icon: "🤖", color: "bg-indigo-50 text-indigo-600" },
      { href: "/company/automation", en: "Automation", bn: "অটোমেশন", icon: "⚡", color: "bg-amber-50 text-amber-600" },
      { href: "/company/sentiment", en: "Sentiment", bn: "সেন্টিমেন্ট", icon: "📈", color: "bg-rose-50 text-rose-600" },
      { href: "/company/ai-distribution", en: "AI Distribution", bn: "এআই বিতরণ", icon: "📚", color: "bg-emerald-50 text-emerald-600" },
    ],
  },
  {
    label: { en: "Marketing (Kotler)", bn: "মার্কেটিং (Kotler)" },
    links: [
      { href: "/company/segments", en: "Segments", bn: "সেগমেন্ট", icon: "🎯", color: "bg-blue-50 text-blue-600" },
      { href: "/company/brand-dashboard", en: "Brand", bn: "ব্র্যান্ড", icon: "🏷️", color: "bg-purple-50 text-purple-600" },
      { href: "/company/pricing", en: "Pricing", bn: "প্রাইসিং", icon: "💰", color: "bg-green-50 text-green-600" },
      { href: "/company/positioning", en: "Positioning", bn: "পজিশনিং", icon: "📍", color: "bg-orange-50 text-orange-600" },
      { href: "/company/campaigns", en: "Campaigns", bn: "ক্যাম্পেইন", icon: "📢", color: "bg-red-50 text-red-600" },
      { href: "/company/plc-dashboard", en: "PLC", bn: "পিএলসি", icon: "📈", color: "bg-teal-50 text-teal-600" },
      { href: "/company/loyalty", en: "Loyalty", bn: "লয়ালটি", icon: "❤️", color: "bg-pink-50 text-pink-600" },
      { href: "/company/global-markets", en: "Global", bn: "গ্লোবাল", icon: "🌍", color: "bg-indigo-50 text-indigo-600" },
      { href: "/company/csr", en: "CSR", bn: "সিএসআর", icon: "🌱", color: "bg-emerald-50 text-emerald-600" },
    ],
  },
  {
    label: { en: "Analytics", bn: "বিশ্লেষণ" },
    links: [
      { href: "/company/analytics", en: "Analytics", bn: "অ্যানালিটিক্স", icon: "📊", color: "bg-indigo-50 text-indigo-600" },
      { href: "/company/events", en: "Event Logs", bn: "ইভেন্ট লগ", icon: "📋", color: "bg-cyan-50 text-cyan-600" },
    ],
  },
  {
    label: { en: "Communication", bn: "যোগাযোগ" },
    links: [
      { href: "/company/whatsapp", en: "WhatsApp Hub", bn: "হোয়াটসঅ্যাপ", icon: "💬", color: "bg-green-50 text-green-600" },
      { href: "/company/translations", en: "Translations", bn: "অনুবাদ", icon: "🌐", color: "bg-teal-50 text-teal-600" },
    ],
  },
  {
    label: { en: "System", bn: "সিস্টেম" },
    links: [
      { href: "/company/settings", en: "Settings", bn: "সেটিংস", icon: "⚙️", color: "bg-gray-50 text-gray-600" },
      { href: "/company/test-mode", en: "Test Mode", bn: "টেস্ট মোড", icon: "🧪", color: "bg-orange-50 text-orange-600" },
      { href: "/company/updates", en: "Updates", bn: "আপডেট", icon: "🔄", color: "bg-teal-50 text-teal-600" },
    ],
  },
];

const segmentColors: Record<string, string> = {
  vip: "bg-amber-400", active: "bg-green-400", at_risk: "bg-orange-400",
  churned: "bg-red-400", new: "bg-blue-400", unscored: "bg-gray-300",
};

export default function CompanyDashboard() {
  const { lang } = useLanguageStore();
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null);
  const [segments, setSegments] = useState<SegmentItem[]>([]);
  const [eventStats, setEventStats] = useState<EventStat[]>([]);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [predictions, setPredictions] = useState<Predictions | null>(null);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      const [agentData, analyticsData] = await Promise.all([
        fetchWithCache<AgentStats | null>("/api/ai/agents/stats", 300000).catch(() => null),
        fetchWithCache<Record<string, unknown> | null>("/api/track/analytics", 300000).catch(() => null),
      ]);
      if (agentData) setAgentStats(agentData);
      if (analyticsData) {
        if (analyticsData.segments) setSegments(analyticsData.segments as SegmentItem[]);
        if (analyticsData.eventStats) setEventStats(analyticsData.eventStats as EventStat[]);
        setTotalWorkers(analyticsData.totalWorkers as number || 0);
        setTotalEvents(analyticsData.totalEvents as number || 0);
        if (analyticsData.predictions) setPredictions(analyticsData.predictions as Predictions);
      }
      const memberRes = await fetchWithCache<{ total?: number }>("/api/company/members?limit=1", 300000).catch(() => null);
      if (memberRes?.total) setMemberCount(memberRes.total);
    };
    load();
  }, []);

  const maxSegment = Math.max(...segments.map(s => s.count), 1);
  const scoredWorkers = useMemo(() =>
    segments.filter(s => s.segment !== "unscored").reduce((s, r) => s + r.count, 0),
    [segments]
  );
  const totalMembers = memberCount || totalWorkers;

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "কোম্পানি ড্যাশবোর্ড" : "Company Dashboard"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "সমস্ত কার্যক্রমের সারসংক্ষেপ" : "Full activity overview"}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label={lang === "bn" ? "মোট সদস্য" : "Total Members"} value={totalMembers.toLocaleString()} color="text-primary" />
          <StatCard label={lang === "bn" ? "স্কোরকৃত" : "Scored"} value={scoredWorkers.toLocaleString()} color="text-action" />
          <StatCard label={lang === "bn" ? "মোট ইভেন্ট" : "Total Events"} value={totalEvents.toLocaleString()} color="text-secondary-dark" />
          <StatCard label={lang === "bn" ? "ইভেন্ট টাইপ" : "Event Types"} value={String(eventStats.length)} color="text-accent" />
        </div>

        {segments.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-bold text-primary mb-3 text-sm">{lang === "bn" ? "সেগমেন্ট বিতরণ" : "Segment Distribution"}</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {segments.map(s => {
                const pct = totalMembers > 0 ? Math.round(s.count / totalMembers * 100) : 0;
                return (
                  <div key={s.segment} className="p-3 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold capitalize">{s.segment}</span>
                      <span className="text-xs text-text-secondary">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${segmentColors[s.segment] || "bg-gray-300"}`} style={{ width: `${Math.round(s.count / maxSegment * 100)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {agentStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="card p-4 text-center">
              <div className="text-lg font-bold text-primary">{agentStats.total}</div>
              <div className="text-xs text-text-secondary">{lang === "bn" ? "এআই এজেন্ট" : "AI Agents"}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-lg font-bold text-green-600">{agentStats.active}</div>
              <div className="text-xs text-text-secondary">{lang === "bn" ? "সক্রিয়" : "Active"}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-lg font-bold text-purple-600">{agentStats.totalReports}</div>
              <div className="text-xs text-text-secondary">{lang === "bn" ? "রিপোর্ট" : "Reports"}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-lg font-bold text-blue-600">{agentStats.totalSubmissions}</div>
              <div className="text-xs text-text-secondary">{lang === "bn" ? "সাবমিশন" : "Submissions"}</div>
            </div>
          </div>
        )}

        {/* Predictions & Insights */}
        {predictions && predictions.total_scored > 0 && (
          <Card className="mb-6">
            <h3 className="font-bold text-primary mb-3 text-sm flex items-center gap-2">
              <span>🔮</span>
              {lang === "bn" ? "প্রেডিকশন ও ইনসাইট" : "Predictions & Insights"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-red-700">{lang === "bn" ? "চার্ন রিস্ক" : "Churn Risk"}</span>
                  <span className="text-lg font-bold text-red-600">{predictions.churn_risk}</span>
                </div>
                <p className="text-[10px] text-red-500 mt-1">{lang === "bn" ? `গড় ${Math.round(predictions.avg_churn)}%` : `Avg ${Math.round(predictions.avg_churn)}%`}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-700">{lang === "bn" ? "উচ্চ ক্রয় আগ্রহ" : "High Intent"}</span>
                  <span className="text-lg font-bold text-green-600">{predictions.high_intent}</span>
                </div>
                <p className="text-[10px] text-green-500 mt-1">{lang === "bn" ? `গড় ${Math.round(predictions.avg_intent)}%` : `Avg ${Math.round(predictions.avg_intent)}%`}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-700">{lang === "bn" ? "উচ্চ লিড স্কোর" : "High Lead Score"}</span>
                  <span className="text-lg font-bold text-blue-600">{predictions.high_lead}</span>
                </div>
                <p className="text-[10px] text-blue-500 mt-1">{lang === "bn" ? `গড় ${Math.round(predictions.avg_lead)}%` : `Avg ${Math.round(predictions.avg_lead)}%`}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-700">{lang === "bn" ? "উচ্চ গ্রাহক জীবনকাল মূল্য" : "High LTV"}</span>
                  <span className="text-lg font-bold text-purple-600">{predictions.high_ltv}</span>
                </div>
                <p className="text-[10px] text-purple-500 mt-1">{lang === "bn" ? `${predictions.total_scored} স্কোরকৃত` : `${predictions.total_scored} scored`}</p>
              </div>
            </div>
          </Card>
        )}

        {eventStats.length > 0 && (
          <Card className="mb-6">
            <h3 className="font-bold text-primary mb-3 text-sm">{lang === "bn" ? "ইভেন্ট টাইপ" : "Event Types"}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {eventStats.map(e => {
                const pct = totalEvents > 0 ? Math.round(e.count / totalEvents * 100) : 0;
                return (
                  <div key={e.event_type} className="p-2.5 rounded-lg bg-gray-50 text-center">
                    <div className="text-sm font-bold text-primary">{e.count.toLocaleString()}</div>
                    <div className="text-[10px] text-text-secondary capitalize">{e.event_type.replace(/_/g, " ")}</div>
                    <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {linkGroups.map((group) => (
          <div key={group.label.en} className="mb-8">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-px bg-gray-200" />
              {lang === "bn" ? group.label.bn : group.label.en}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.links.map((link) => (
                <Link key={link.href} href={link.href} className="card hover:shadow-xl hover:-translate-y-0.5 text-center group !p-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2.5 text-xl group-hover:scale-110 transition-transform ${link.color}`}>
                    {link.icon}
                  </div>
                  <h4 className="font-semibold text-sm text-primary">{lang === "bn" ? link.bn : link.en}</h4>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
