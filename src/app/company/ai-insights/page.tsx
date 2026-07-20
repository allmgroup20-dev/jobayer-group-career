"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";

interface Stats {
  responses: { total: number; today: number };
  models: { active: number; total: number };
  keys: { active: number };
  conversations: number;
  profiles: number;
  skills: number;
  painPointFrequency: Record<string, number>;
}

interface AgentStatsData {
  total: number;
  active: number;
  idle: number;
  error: number;
  totalReports: number;
  totalSubmissions: number;
}

interface SeniorReport {
  summary_bn: string;
  recommendations: string;
  submitted_at: string;
}

export default function AIInsightsPage() {
  const { lang } = useLanguageStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [agentStats, setAgentStats] = useState<AgentStatsData | null>(null);
  const [seniorReport, setSeniorReport] = useState<SeniorReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/ai/stats").then((r) => r.json()),
      fetch("/api/ai/agents/stats").then((r) => r.json()),
      fetch("/api/ai/agents/reports?agent_id=agent_senior").then((r) => r.json()),
    ])
      .then(([statsData, agentStatsData, reportsData]) => {
        const s = statsData as Stats;
        if (s.responses) setStats(s);
        setAgentStats(agentStatsData as AgentStatsData);
        const r = reportsData as { reports?: SeniorReport[] };
        if (r.reports && r.reports.length > 0) {
          setSeniorReport(r.reports[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );

  const painLabels: Record<string, string> = {
    no_income: lang === "bn" ? "আয় নেই" : "No Income",
    scam_fear: lang === "bn" ? "প্রতারণার ভয়" : "Scam Fear",
    pricing: lang === "bn" ? "দাম নিয়ে চিন্তা" : "Pricing Concern",
    no_skill: lang === "bn" ? "দক্ষতা নেই" : "No Skill",
    no_time: lang === "bn" ? "সময় নেই" : "No Time",
  };

  const painColors: Record<string, string> = {
    no_income: "bg-red-500",
    scam_fear: "bg-orange-500",
    pricing: "bg-yellow-500",
    no_skill: "bg-blue-500",
    no_time: "bg-purple-500",
  };

  const sortedPains = stats?.painPointFrequency
    ? Object.entries(stats.painPointFrequency).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div className="py-24 px-4 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          {lang === "bn" ? "এআই ইনসাইটস" : "AI Insights"}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {lang === "bn" ? "কনভারসেশন ও লিড এনালাইসিস" : "Conversation & lead analysis"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="text-sm text-text-secondary">{lang === "bn" ? "কনভারসেশন" : "Conversations"}</div>
          <div className="text-2xl font-bold text-primary mt-1">{stats?.conversations || 0}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-text-secondary">{lang === "bn" ? "ফোন প্রোফাইল" : "Phone Profiles"}</div>
          <div className="text-2xl font-bold text-primary mt-1">{stats?.profiles || 0}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-text-secondary">{lang === "bn" ? "ক্যাশড স্কিল" : "Cached Skills"}</div>
          <div className="text-2xl font-bold text-primary mt-1">{stats?.skills || 0}</div>
        </div>
        <div className="card p-5">
          <div className="text-sm text-text-secondary">{lang === "bn" ? "সক্রিয় মডেল" : "Active Models"}</div>
          <div className="text-2xl font-bold text-primary mt-1">{stats?.models.active || 0}/{stats?.models.total || 26}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-bold text-base text-primary mb-4">
            {lang === "bn" ? "পেইন পয়েন্ট ডিস্ট্রিবিউশন" : "Pain Point Distribution"}
          </h2>
          {sortedPains.length > 0 ? (
            <div className="space-y-3">
              {sortedPains.map(([pain, count]) => {
                const maxCount = sortedPains[0]?.[1] || 1;
                const pct = (count / maxCount) * 100;
                return (
                  <div key={pain}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-primary font-medium">{painLabels[pain] || pain}</span>
                      <span className="text-text-secondary">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${painColors[pain] || "bg-gray-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-text-secondary">
              {lang === "bn" ? "এখনো কোনো ডাটা নেই" : "No data yet"}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-bold text-base text-primary mb-4">
            {lang === "bn" ? "রেসপন্স ওভারভিউ" : "Response Overview"}
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-primary font-medium">{lang === "bn" ? "আজকের রেসপন্স" : "Today's Responses"}</span>
                <span className="text-text-secondary">{stats?.responses.today || 0}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-action" style={{ width: `${Math.min(100, ((stats?.responses.today || 0) / 100) * 100)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-primary font-medium">{lang === "bn" ? "মোট রেসপন্স" : "Total Responses"}</span>
                <span className="text-text-secondary">{stats?.responses.total || 0}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, ((stats?.responses.total || 0) / 1000) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-sm text-primary mb-3">
              {lang === "bn" ? "এপিআই কী স্ট্যাটাস" : "API Key Status"}
            </h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${(stats?.keys.active || 0) > 0 ? "bg-action" : "bg-red-400"}`} />
              <span className="text-sm text-text-secondary">
                {stats?.keys.active || 0} / 5 {lang === "bn" ? "সক্রিয়" : "Active"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agent System Section */}
      {agentStats && (
        <div className="mt-8">
          <h2 className="font-bold text-base text-primary mb-4">
            🧠 {lang === "bn" ? "এআই এজেন্ট সিস্টেম" : "AI Agent System"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="card p-4 text-center">
              <div className="text-lg font-bold text-primary">{agentStats.total}</div>
              <div className="text-xs text-text-secondary">{lang === "bn" ? "মোট এজেন্ট" : "Total Agents"}</div>
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

          {seniorReport && (() => {
            let recs: string[] = [];
            try { recs = JSON.parse(seniorReport.recommendations || "[]"); } catch {}
            return (
              <div className="card p-5">
                <h3 className="font-semibold text-sm text-primary mb-2">
                  👑 {lang === "bn" ? "সর্বশেষ প্রধান এজেন্ট রিপোর্ট" : "Latest Senior Agent Report"}
                </h3>
                <p className="text-sm text-text-secondary mb-3">{seniorReport.summary_bn}</p>
                {recs.length > 0 && (
                  <div className="space-y-1.5">
                    {recs.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
