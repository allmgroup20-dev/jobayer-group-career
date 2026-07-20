"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { GlobalEntryMatrix } from "@/components/marketing/GlobalEntryMatrix";

interface GlocalizationItem {
  dimension: string; dimensionBn: string; standardize: number; adapt: number;
}

interface Tip {
  tip: string; tipBn: string;
}

interface PageData {
  entryMatrix: Array<{ strategy: string; description: string; risk: string; investment: string }>;
  glocalization: GlocalizationItem[];
  crossCulturalTips: Tip[];
}

export default function GlobalMarketsPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/global-markets");
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
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );

  if (!data) return <div className="p-6 text-text-secondary">{isBn ? "কোনো তথ্য নেই" : "No data"}</div>;

  const { entryMatrix, glocalization, crossCulturalTips } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "গ্লোবাল মার্কেট" : "Global Markets"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "গ্লোবাল এক্সপেনশন স্ট্র্যাটেজি" : "Global Expansion Strategy"}</p>
      </div>

      <div className="mb-6">
        <GlobalEntryMatrix data={entryMatrix} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "গ্লোকালাইজেশন ম্যাট্রিক্স" : "Glocalization Matrix"}</h2>
        <div className="space-y-4">
          {glocalization.map((g, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text">{isBn ? g.dimensionBn : g.dimension}</span>
                <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                  <span>{isBn ? "স্ট্যান্ডার্ডাইজ" : "Standardize"}: {g.standardize}%</span>
                  <span>{isBn ? "অ্যাডাপ্ট" : "Adapt"}: {g.adapt}%</span>
                </div>
              </div>
              <div className="h-2 bg-primary/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-primary rounded-l-full transition-all" style={{ width: `${g.standardize}%` }} />
                <div className="h-full bg-warning rounded-r-full transition-all" style={{ width: `${g.adapt}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "ক্রস-কালচারাল টিপস" : "Cross-Cultural Tips"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {crossCulturalTips.map((t, i) => (
            <div key={i} className="border border-border/60 rounded-xl p-3">
              <p className="text-xs text-text-secondary/80">{isBn ? t.tipBn : t.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
