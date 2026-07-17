"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ChurnPrediction {
  workerId: string; name: string; phone: string; churnScore: number;
  riskLevel: string; segment: string; lifetimeValue: number; leadScore: number;
  factors: { factor: string; score: number; detail: string }[];
  totalEvents: number; totalOrders: number;
}

interface LTVPrediction {
  workerId: string; name: string; segment: string; historicalSpend: number;
  predictedLTV: { d30: number; d60: number; d90: number };
  totalOrders: number; confidenceScore: string;
}

export default function AIPredictionsPage() {
  const { lang } = useLanguageStore();
  const [tab, setTab] = useState<"churn" | "ltv">("churn");
  const [churnData, setChurnData] = useState<ChurnPrediction[]>([]);
  const [ltvData, setLTVData] = useState<LTVPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadChurnPredictions = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/ai/predict/churn");
      const data: any = await res.json();
      if (data.success) setChurnData(data.predictions.sort((a: ChurnPrediction, b: ChurnPrediction) => b.churnScore - a.churnScore));
      else setError(data.error || "Failed");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const loadLTVPredictions = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/ai/predict/ltv");
      const data: any = await res.json();
      if (data.success) setLTVData(data.predictions.sort((a: LTVPrediction, b: LTVPrediction) => b.predictedLTV.d90 - a.predictedLTV.d90));
      else setError(data.error || "Failed");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  const switchTab = (t: "churn" | "ltv") => {
    setTab(t);
    if (t === "churn" && churnData.length === 0) loadChurnPredictions();
    if (t === "ltv" && ltvData.length === 0) loadLTVPredictions();
  };

  const riskColor = (level: string) => {
    switch (level) {
      case "critical": return "text-red-600 bg-red-100";
      case "high": return "text-orange-600 bg-orange-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const segmentColor = (seg: string) => {
    switch (seg) {
      case "vip": return "text-purple-600 bg-purple-100";
      case "active": return "text-green-600 bg-green-100";
      case "at_risk": return "text-orange-600 bg-orange-100";
      case "churned": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "এআই প্রেডিকশন" : "AI Predictions"}</h1>
            <p className="text-sm text-text-secondary mt-1">{lang === "bn" ? "চার্ন ও এলটিভি প্রেডিকশন ম্যানেজ করুন" : "Manage churn & LTV predictions"}</p>
          </div>
          <Button onClick={() => tab === "churn" ? loadChurnPredictions() : loadLTVPredictions()} loading={loading}>
            {lang === "bn" ? "প্রেডিকশন রিফ্রেশ" : "Refresh Predictions"}
          </Button>
        </div>

        {/* Error */}
        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border pb-2">
          <button onClick={() => switchTab("churn")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "churn" ? "bg-action text-white" : "text-text-secondary hover:bg-bg-card"}`}>
            {lang === "bn" ? "চার্ন প্রেডিকশন" : "Churn Prediction"} {churnData.length > 0 && <span className="ml-1 text-xs opacity-70">({churnData.length})</span>}
          </button>
          <button onClick={() => switchTab("ltv")} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "ltv" ? "bg-action text-white" : "text-text-secondary hover:bg-bg-card"}`}>
            {lang === "bn" ? "এলটিভি প্রেডিকশন" : "LTV Prediction"} {ltvData.length > 0 && <span className="ml-1 text-xs opacity-70">({ltvData.length})</span>}
          </button>
        </div>

        {/* Churn Tab */}
        {tab === "churn" && (
          <div className="space-y-4">
            {churnData.length === 0 && !loading && (
              <Card className="text-center py-12">
                <p className="text-text-secondary">{lang === "bn" ? "চার্ন প্রেডিকশন লোড করতে রিফ্রেশ বাটনে ক্লিক করুন" : "Click Refresh to load churn predictions"}</p>
              </Card>
            )}

            {/* Summary Cards */}
            {churnData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: lang === "bn" ? "ক্রিটিক্যাল" : "Critical", count: churnData.filter(c => c.riskLevel === "critical").length, color: "text-red-600" },
                  { label: lang === "bn" ? "হাই রিস্ক" : "High Risk", count: churnData.filter(c => c.riskLevel === "high").length, color: "text-orange-600" },
                  { label: lang === "bn" ? "মিডিয়াম" : "Medium", count: churnData.filter(c => c.riskLevel === "medium").length, color: "text-yellow-600" },
                  { label: lang === "bn" ? "লো রিস্ক" : "Low Risk", count: churnData.filter(c => c.riskLevel === "low").length, color: "text-green-600" },
                ].map((s, i) => (
                  <Card key={i} className="text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-text-secondary mt-1">{s.label}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* Churn List */}
            {churnData.map((c) => (
              <Card key={c.workerId}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-primary">{c.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${riskColor(c.riskLevel)}`}>{c.riskLevel.toUpperCase()} · {c.churnScore}%</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${segmentColor(c.segment)}`}>{c.segment}</span>
                      <span className="text-xs text-text-secondary">{c.phone}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary">
                      <span>{lang === "bn" ? "লিড স্কোর" : "Lead"}: {c.leadScore}</span>
                      <span>{lang === "bn" ? "এলটিভি" : "LTV"}: {c.lifetimeValue} TK</span>
                      <span>{lang === "bn" ? "ইভেন্ট" : "Events"}: {c.totalEvents}</span>
                      <span>{lang === "bn" ? "অর্ডার" : "Orders"}: {c.totalOrders}</span>
                    </div>
                  </div>
                </div>

                {/* Factors */}
                {c.factors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-text-secondary mb-2">{lang === "bn" ? "প্রভাবকসমূহ:" : "Risk Factors:"}</p>
                    <div className="flex flex-wrap gap-2">
                      {c.factors.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-card border border-border text-xs">
                          <span className={`w-1.5 h-1.5 rounded-full ${f.score >= 15 ? "bg-red-500" : f.score >= 8 ? "bg-orange-500" : "bg-yellow-500"}`} />
                          {f.factor.replace(/_/g, " ")}: {f.detail}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* LTV Tab */}
        {tab === "ltv" && (
          <div className="space-y-4">
            {ltvData.length === 0 && !loading && (
              <Card className="text-center py-12">
                <p className="text-text-secondary">{lang === "bn" ? "এলটিভি প্রেডিকশন লোড করতে রিফ্রেশ বাটনে ক্লিক করুন" : "Click Refresh to load LTV predictions"}</p>
              </Card>
            )}

            {/* LTV Summary */}
            {ltvData.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: lang === "bn" ? "মোট পূর্বানুমান (৩০ দিন)" : "Total 30d LTV", value: ltvData.reduce((s, l) => s + l.predictedLTV.d30, 0), color: "text-blue-600" },
                  { label: lang === "bn" ? "মোট পূর্বানুমান (৬০ দিন)" : "Total 60d LTV", value: ltvData.reduce((s, l) => s + l.predictedLTV.d60, 0), color: "text-indigo-600" },
                  { label: lang === "bn" ? "মোট পূর্বানুমান (৯০ দিন)" : "Total 90d LTV", value: ltvData.reduce((s, l) => s + l.predictedLTV.d90, 0), color: "text-purple-600" },
                ].map((s, i) => (
                  <Card key={i} className="text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()} TK</p>
                    <p className="text-xs text-text-secondary mt-1">{s.label}</p>
                  </Card>
                ))}
              </div>
            )}

            {/* LTV List */}
            {ltvData.map((l) => (
              <Card key={l.workerId}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-primary">{l.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${segmentColor(l.segment)}`}>{l.segment}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${l.confidenceScore === "high" ? "text-green-600 bg-green-100" : "text-yellow-600 bg-yellow-100"}`}>
                        {l.confidenceScore}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      {lang === "bn" ? "ইতিহাস" : "Historical"}: {l.historicalSpend} TK · {lang === "bn" ? "অর্ডার" : "Orders"}: {l.totalOrders}
                    </div>
                  </div>
                  <div className="flex gap-3 text-center">
                    <div>
                      <p className="text-sm font-bold text-blue-600">{l.predictedLTV.d30.toLocaleString()} TK</p>
                      <p className="text-[10px] text-text-secondary">{lang === "bn" ? "৩০ দিন" : "30 Days"}</p>
                    </div>
                    <div className="w-px bg-border self-stretch" />
                    <div>
                      <p className="text-sm font-bold text-indigo-600">{l.predictedLTV.d60.toLocaleString()} TK</p>
                      <p className="text-[10px] text-text-secondary">{lang === "bn" ? "৬০ দিন" : "60 Days"}</p>
                    </div>
                    <div className="w-px bg-border self-stretch" />
                    <div>
                      <p className="text-sm font-bold text-purple-600">{l.predictedLTV.d90.toLocaleString()} TK</p>
                      <p className="text-[10px] text-text-secondary">{lang === "bn" ? "৯০ দিন" : "90 Days"}</p>
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
