"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/Skeleton";
import { PerceptualMap } from "@/components/marketing/PerceptualMap";
import { ValuePropCanvas } from "@/components/marketing/ValuePropCanvas";

interface PodPopItem {
  type: string; attribute: string; importance: number;
}

interface StatementGen {
  brand: string; target: string; frameOfRef: string; pod: string; reason: string;
}

interface PageData {
  valueProp: { jobs: string[]; pains: string[]; gains: string[]; products: string[]; relievers: string[]; creators: string[] };
  perceptualMap: Array<{ name: string; x: number; y: number; isUs?: boolean }>;
  podPop: PodPopItem[];
  statementGenerator: StatementGen;
}

export default function PositioningPage() {
  const { lang } = useLanguageStore();
  const isBn = lang === "bn";
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState({ target: "", brand: "", frameOfRef: "", pod: "", reason: "" });
  const [generated, setGenerated] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/company/positioning");
        if (res.ok) {
          const json: any = await res.json();
          setData(json.data || null);
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const generateStatement = () => {
    const { target, brand, frameOfRef, pod, reason } = input;
    setGenerated(
      isBn
        ? `${target} এর জন্য, ${brand} হলো ${frameOfRef} যে ${pod} কারণ ${reason}`
        : `To ${target}, ${brand} is the ${frameOfRef} that ${pod} because ${reason}`
    );
  };

  if (loading) return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );

  if (!data) return <div className="p-6 text-text-secondary">{isBn ? "কোনো তথ্য নেই" : "No data"}</div>;

  const { valueProp, perceptualMap, podPop, statementGenerator } = data;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-black text-text">{isBn ? "পজিশনিং" : "Positioning"}</h1>
        <p className="text-xs text-text-secondary/70 mt-1">{isBn ? "POD/POP বিশ্লেষণ ও ভ্যালু প্রপোজিশন" : "POD/POP Analysis & Value Proposition"}</p>
      </div>

      <div className="mb-6">
        <ValuePropCanvas data={valueProp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-text mb-4">{isBn ? "POD/POP তালিকা" : "POD/POP List"}</h2>
          <div className="space-y-2">
            {podPop.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-primary/5 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.type === "POD" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{item.type}</span>
                  <span className="text-xs text-text">{item.attribute}</span>
                </div>
                <span className="text-[10px] text-text-secondary">{isBn ? "গুরুত্ব" : "Importance"}: {item.importance}/10</span>
              </div>
            ))}
          </div>
        </div>

        <PerceptualMap data={perceptualMap} />
      </div>

      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-text mb-4">{isBn ? "পজিশনিং স্টেটমেন্ট জেনারেটর" : "Positioning Statement Generator"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
          {[
            { key: "target", placeholder: isBn ? "টার্গেট অডিয়েন্স" : "Target Audience", val: statementGenerator.target },
            { key: "brand", placeholder: isBn ? "ব্র্যান্ড" : "Brand", val: statementGenerator.brand },
            { key: "frameOfRef", placeholder: isBn ? "ফ্রেম অফ রেফারেন্স" : "Frame of Reference", val: statementGenerator.frameOfRef },
            { key: "pod", placeholder: "POD", val: statementGenerator.pod },
            { key: "reason", placeholder: isBn ? "কারণ" : "Reason to Believe", val: statementGenerator.reason },
          ].map((f) => (
            <input
              key={f.key}
              className="text-xs border border-border rounded-lg px-3 py-2 bg-white outline-none focus:border-primary"
              placeholder={f.placeholder}
              defaultValue={f.val}
              onChange={(e) => setInput((prev) => ({ ...prev, [f.key]: e.target.value }))}
            />
          ))}
        </div>
        <button
          onClick={generateStatement}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-80 transition"
        >
          {isBn ? "স্টেটমেন্ট জেনারেট করুন" : "Generate Statement"}
        </button>
        {generated && (
          <div className="mt-4 p-3 bg-primary/5 rounded-xl">
            <p className="text-xs text-text-secondary/80 italic">{generated}</p>
          </div>
        )}
      </div>
    </div>
  );
}
