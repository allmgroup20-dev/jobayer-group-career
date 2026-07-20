"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { PLCChart } from "@/components/marketing/PLCChart";
import { AnsoffMatrix } from "@/components/marketing/AnsoffMatrix";

interface StageRec {
  stage: string; stageBn: string; objective: string; objectiveBn: string; strategy: string; strategyBn: string;
}

interface PageData {
  plc: { introduction: number; growth: number; maturity: number; decline: number };
  ansoff?: { penetration?: string; development?: string; productDev?: string; diversification?: string };
  stageRecommendations: StageRec[];
}

export default function PLCDashboardPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/plc-dashboard");
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

  const { plc, ansoff, stageRecommendations } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "পিএলসি ড্যাশবোর্ড" : "PLC Dashboard"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "পণ্য জীবনচক্র ও গ্রোথ স্ট্র্যাটেজি" : "Product Lifecycle & Growth Strategy"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PLCChart data={plc} />
        <AnsoffMatrix data={ansoff} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "স্টেজ-নির্দিষ্ট মার্কেটিং সুপারিশ" : "Stage-Specific Marketing Recommendations"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold text-text-secondary">{isBn ? "স্টেজ" : "Stage"}</th>
                <th className="text-left py-2 font-semibold text-text-secondary">{isBn ? "উদ্দেশ্য" : "Objective"}</th>
                <th className="text-left py-2 font-semibold text-text-secondary">{isBn ? "স্ট্র্যাটেজি" : "Strategy"}</th>
              </tr>
            </thead>
            <tbody>
              {stageRecommendations.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 font-semibold text-text">{isBn ? r.stageBn : r.stage}</td>
                  <td className="py-2.5 text-text-secondary">{isBn ? r.objectiveBn : r.objective}</td>
                  <td className="py-2.5 text-text-secondary">{isBn ? r.strategyBn : r.strategy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
