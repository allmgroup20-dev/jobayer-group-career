"use client";

import { useLanguageStore } from "@/lib/store";

interface AIDAFunnelProps {
  data: { attention: number; interest: number; desire: number; action: number };
  className?: string;
}

const stages = [
  { key: "attention", labelEn: "Attention", labelBn: "মনোযোগ", color: "from-blue-500 to-blue-400", w: 100 },
  { key: "interest", labelEn: "Interest", labelBn: "আগ্রহ", color: "from-cyan-500 to-teal-400", w: 78 },
  { key: "desire", labelEn: "Desire", labelBn: "ইচ্ছা", color: "from-amber-500 to-orange-400", w: 56 },
  { key: "action", labelEn: "Action", labelBn: "কর্ম", color: "from-rose-500 to-pink-400", w: 34 },
];

export function AIDAFunnel({ data, className = "" }: AIDAFunnelProps) {
  const { lang } = useLanguageStore();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex w-full max-w-sm flex-col items-center gap-0">
        {stages.map((stage, idx) => {
          const val = data[stage.key as keyof typeof data] ?? 0;
          return (
            <div key={stage.key} className="flex w-full flex-col items-center" style={{ width: `${stage.w}%` }}>
              <div
                className={`relative w-full bg-gradient-to-r ${stage.color} flex items-center justify-between rounded-lg px-4 py-3 shadow-lg transition-all hover:brightness-110 ${
                  idx > 0 ? "-mt-2" : ""
                }`}
              >
                <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                  {lang === "bn" ? stage.labelBn : stage.labelEn}
                </span>
                <span className="text-lg font-extrabold text-white drop-shadow-sm">
                  {val.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-[10px] font-medium uppercase tracking-widest text-gray-400">
        AIDA {lang === "bn" ? "ফানেল" : "Funnel"}
      </p>
    </div>
  );
}
