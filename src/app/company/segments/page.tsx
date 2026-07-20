"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { SegmentMatrix } from "@/components/marketing/SegmentMatrix";

interface SegmentEntry {
  name: string; nameBn: string; size: number; growth: number; bases: string[];
}

interface Criteria {
  measurable: number; substantial: number; accessible: number; differentiable: number; actionable: number;
}

interface PageData {
  matrix: Array<{ base: string; name: string; count: number }>;
  segments: SegmentEntry[];
  targetCriteria: Criteria;
}

export default function SegmentsPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/segments");
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

  const { matrix, segments, targetCriteria } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "সেগমেন্টেশন" : "Segmentation"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "Kotler-র ৪ ভিত্তিতে সেগমেন্টেশন" : "Kotler's 4 Segmentation Bases"}</p>
      </div>

      <div className="mb-6">
        <SegmentMatrix data={matrix} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 mb-6">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "সেগমেন্ট সাইজ ও গ্রোথ" : "Segment Size & Growth"}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-semibold text-text-secondary">{isBn ? "সেগমেন্ট" : "Segment"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">{isBn ? "আকার" : "Size"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">{isBn ? "গ্রোথ" : "Growth"}</th>
                <th className="text-right py-2 font-semibold text-text-secondary">{isBn ? "বেসিস" : "Bases"}</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-2.5 font-semibold text-text">{isBn ? seg.nameBn : seg.name}</td>
                  <td className="py-2.5 text-right text-text">{seg.size.toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <span className={seg.growth >= 0 ? "text-success" : "text-error"}>{seg.growth >= 0 ? "+" : ""}{seg.growth}%</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex gap-1 justify-end">
                      {seg.bases.map((b, j) => (
                        <span key={j} className="px-1.5 py-0.5 bg-primary/5 rounded text-[10px] text-primary">{b}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "টার্গেট সিলেক্টর ক্রাইটেরিয়া" : "Target Selector Criteria"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { key: "measurable", label: "Measurable", labelBn: "পরিমাপযোগ্য", value: targetCriteria.measurable, color: "primary" },
            { key: "substantial", label: "Substantial", labelBn: "পর্যাপ্ত", value: targetCriteria.substantial, color: "success" },
            { key: "accessible", label: "Accessible", labelBn: "প্রবেশযোগ্য", value: targetCriteria.accessible, color: "info" },
            { key: "differentiable", label: "Differentiable", labelBn: "পার্থক্যযোগ্য", value: targetCriteria.differentiable, color: "warning" },
            { key: "actionable", label: "Actionable", labelBn: "কার্যকর", value: targetCriteria.actionable, color: "error" },
          ].map((c) => (
            <div key={c.key} className={`bg-${c.color}/5 rounded-xl border border-${c.color}/10 p-4 text-center`}>
              <p className={`text-2xl font-black text-${c.color}`}>{c.value}/10</p>
              <p className="text-xs text-text-secondary/70 mt-1">{isBn ? c.labelBn : c.label}</p>
              <div className="mt-2 h-1.5 bg-primary/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-${c.color}`} style={{ width: `${(c.value / 10) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
