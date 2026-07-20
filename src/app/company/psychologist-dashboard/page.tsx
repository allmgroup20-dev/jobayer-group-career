"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";

interface MetricCard {
  metricType: string;
  score: number;
  samples: number;
  labelEn: string;
  labelBn: string;
  icon: string;
  color: string;
}

interface FeedbackSummary {
  total: number;
  unresolved: number;
  resolution_rate: number;
}

interface AgentStat {
  agent_id: string;
  total: number;
  unresolved: number;
  avg_listening: number;
  avg_language: number;
}

interface OverviewResponse {
  metrics: Record<string, { score: number; samples: number }>;
  feedback: { total: number; unresolved: number; resolution_rate: number };
}
interface AgentsResponse { agents: AgentStat[] }
interface TrendsResponse { trends: { metric_type: string; date: string; avg: number }[] }

const METRICS_CONFIG: MetricCard[] = [
  { metricType: "trust_currency", score: 0, samples: 0, labelEn: "Trust Currency", labelBn: "বিশ্বাস মুদ্রা", icon: "💰", color: "from-blue-500 to-blue-600" },
  { metricType: "listening_quality", score: 0, samples: 0, labelEn: "Listening Quality", labelBn: "শ্রবণ গুণমান", icon: "👂", color: "from-green-500 to-green-600" },
  { metricType: "value_delivery", score: 0, samples: 0, labelEn: "Value Delivery", labelBn: "মূল্য প্রদান", icon: "🎯", color: "from-purple-500 to-purple-600" },
  { metricType: "resistance_handling", score: 0, samples: 0, labelEn: "Resistance Handling", labelBn: "প্রতিরোধ ব্যবস্থাপনা", icon: "🛡️", color: "from-orange-500 to-orange-600" },
];

export default function PsychologistDashboard() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [metrics, setMetrics] = useState<MetricCard[]>(METRICS_CONFIG);
  const [feedback, setFeedback] = useState<FeedbackSummary>({ total: 0, unresolved: 0, resolution_rate: 0 });
  const [agents, setAgents] = useState<AgentStat[]>([]);
  const [trends, setTrends] = useState<{ metric_type: string; date: string; avg: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/company/psychologist-metrics?action=overview&period=daily"),
      fetch("/api/company/psychologist-metrics?action=agent_breakdown"),
      fetch("/api/company/psychologist-metrics?action=trends&days=14"),
    ])
      .then(async ([overviewRes, agentsRes, trendsRes]) => {
        const overview: OverviewResponse = await overviewRes.json();
        const agentData: AgentsResponse = await agentsRes.json();
        const trendData: TrendsResponse = await trendsRes.json();
        if (overview.metrics) {
          setMetrics(METRICS_CONFIG.map(m => ({
            ...m,
            score: overview.metrics[m.metricType]?.score || 0,
            samples: overview.metrics[m.metricType]?.samples || 0,
          })));
        }
        if (overview.feedback) setFeedback(overview.feedback);
        if (agentData.agents) setAgents(agentData.agents);
        if (trendData.trends) setTrends(trendData.trends);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = Object.entries(
    trends.reduce<Record<string, { date: string; avg: number }[]>>((acc, t) => {
      if (!acc[t.metric_type]) acc[t.metric_type] = [];
      acc[t.metric_type].push(t);
      return acc;
    }, {})
  );

  const getTrendColor = (type: string) => {
    const map: Record<string, string> = {
      trust_currency: "text-blue-500",
      listening_quality: "text-green-500",
      value_delivery: "text-purple-500",
      resistance_handling: "text-orange-500",
    };
    return map[type] || "text-gray-500";
  };

  if (loading) return <div className="p-6 text-gray-500">{isBn ? "লোড হচ্ছে..." : "Loading..."}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{isBn ? "সাইকোলজিস্ট ড্যাশবোর্ড" : "Psychologist Dashboard"}</h1>
      <p className="text-gray-500 mb-6">
        {isBn ? "বব বার্গের The Art of Persuasion বইয়ের ৪টি মূল মেট্রিক — AI এজেন্ট ও সাইকোলজিস্ট পারফরম্যান্স ট্র্যাকিং" : "Bob Berg's The Art of Persuasion — 4 core metrics tracking AI agent & psychologist performance"}
      </p>

      {/* Persuasion Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => (
          <div key={m.metricType} className={`rounded-xl bg-gradient-to-br ${m.color} p-5 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{m.icon}</span>
              <span className="text-sm opacity-80">{m.samples} {isBn ? "নমুনা" : "samples"}</span>
            </div>
            <div className="text-4xl font-bold mb-1">{m.score.toFixed(1)}</div>
            <div className="text-sm font-medium opacity-90">{isBn ? m.labelBn : m.labelEn}</div>
          </div>
        ))}
      </div>

      {/* Feedback Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">{isBn ? "মোট ফিডব্যাক" : "Total Feedback"}</div>
          <div className="text-3xl font-bold text-gray-800">{feedback.total}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">{isBn ? "অমীমাংসিত" : "Unresolved"}</div>
          <div className="text-3xl font-bold text-amber-600">{feedback.unresolved}</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="text-sm text-gray-500 mb-1">{isBn ? "সমাধান হার" : "Resolution Rate"}</div>
          <div className="text-3xl font-bold text-green-600">{feedback.resolution_rate}%</div>
        </div>
      </div>

      {/* Trends */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border mb-8">
          <h2 className="text-lg font-semibold mb-4">{isBn ? "১৪ দিনের ট্রেন্ড" : "14-Day Trends"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chartData.map(([type, points]) => (
              <div key={type}>
                <h3 className={`text-sm font-medium ${getTrendColor(type)} capitalize mb-2`}>
                  {type.replace(/_/g, " ")}
                </h3>
                <div className="flex items-end gap-1 h-24">
                  {points.map((p, i) => {
                    const maxVal = Math.max(...points.map(x => x.avg), 1);
                    const h = (p.avg / maxVal) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: `${Math.max(h, 4)}%`,
                            backgroundColor: type === "trust_currency" ? "#3B82F6" :
                              type === "listening_quality" ? "#22C55E" :
                              type === "value_delivery" ? "#A855F7" : "#F97316",
                            opacity: 0.8,
                          }}
                        />
                        <span className="text-[10px] text-gray-400">{p.date.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Breakdown */}
      <div className="bg-white rounded-xl p-5 shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">{isBn ? "এজেন্ট ব্রেকডাউন" : "Agent Breakdown"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">{isBn ? "এজেন্ট" : "Agent"}</th>
                <th className="pb-2 font-medium">{isBn ? "মোট" : "Total"}</th>
                <th className="pb-2 font-medium">{isBn ? "অমীমাংসিত" : "Unresolved"}</th>
                <th className="pb-2 font-medium">{isBn ? "শ্রবণ" : "Listening"}</th>
                <th className="pb-2 font-medium">{isBn ? "ভাষা মিল" : "Language Match"}</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((a, i) => (
                <tr key={a.agent_id} className={i < agents.length - 1 ? "border-b" : ""}>
                  <td className="py-2 font-medium text-gray-800">{a.agent_id}</td>
                  <td className="py-2">{a.total}</td>
                  <td className="py-2 text-amber-600">{a.unresolved}</td>
                  <td className="py-2">{a.avg_listening.toFixed(1)}</td>
                  <td className="py-2">{a.avg_language.toFixed(1)}</td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr><td colSpan={5} className="py-4 text-center text-gray-400">{isBn ? "কোনো ডেটা নেই" : "No data yet"}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
