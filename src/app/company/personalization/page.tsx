"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { useSWRFetch } from "@/lib/use-swr-fetch";
import { Card, StatCard } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

interface PersonalizationStats {
  insightsGeneratedToday: number;
  totalInsights: number;
  topInsightTypes: { type: string; count: number }[];
  deliveryStats: { viewed: number; clicked: number; delivered: number };
  workersWithInsights: { workerId: string; name: string; insightCount: number; topInsight: string }[];
  abTests: { id: number; name: string; variantA: string; variantB: string; impressionsA: number; impressionsB: number; clicksA: number; clicksB: number; startedAt: string }[];
}

const INSIGHT_TYPE_LABELS: Record<string, string> = {
  course_recommendation: "Course Recommendation",
  product_recommendation: "Product Recommendation",
  skill_gap: "Skill Gap",
  earning_opportunity: "Earning Opportunity",
  milestone: "Milestone",
  re_engagement: "Re-engagement",
  cross_sell: "Cross-sell",
  upgrade_path: "Upgrade Path",
};

const INSIGHT_TYPE_LABELS_BN: Record<string, string> = {
  course_recommendation: "রিসোর্স সুপারিশ",
  product_recommendation: "পণ্য সুপারিশ",
  skill_gap: "দক্ষতার ঘাটতি",
  earning_opportunity: "আয়ের সুযোগ",
  milestone: "মাইলস্টোন",
  re_engagement: "পুনরায় যুক্ত করা",
  cross_sell: "ক্রস-সেল",
  upgrade_path: "আপগ্রেড পাথ",
};

const INSIGHT_COLORS: Record<string, string> = {
  course_recommendation: "bg-blue-500",
  product_recommendation: "bg-green-500",
  skill_gap: "bg-purple-500",
  earning_opportunity: "bg-yellow-500",
  milestone: "bg-pink-500",
  re_engagement: "bg-orange-500",
  cross_sell: "bg-teal-500",
  upgrade_path: "bg-indigo-500",
};

