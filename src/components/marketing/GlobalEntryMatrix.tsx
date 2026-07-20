"use client";

import { useLanguageStore } from "@/lib/store";

interface GlobalEntryMatrixProps {
  data: Array<{ strategy: string; description: string; risk: string; investment: string }>;
  className?: string;
}

const riskColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

const investColors: Record<string, string> = {
  low: "from-emerald-500 to-teal-400",
  medium: "from-amber-500 to-yellow-400",
  high: "from-rose-500 to-pink-400",
};

export function GlobalEntryMatrix({ data, className = "" }: GlobalEntryMatrixProps) {
  const { lang } = useLanguageStore();

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
      {data.map((item) => {
        const riskKey = item.risk.toLowerCase();
        const investKey = item.investment.toLowerCase();
        return (
          <div
            key={item.strategy}
            className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl"
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${investColors[investKey] || "from-gray-400 to-gray-300"}`} />
            <h3 className="text-base font-bold text-gray-900">{item.strategy}</h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">{item.description}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${riskColors[riskKey] || "bg-gray-100 text-gray-600"}`}>
                {lang === "bn" ? (item.risk === "Low" ? "নিম্ন" : item.risk === "Medium" ? "মধ্যম" : "উচ্চ") : item.risk} {lang === "bn" ? "ঝুঁকি" : "Risk"}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-bold uppercase text-gray-600">
                {item.investment} {lang === "bn" ? "বিনিয়োগ" : "Investment"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
