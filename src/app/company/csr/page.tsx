"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { TripleBottomLine } from "@/components/marketing/TripleBottomLine";

interface ImpactMetric {
  metric: string; metricBn: string; value: number; target: number; unit: string;
}

interface Initiative {
  name: string; nameBn: string; description: string; descriptionBn: string; status: string; statusBn: string;
}

interface PageData {
  tbl: { people: number; planet: number; profit: number; peopleDesc: string; planetDesc: string; profitDesc: string };
  socialImpact: ImpactMetric[];
  initiatives: Initiative[];
}

export default function CSRPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/csr");
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

  const { tbl, socialImpact, initiatives } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "সিএসআর ও সাসটেইনেবিলিটি" : "CSR & Sustainability"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "ট্রিপল বটম লাইন - পিপল/প্ল্যানেট/প্রফিট" : "Triple Bottom Line - People/Planet/Profit"}</p>
      </div>

      <div className="mb-6">
        <TripleBottomLine data={tbl} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "সামাজিক প্রভাব ট্র্যাকার" : "Social Impact Tracker"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {socialImpact.map((m, i) => {
            const pct = m.target > 0 ? Math.min((m.value / m.target) * 100, 100) : 0;
            return (
              <div key={i} className="border border-border/60 rounded-xl p-4">
                <p className="text-xs font-semibold text-text mb-1">{isBn ? m.metricBn : m.metric}</p>
                <p className="text-2xl font-black text-primary">{m.value}{m.unit}</p>
                <p className="text-[10px] text-text-secondary/70 mb-2">{isBn ? "লক্ষ্য" : "Target"}: {m.target}{m.unit}</p>
                <div className="h-1.5 bg-primary/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "CSR উদ্যোগসমূহ" : "CSR Initiatives"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {initiatives.map((init, i) => (
            <div key={i} className="border border-border/60 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-text">{isBn ? init.nameBn : init.name}</p>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  init.status === "active" ? "bg-success/10 text-success" : init.status === "planned" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                }`}>
                  {isBn ? init.statusBn : init.status}
                </span>
              </div>
              <p className="text-[11px] text-text-secondary/70">{isBn ? init.descriptionBn : init.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
