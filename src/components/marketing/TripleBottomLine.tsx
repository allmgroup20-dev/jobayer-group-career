"use client";

import { useLanguageStore } from "@/lib/store";

interface TripleBottomLineProps {
  data: {
    people: number;
    planet: number;
    profit: number;
    peopleDesc: string;
    planetDesc: string;
    profitDesc: string;
  };
  className?: string;
}

const pillars = [
  { key: "people", icon: "👥", color: "from-rose-500 to-pink-400", bg: "bg-rose-50", labelEn: "People", labelBn: "মানুষ" },
  { key: "planet", icon: "🌍", color: "from-emerald-500 to-teal-400", bg: "bg-emerald-50", labelEn: "Planet", labelBn: "গ্রহ" },
  { key: "profit", icon: "📈", color: "from-blue-500 to-indigo-400", bg: "bg-blue-50", labelEn: "Profit", labelBn: "মুনাফা" },
];

export function TripleBottomLine({ data, className = "" }: TripleBottomLineProps) {
  const { lang } = useLanguageStore();
  const maxScore = 10;

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
      {pillars.map((p) => {
        const val = data[p.key as keyof typeof data] as number;
        const desc = data[`${p.key}Desc` as keyof typeof data] as string;
        const pct = Math.min(val / maxScore, 1) * 100;
        return (
          <div
            key={p.key}
            className={`relative overflow-hidden rounded-2xl ${p.bg} p-6 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl`}
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${p.color}`} />
            <div className="mb-3 text-3xl">{p.icon}</div>
            <h3 className="text-lg font-bold text-gray-900">
              {lang === "bn" ? p.labelBn : p.labelEn}
            </h3>
            <p className="mt-1 text-3xl font-extrabold text-gray-900">{val.toFixed(1)}</p>
            <div className="mt-3 h-2 rounded-full bg-white/60">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${p.color} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">{desc}</p>
          </div>
        );
      })}
    </div>
  );
}
