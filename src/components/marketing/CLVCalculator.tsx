"use client";

import { useLanguageStore } from "@/lib/store";

interface CLVCalculatorProps {
  avgPurchase: number;
  frequency: number;
  lifetime: number;
  className?: string;
}

export function CLVCalculator({ avgPurchase, frequency, lifetime, className = "" }: CLVCalculatorProps) {
  const { lang } = useLanguageStore();
  const clv = avgPurchase * frequency * lifetime;

  const fields = [
    {
      key: "avgPurchase",
      labelEn: "Avg. Purchase Value",
      labelBn: "গড় ক্রয় মূল্য",
      value: avgPurchase,
      symbol: "$",
    },
    {
      key: "frequency",
      labelEn: "Purchase Frequency",
      labelBn: "ক্রয় ফ্রিকোয়েন্সি",
      value: frequency,
      symbol: "×",
    },
    {
      key: "lifetime",
      labelEn: "Customer Lifetime",
      labelBn: "গ্রাহক জীবনকাল",
      value: lifetime,
      symbol: "yr",
    },
  ];

  return (
    <div className={`rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/5 ${className}`}>
      <h3 className="text-sm font-bold text-gray-800">
        {lang === "bn" ? "গ্রাহক জীবনকাল মূল্য" : "Customer Lifetime Value"}
      </h3>
      <div className="mt-4 space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
            <span className="text-xs font-medium text-gray-500">
              {lang === "bn" ? f.labelBn : f.labelEn}
            </span>
            <span className="text-sm font-bold text-gray-900">
              {f.value.toLocaleString()}{f.symbol && <span className="ml-0.5 text-xs text-gray-400">{f.symbol}</span>}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4 shadow-lg">
        <span className="text-sm font-semibold text-white/80">
          {lang === "bn" ? "গ্রাহক জীবনকাল মূল্য" : "CLV"}
        </span>
        <span className="text-2xl font-extrabold text-white drop-shadow-sm">
          ${clv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="mt-2 text-center text-[10px] text-gray-400">
        {avgPurchase} × {frequency} × {lifetime}
      </div>
    </div>
  );
}
