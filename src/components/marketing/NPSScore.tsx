"use client";

import { useLanguageStore } from "@/lib/store";

interface NPSScoreProps {
  promoters: number;
  passives: number;
  detractors: number;
  className?: string;
}

export function NPSScore({ promoters, passives, detractors, className = "" }: NPSScoreProps) {
  const { lang } = useLanguageStore();
  const total = promoters + passives + detractors;
  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
  const pPct = total > 0 ? Math.round((promoters / total) * 100) : 0;
  const paPct = total > 0 ? Math.round((passives / total) * 100) : 0;
  const dPct = total > 0 ? Math.round((detractors / total) * 100) : 0;

  const npsColor =
    nps >= 50 ? "text-emerald-600" : nps >= 0 ? "text-amber-600" : "text-rose-600";

  return (
    <div className={`rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {lang === "bn" ? "নেট প্রোমোটার স্কোর" : "Net Promoter Score"}
          </p>
          <p className={`text-5xl font-extrabold ${npsColor}`}>
            {nps >= 0 ? "+" : ""}{nps}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p className="font-semibold text-gray-800">{total.toLocaleString()}</p>
          <p className="text-xs">{lang === "bn" ? "মোট প্রতিক্রিয়া" : "Total Responses"}</p>
        </div>
      </div>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-gray-100">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all" style={{ width: `${pPct}%` }} />
        <div className="bg-gradient-to-r from-amber-400 to-yellow-300 transition-all" style={{ width: `${paPct}%` }} />
        <div className="bg-gradient-to-r from-rose-500 to-red-400 transition-all" style={{ width: `${dPct}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="font-bold text-emerald-600">{promoters}</p>
          <p className="text-gray-400">{lang === "bn" ? "প্রচারক" : "Promoters"}</p>
          <p className="text-gray-500">{pPct}%</p>
        </div>
        <div>
          <p className="font-bold text-amber-600">{passives}</p>
          <p className="text-gray-400">{lang === "bn" ? "নিরপেক্ষ" : "Passives"}</p>
          <p className="text-gray-500">{paPct}%</p>
        </div>
        <div>
          <p className="font-bold text-rose-600">{detractors}</p>
          <p className="text-gray-400">{lang === "bn" ? "সমালোচক" : "Detractors"}</p>
          <p className="text-gray-500">{dPct}%</p>
        </div>
      </div>
    </div>
  );
}
