"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pricing3Cs } from "@/components/marketing/Pricing3Cs";

interface Strategy {
  name: string; nameBn: string; description: string; descriptionBn: string; suitability: number;
}

interface CompetitorPrice {
  competitor: string; price: number; ourPrice: number; difference: number;
}

interface PageData {
  cost: string; customerValue: string; competition: string;
  strategies: Strategy[];
  competitionTable: CompetitorPrice[];
}

export default function PricingPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/pricing");
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
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );

  if (!data) return <div className="p-6 text-text-secondary">{isBn ? "কোনো তথ্য নেই" : "No data"}</div>;

  const { cost, customerValue, competition, strategies, competitionTable } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "প্রাইসিং স্ট্র্যাটেজি" : "Pricing Strategy"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "৩সি ফ্রেমওয়ার্ক - কস্ট/কাস্টমার/কম্পিটিশন" : "3Cs Framework - Cost/Customer/Competition"}</p>
      </div>

      <div className="mb-6">
        <Pricing3Cs cost={cost} customerValue={customerValue} competition={competition} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "৬টি প্রাইসিং স্ট্র্যাটেজি" : "6 Pricing Strategies"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {strategies.map((s, i) => (
            <div key={i} className="border border-border/60 rounded-xl p-4">
              <p className="text-sm font-bold text-text mb-1">{isBn ? s.nameBn : s.name}</p>
              <p className="text-[11px] text-text-secondary/70 mb-2">{isBn ? s.descriptionBn : s.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-secondary">{isBn ? "উপযোগিতা" : "Suitability"}:</span>
                <div className="flex-1 h-1.5 bg-primary/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${s.suitability}%` }} />
                </div>
                <span className="text-[10px] font-bold text-text">{s.suitability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "প্রতিযোগিতামূলক মূল্য তুলনা" : "Competitive Price Comparison"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold text-text-secondary">{isBn ? "প্রতিযোগী" : "Competitor"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">{isBn ? "তাদের মূল্য" : "Their Price"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">{isBn ? "আমাদের মূল্য" : "Our Price"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">{isBn ? "পার্থক্য" : "Difference"}</th>
              </tr>
            </thead>
            <tbody>
              {competitionTable.map((c, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 font-semibold text-text">{c.competitor}</td>
                  <td className="py-2.5 text-right text-text">${c.price.toFixed(2)}</td>
                  <td className="py-2.5 text-right text-text">${c.ourPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-right">
                    <span className={c.difference <= 0 ? "text-success" : "text-error"}>
                      {c.difference > 0 ? "+" : ""}${c.difference.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
