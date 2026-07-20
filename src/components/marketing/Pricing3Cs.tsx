"use client";

import { useLanguageStore } from "@/lib/store";

interface Pricing3CsProps {
  cost: string;
  customerValue: string;
  competition: string;
  className?: string;
}

const pillars = [
  {
    key: "cost",
    icon: "💰",
    color: "from-emerald-500 to-teal-400",
    labelEn: "Cost",
    labelBn: "খরচ",
  },
  {
    key: "customerValue",
    icon: "🎯",
    color: "from-blue-500 to-indigo-400",
    labelEn: "Customer Value",
    labelBn: "গ্রাহক মূল্য",
  },
  {
    key: "competition",
    icon: "🏆",
    color: "from-violet-500 to-purple-400",
    labelEn: "Competition",
    labelBn: "প্রতিযোগিতা",
  },
];

export function Pricing3Cs({ cost, customerValue, competition, className = "" }: Pricing3CsProps) {
  const { lang } = useLanguageStore();
  const map: Record<string, string> = { cost, customerValue, competition };

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${className}`}>
      {pillars.map((p) => (
        <div
          key={p.key}
          className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl"
        >
          <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${p.color}`} />
          <div className="mb-3 text-3xl">{p.icon}</div>
          <h3 className="text-lg font-bold text-gray-900">
            {lang === "bn" ? p.labelBn : p.labelEn}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{map[p.key]}</p>
        </div>
      ))}
    </div>
  );
}
