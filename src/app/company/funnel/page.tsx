"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface FunnelStage {
  stage: string;
  label: string;
  users: number;
  conversionRate: number;
  overallRate: number;
  color: string;
}

interface Retention {
  week: string;
  activeUsers: number;
  retentionRate: number;
}

interface Cohort {
  cohortWeek: string;
  totalUsers: number;
  retention: Retention[];
}

interface ChannelAttr {
  channel: string;
  count: number;
  conversions: number;
}

interface Referrer {
  referrer: string;
  count: number;
}

interface FunnelData {
  funnel: FunnelStage[];
  totalWorkers: number;
  cohortAnalysis: Cohort[];
  channelAttribution: ChannelAttr[];
  topReferrers: Referrer[];
}

export default function CompanyFunnelPage() {
  const { lang } = useLanguageStore();
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/track/funnel")
      .then(r => r.json() as Promise<FunnelData>)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const t = (en: string, bn: string) => lang === "bn" ? bn : en;

  if (loading) return (
    <div className="min-h-screen py-24 px-4 bg-gray-50 flex items-center justify-center">
      <div className="text-text-secondary text-sm">{t("Loading...", "লোড হচ্ছে...")}</div>
    </div>
  );

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            {t("Funnel & Cohort Analysis", "ফানেল ও কোহোর্ট বিশ্লেষণ")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t("User journey from visit to purchase with conversion tracking", "ভিজিট থেকে ক্রয় পর্যন্ত ইউজার জার্নি")}
          </p>
        </div>

        {/* Funnel Visualization */}
        <Card className="!p-6">
          <h3 className="font-semibold text-primary mb-6">
            {t("Conversion Funnel", "কনভার্সন ফানেল")}
          </h3>
          <div className="space-y-3">
            {data?.funnel.map((stage, i) => {
              const barWidth = data.funnel[0].users > 0 ? (stage.users / data.funnel[0].users) * 100 : 0;
              return (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="text-sm font-medium text-primary">{stage.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold text-primary">{stage.users.toLocaleString()}</span>
                      <span className="text-xs text-text-secondary w-16 text-right">
                        {stage.overallRate}%
                      </span>
                      {i > 0 && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: stage.conversionRate > 50 ? "#dcfce7" : "#fef3c7", color: stage.conversionRate > 50 ? "#16a34a" : "#d97706" }}>
                          {stage.conversionRate}% ↓
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3 text-xs text-white font-medium"
                      style={{ width: `${Math.max(barWidth, 2)}%`, backgroundColor: stage.color }}
                    >
                      {barWidth > 15 && stage.users.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-6 mt-4 text-xs text-text-secondary border-t border-border pt-4">
            <span>{t("Total users", "মোট ইউজার")}: <strong>{data?.totalWorkers?.toLocaleString()}</strong></span>
            <span>{t("Overall conversion", "সর্বমোট কনভার্সন")}: <strong>{data?.funnel?.[4]?.overallRate ?? 0}%</strong></span>
          </div>
        </Card>

        {/* Cohort Analysis */}
        <Card className="!p-6">
          <h3 className="font-semibold text-primary mb-4">
            {t("Weekly Cohort Retention", "সাপ্তাহিক কোহোর্ট রিটেনশন")}
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            {t("Shows what % of users from each join-week remained active in subsequent weeks", "প্রতি সপ্তাহে যুক্ত ইউজাররা পরবর্তী সপ্তাহগুলোতে কত % সক্রিয় ছিল")}
          </p>
          {data?.cohortAnalysis && data.cohortAnalysis.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-2 text-left font-semibold text-text-secondary">{t("Cohort", "কোহোর্ট")}</th>
                    <th className="p-2 text-center font-semibold text-text-secondary">{t("Users", "ইউজার")}</th>
                    {data.cohortAnalysis[0]?.retention.map((r, i) => (
                      <th key={i} className="p-2 text-center font-semibold text-text-secondary min-w-[48px]">
                        {i === 0 ? t("Wk 0", "সপ্তা ০") : `${t("Wk", "সপ্তা")} ${i}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.cohortAnalysis.map((cohort, ci) => (
                    <tr key={cohort.cohortWeek} className="border-t border-border">
                      <td className="p-2 font-medium text-primary whitespace-nowrap">{cohort.cohortWeek}</td>
                      <td className="p-2 text-center text-text-secondary">{cohort.totalUsers}</td>
                      {cohort.retention.map((r, ri) => (
                        <td key={ri} className="p-1">
                          <div
                            className="w-full h-8 rounded flex items-center justify-center text-[10px] font-medium transition-all"
                            style={{
                              backgroundColor: r.retentionRate > 70 ? "#22c55e" : r.retentionRate > 40 ? "#eab308" : r.retentionRate > 10 ? "#f97316" : "#ef4444",
                              opacity: Math.max(0.15, r.retentionRate / 100),
                              color: r.retentionRate > 40 ? "white" : "#374151",
                            }}
                          >
                            {r.retentionRate}%
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center py-4">
              {t("Not enough data for cohort analysis yet", "কোহোর্ট বিশ্লেষণের জন্য যথেষ্ট ডেটা নেই")}
            </p>
          )}
        </Card>

        {/* Channel Attribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="!p-6">
            <h3 className="font-semibold text-primary mb-4">
              {t("Channel Attribution", "চ্যানেল অ্যাট্রিবিউশন")}
            </h3>
            {data?.channelAttribution && data.channelAttribution.length > 0 ? (
              <div className="space-y-3">
                {data.channelAttribution.map((ch) => {
                  const total = data.channelAttribution.reduce((s, c) => s + c.count, 0);
                  const pct = total > 0 ? Math.round((ch.count / total) * 100) : 0;
                  return (
                    <div key={ch.channel}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-primary capitalize">{ch.channel}</span>
                        <span className="text-text-secondary">{ch.count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
                      </div>
                      {ch.conversions > 0 && (
                        <div className="text-xs text-green-600 mt-0.5">
                          {t("Conversions", "কনভার্সন")}: {ch.conversions} ({total > 0 ? Math.round((ch.conversions / total) * 100) : 0}%)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">
                {t("No attribution data yet. Enable UTM tracking to see channel performance.", "এখনো কোনো অ্যাট্রিবিউশন ডেটা নেই।")}
              </p>
            )}
          </Card>

          <Card className="!p-6">
            <h3 className="font-semibold text-primary mb-4">
              {t("Top Referrers", "শীর্ষ রেফারার")}
            </h3>
            {data?.topReferrers && data.topReferrers.length > 0 ? (
              <div className="space-y-2">
                {data.topReferrers.map((r, i) => {
                  const total = data.topReferrers.reduce((s, ref) => s + ref.count, 0);
                  const pct = total > 0 ? Math.round((r.count / total) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-text-secondary w-6">{i + 1}.</span>
                      <span className="text-sm text-primary flex-1 truncate">{r.referrer || "(direct)"}</span>
                      <span className="text-xs text-text-secondary w-12 text-right">{r.count}</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-secondary text-center py-4">
                {t("No referrer data yet", "এখনো কোনো রেফারার ডেটা নেই")}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