export default function PersonalizationDashboard() {
  const { lang } = useLanguageStore();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: statsData, loading: statsLoading, refresh: statsRefresh } = useSWRFetch<PersonalizationStats>(
    "/api/personalize/stats",
    { ttlMs: 60_000 }
  );

  const { data: workersData, loading: workersLoading } = useSWRFetch<{ workers: { workerId: string; name: string; insightCount: number; topInsight: string }[] }>(
    "/api/personalize/stats?workers=1",
    { ttlMs: 120_000 }
  );

  const stats = statsData as PersonalizationStats | null;
  const workers = workersData?.workers ?? stats?.workersWithInsights ?? [];

  const filteredWorkers = workers.filter((w) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return w.name.toLowerCase().includes(q) || w.workerId.toLowerCase().includes(q);
  });

  return (
    <div className="py-24 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "bn" ? "ব্যক্তিগতকরণ ড্যাশবোর্ড" : "Personalization Dashboard"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {lang === "bn" ? "ইনসাইট, ডেলিভারি ও এ/বি টেস্ট মনিটর করুন" : "Monitor insights, delivery & A/B tests"}
            </p>
          </div>
          <button
            onClick={() => statsRefresh()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-all"
          >
            {lang === "bn" ? "রিফ্রেশ" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-border space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label={lang === "bn" ? "আজ জেনারেটেড" : "Generated Today"}
            value={(stats?.insightsGeneratedToday ?? 0).toLocaleString()}
            color="text-action"
          />
          <StatCard
            label={lang === "bn" ? "মোট ইনসাইট" : "Total Insights"}
            value={(stats?.totalInsights ?? 0).toLocaleString()}
            color="text-primary"
          />
          <StatCard
            label={lang === "bn" ? "ডেলিভারি রেট" : "Delivery Rate"}
            value={
              stats?.deliveryStats
                ? `${Math.round(((stats.deliveryStats.viewed + stats.deliveryStats.clicked) / Math.max(stats.deliveryStats.delivered, 1)) * 100)}%`
                : "0%"
            }
            color="text-accent"
          />
          <StatCard
            label={lang === "bn" ? "ইনসাইট টাইপ" : "Insight Types"}
            value={String(stats?.topInsightTypes.length ?? 0)}
            color="text-secondary"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Top Insight Types */}
        <Card>
          <h3 className="font-bold text-primary mb-4">
            {lang === "bn" ? "শীর্ষ ইনসাইট টাইপ" : "Top Insight Types"}
          </h3>
          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.topInsightTypes.length === 0 && (
                <p className="text-sm text-text-secondary">{lang === "bn" ? "কোনো ডাটা নেই" : "No data yet"}</p>
              )}
              {stats?.topInsightTypes.map((item) => {
                const maxCount = Math.max(...stats.topInsightTypes.map((t) => t.count), 1);
                const pct = (item.count / maxCount) * 100;
                return (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary font-medium capitalize flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${INSIGHT_COLORS[item.type] || "bg-gray-400"}`} />
                        {lang === "bn" ? INSIGHT_TYPE_LABELS_BN[item.type] || item.type : INSIGHT_TYPE_LABELS[item.type] || item.type}
                      </span>
                      <span className="text-text-secondary">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${INSIGHT_COLORS[item.type] || "bg-gray-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Delivery Stats */}
        <Card>
          <h3 className="font-bold text-primary mb-4">
            {lang === "bn" ? "ডেলিভারি স্ট্যাটস" : "Delivery Stats"}
          </h3>
          {statsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-6 w-full" />)}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: lang === "bn" ? "ডেলিভারড" : "Delivered", value: stats?.deliveryStats?.delivered ?? 0, color: "bg-blue-500" },
                { label: lang === "bn" ? "দেখা হয়েছে" : "Viewed", value: stats?.deliveryStats?.viewed ?? 0, color: "bg-green-500" },
                { label: lang === "bn" ? "ক্লিক করা হয়েছে" : "Clicked", value: stats?.deliveryStats?.clicked ?? 0, color: "bg-action" },
              ].map((item) => {
                const maxVal = Math.max(stats?.deliveryStats?.delivered ?? 1, 1);
                const pct = (item.value / maxVal) * 100;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary font-medium">{item.label}</span>
                      <span className="text-text-secondary">{item.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Workers Table */}
      <Card className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-primary">
            {lang === "bn" ? "সদস্যদের ইনসাইট" : "Member Insights"}
          </h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === "bn" ? "নাম বা আইডি দ্বারা খুঁজুন..." : "Search by name or ID..."}
            className="input-field max-w-xs text-xs"
          />
        </div>
        {workersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredWorkers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-text-secondary">
              {searchQuery
                ? (lang === "bn" ? "কোনো ফলাফল পাওয়া যায়নি" : "No results found")
                : (lang === "bn" ? "এখনো কোনো ডাটা নেই" : "No data yet")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-secondary uppercase tracking-wider border-b border-border">
                  <th className="pb-3 font-semibold">{lang === "bn" ? "নাম" : "Name"}</th>
                  <th className="pb-3 font-semibold">ID</th>
                  <th className="pb-3 font-semibold">{lang === "bn" ? "ইনসাইট" : "Insights"}</th>
                  <th className="pb-3 font-semibold">{lang === "bn" ? "শীর্ষ টাইপ" : "Top Type"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map((w, i) => (
                  <tr key={w.workerId} className="border-b border-border/50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="font-medium text-primary">{w.name}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <code className="text-xs text-text-secondary font-mono">{w.workerId.slice(0, 12)}...</code>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm font-semibold text-primary">{w.insightCount}</span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span className={`w-2 h-2 rounded-full ${INSIGHT_COLORS[w.topInsight] || "bg-gray-400"}`} />
                        {lang === "bn" ? INSIGHT_TYPE_LABELS_BN[w.topInsight] || w.topInsight : INSIGHT_TYPE_LABELS[w.topInsight] || w.topInsight}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* A/B Test Results */}
      <Card>
        <h3 className="font-bold text-primary mb-4">
          {lang === "bn" ? "এ/বি টেস্ট ফলাফল" : "A/B Test Results"}
        </h3>
        {statsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-50">
                <Skeleton className="h-5 w-1/2 mb-3" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 rounded-lg" />
                  <Skeleton className="h-16 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : !stats?.abTests || stats.abTests.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl mb-2 block">🧪</span>
            <p className="text-sm text-text-secondary">
              {lang === "bn" ? "এখনো কোনো এ/বি টেস্ট নেই" : "No A/B tests yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {stats.abTests.map((test) => {
              const totalA = test.impressionsA || 1;
              const totalB = test.impressionsB || 1;
              const rateA = Math.round((test.clicksA / totalA) * 100);
              const rateB = Math.round((test.clicksB / totalB) * 100);
              const winner = rateA > rateB ? "A" : rateB > rateA ? "B" : null;
              return (
                <div key={test.id} className="p-4 rounded-xl bg-gray-50 border border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-primary">{test.name}</h4>
                    <span className="text-[10px] text-text-secondary">
                      {new Date(test.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${winner === "A" ? "border-action bg-action/5" : "border-border bg-white"}`}>
                      <p className="text-xs font-medium text-text-secondary mb-1">Variant A</p>
                      <p className="text-sm font-semibold text-primary truncate" title={test.variantA}>{test.variantA}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                        <span>{lang === "bn" ? "ইম্প্রেশন:" : "Impressions:"} {test.impressionsA}</span>
                        <span>CTR: {rateA}%</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${winner === "B" ? "border-action bg-action/5" : "border-border bg-white"}`}>
                      <p className="text-xs font-medium text-text-secondary mb-1">Variant B</p>
                      <p className="text-sm font-semibold text-primary truncate" title={test.variantB}>{test.variantB}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-text-secondary">
                        <span>{lang === "bn" ? "ইম্প্রেশন:" : "Impressions:"} {test.impressionsB}</span>
                        <span>CTR: {rateB}%</span>
                      </div>
                    </div>
                  </div>
                  {winner && (
                    <p className="mt-2 text-xs font-semibold text-action">
                      {lang === "bn" ? `বিজয়ী: ভ্যারিয়েন্ট ${winner}` : `Winner: Variant ${winner}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
