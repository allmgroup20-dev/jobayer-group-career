"use client";

import { useLanguageStore } from "@/lib/store";

interface LoyaltyLadderProps {
  data: Array<{ stage: string; label: string; labelBn: string; count: number }>;
  className?: string;
}

const stageColors: Record<string, string> = {
  advocate: "from-purple-600 to-purple-500",
  loyal: "from-blue-600 to-blue-500",
  repeat: "from-teal-500 to-emerald-400",
  "first-time": "from-amber-500 to-yellow-400",
  prospect: "from-orange-500 to-red-400",
  suspect: "from-gray-400 to-gray-300",
};

export function LoyaltyLadder({ data, className = "" }: LoyaltyLadderProps) {
  const { lang } = useLanguageStore();
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const sorted = [...data].reverse();

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex w-full max-w-sm flex-col items-center gap-1">
        {sorted.map((item, idx) => {
          const pct = (item.count / maxCount) * 100;
          const color = stageColors[item.stage] || "from-gray-400 to-gray-300";
          return (
            <div key={item.stage} className="flex w-full items-center gap-2">
              <span className="w-24 text-right text-xs font-semibold text-gray-600">
                {lang === "bn" ? item.labelBn : item.label}
              </span>
              <div className="flex-1">
                <div className="relative h-9 w-full overflow-hidden rounded-lg bg-gray-100 shadow-inner">
                  <div
                    className={`h-full rounded-lg bg-gradient-to-r ${color} flex items-center justify-end px-3 transition-all duration-700`}
                    style={{ width: `${Math.max(pct, 8)}%` }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow-sm">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] font-medium uppercase tracking-widest text-gray-400">
        {lang === "bn" ? "গ্রাহক আনুগত্যের সিঁড়ি" : "Loyalty Ladder"}
      </p>
    </div>
  );
}
