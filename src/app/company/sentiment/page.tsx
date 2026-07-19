"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface SentimentItem {
  id: number; workerId: string; workerName: string; text: string;
  source: string; rating?: number; channel?: string; direction?: string;
  sentiment: { score: number; label: string; positiveCount: number; negativeCount: number; positiveWords: string[]; negativeWords: string[] };
  createdAt: string;
}

const sentimentColors: Record<string, string> = {
  very_positive: "bg-green-100 text-green-700",
  positive: "bg-emerald-100 text-emerald-700",
  neutral: "bg-gray-100 text-gray-700",
  negative: "bg-orange-100 text-orange-700",
  very_negative: "bg-red-100 text-red-700",
};

const sentimentLabels: Record<string, string> = {
  very_positive: "😊 Very Positive",
  positive: "🙂 Positive",
  neutral: "😐 Neutral",
  negative: "😟 Negative",
  very_negative: "😡 Very Negative",
};

export default function SentimentPage() {
  const { lang } = useLanguageStore();
  const [items, setItems] = useState<SentimentItem[]>([]);
  const [filter, setFilter] = useState<"all" | "reviews" | "communication">("all");
  const [stats, setStats] = useState({ total: 0, positive: 0, negative: 0, neutral: 0 });
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const type = filter === "all" ? "all" : filter;
      const res = await fetch(`/api/ai/sentiment?type=${type}`);
      const d = await res.json() as { success?: boolean; items?: never[]; total?: number; positive?: number; negative?: number; neutral?: number };
      if (d.success) { setItems(d.items || []); setStats({ total: d.total ?? 0, positive: d.positive ?? 0, negative: d.negative ?? 0, neutral: d.neutral ?? 0 }); }
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [filter]);

  const filtered = items;

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "সেন্টিমেন্ট এনালাইসিস" : "Sentiment Analysis"}</h1>
            <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "রিভিউ ও কমিউনিকেশন থেকে ইউজারের অনুভূতি বোঝা" : "Understand user feelings from reviews & communications"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadData} loading={loading}>
            {lang === "bn" ? "রিফ্রেশ" : "Refresh"}
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-text-secondary mt-1">{lang === "bn" ? "মোট" : "Total"}</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.positive}</p>
            <p className="text-xs text-text-secondary mt-1">{lang === "bn" ? "পজিটিভ" : "Positive"}</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-gray-500">{stats.neutral}</p>
            <p className="text-xs text-text-secondary mt-1">{lang === "bn" ? "নিউট্রাল" : "Neutral"}</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.negative}</p>
            <p className="text-xs text-text-secondary mt-1">{lang === "bn" ? "নেগেটিভ" : "Negative"}</p>
          </Card>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          {(["all", "reviews", "communication"] as const).map((t) => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${filter === t ? "bg-action text-white" : "text-text-secondary hover:bg-bg-card"}`}
            >
              {t === "all" ? (lang === "bn" ? "সব" : "All") : t === "reviews" ? (lang === "bn" ? "রিভিউ" : "Reviews") : (lang === "bn" ? "কমিউনিকেশন" : "Communication")}
            </button>
          ))}
        </div>

        {/* Items */}
        <div className="space-y-3">
          {loading ? (
            <Card><Skeleton className="h-4 w-32 mx-auto" /></Card>
          ) : filtered.length === 0 ? (
            <Card><div className="text-center py-8 text-text-secondary text-sm">{lang === "bn" ? "কোন ডেটা নেই" : "No data"}</div></Card>
          ) : filtered.slice(0, showAll ? filtered.length : 50).map((item, i) => (
            <Card key={`${item.source}-${item.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-primary">{item.workerName || item.workerId}</span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${sentimentColors[item.sentiment.label] || "bg-gray-100 text-gray-700"}`}>
                      {sentimentLabels[item.sentiment.label] || item.sentiment.label}
                    </span>
                    <span className="text-xs text-text-secondary">{item.sentiment.score}%</span>
                    {item.rating && <span className="text-xs text-amber-500">{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</span>}
                    <span className="text-[10px] text-text-secondary bg-gray-100 px-2 py-0.5 rounded-full">{item.source}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2 line-clamp-3">{item.text}</p>
                  {item.sentiment.positiveWords.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {item.sentiment.positiveWords.map((w, wi) => <span key={wi} className="px-2 py-0.5 text-[10px] bg-green-50 text-green-600 rounded-full">+{w}</span>)}
                    </div>
                  )}
                  {item.sentiment.negativeWords.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {item.sentiment.negativeWords.map((w, wi) => <span key={wi} className="px-2 py-0.5 text-[10px] bg-red-50 text-red-600 rounded-full">-{w}</span>)}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {!showAll && filtered.length > 50 && (
            <button onClick={() => setShowAll(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
              {lang === "bn" ? `আরও ${filtered.length - 50}টি দেখুন` : `Show ${filtered.length - 50} more`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
