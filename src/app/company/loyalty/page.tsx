"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { LoyaltyLadder } from "@/components/marketing/LoyaltyLadder";
import { NPSScore } from "@/components/marketing/NPSScore";
import { CLVCalculator } from "@/components/marketing/CLVCalculator";

interface ChurnReason {
  reason: string; reasonBn: string; percentage: number;
}

interface PageData {
  ladder: Array<{ stage: string; label: string; labelBn: string; count: number }>;
  promoters: number; passives: number; detractors: number;
  avgPurchase: number; frequency: number; lifetime: number;
  retentionRate: number;
  churnReasons: ChurnReason[];
}

export default function LoyaltyPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/loyalty");
        if (res.ok) {
          const json: any = await res.json();
          setData(json.data || null);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
    </div>
  );

  if (!data) return <div className="p-6 text-text-secondary">{isBn ? "কোনো তথ্য নেই" : "No data"}</div>;

  const { ladder, promoters, passives, detractors, avgPurchase, frequency, lifetime, retentionRate, churnReasons } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "লয়ালটি" : "Loyalty"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "গ্রাহক আনুগত্য ও ধরে রাখা" : "Customer Loyalty & Retention"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <LoyaltyLadder data={ladder} />
        <NPSScore promoters={promoters} passives={passives} detractors={detractors} />
        <CLVCalculator avgPurchase={avgPurchase} frequency={frequency} lifetime={lifetime} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gradient-to-br from-success/5 to-info/5 rounded-2xl border border-border p-5 text-center">
          <p className="text-xs text-text-secondary/70 mb-1">{isBn ? "রিটেনশন রেট" : "Retention Rate"}</p>
          <p className="text-3xl font-black text-success">{retentionRate}%</p>
          <div className="mt-2 h-2 bg-primary/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-success" style={{ width: `${retentionRate}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text mb-4">{isBn ? "চার্ন বিশ্লেষণ" : "Churn Analysis"}</h2>
          <div className="space-y-3">
            {churnReasons.map((r, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text">{isBn ? r.reasonBn : r.reason}</span>
                  <span className="text-xs font-bold text-error">{r.percentage}%</span>
                </div>
                <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-error" style={{ width: `${r.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
