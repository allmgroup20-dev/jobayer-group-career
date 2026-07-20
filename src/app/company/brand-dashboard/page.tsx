"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { CBBEPyramid } from "@/components/marketing/CBBEPyramid";

interface PageData {
  pyramid: { salience: number; performance: number; imagery: number; judgments: number; feelings: number; resonance: number };
  brandElements: { name: string; nameBn: string; effectiveness: number }[];
  resonanceScore: number;
}

export default function BrandDashboardPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/brand-metrics");
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
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );

  if (!data) return <div className="p-6 text-text-secondary">{isBn ? "কোনো তথ্য নেই" : "No data"}</div>;

  const { pyramid, brandElements, resonanceScore } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "ব্র্যান্ড ড্যাশবোর্ড" : "Brand Dashboard"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "CBBE মডেল - ব্র্যান্ড ইকুইটি ট্র্যাকিং" : "CBBE Model - Brand Equity Tracking"}</p>
      </div>

      <div className="mb-6">
        <CBBEPyramid data={pyramid} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "ব্র্যান্ড এলিমেন্টস" : "Brand Elements"}</h2>
        <div className="space-y-3">
          {brandElements.map((el, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-text w-24 shrink-0">{isBn ? el.nameBn : el.name}</span>
              <div className="flex-1 h-5 bg-primary/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${el.effectiveness}%` }} />
              </div>
              <span className="text-xs font-bold text-text w-8 text-right">{el.effectiveness}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/5 to-info/5 rounded-2xl border border-border p-5 text-center">
        <p className="text-xs text-text-secondary/70 mb-1">{isBn ? "ব্র্যান্ড রেজোন্যান্স স্কোর" : "Brand Resonance Score"}</p>
        <p className="text-3xl font-black text-primary">{resonanceScore}/10</p>
        <p className="text-xs text-text-secondary/60 mt-2">
          {isBn
            ? resonanceScore >= 8 ? "শক্তিশালী ব্র্যান্ড ইকুইটি" : resonanceScore >= 5 ? "মাঝারি ব্র্যান্ড ইকুইটি" : "দুর্বল ব্র্যান্ড ইকুইটি"
            : resonanceScore >= 8 ? "Strong Brand Equity" : resonanceScore >= 5 ? "Moderate Brand Equity" : "Weak Brand Equity"}
        </p>
      </div>
    </div>
  );
}
