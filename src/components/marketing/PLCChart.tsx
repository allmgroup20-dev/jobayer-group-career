"use client";

import { useLanguageStore } from "@/lib/store";

interface PLCChartProps {
  data: { introduction: number; growth: number; maturity: number; decline: number };
  className?: string;
}

const stageLabels = {
  introduction: { en: "Introduction", bn: "প্রবর্তন" },
  growth: { en: "Growth", bn: "বৃদ্ধি" },
  maturity: { en: "Maturity", bn: "পরিপক্বতা" },
  decline: { en: "Decline", bn: "পতন" },
};

export function PLCChart({ data, className = "" }: PLCChartProps) {
  const { lang } = useLanguageStore();
  const points = [
    { x: 0, y: 5, key: "introduction" },
    { x: 25, y: 30, key: "growth" },
    { x: 55, y: 85, key: "maturity" },
    { x: 80, y: 60, key: "decline" },
    { x: 100, y: 20, key: "declineEnd" },
  ];

  const vals = [data.introduction, data.growth, data.maturity, data.decline];
  const maxVal = Math.max(...vals, 1);

  const getVal = (key: string) => {
    if (key === "declineEnd") return data.decline * 0.4;
    return data[key as keyof typeof data] ?? 0;
  };

  const pathD = points.map((p, i) => {
    const yPct = 100 - (getVal(p.key) / maxVal) * 80 - 10;
    return `${i === 0 ? "M" : "L"} ${p.x} ${yPct}`;
  }).join(" ");

  return (
    <div className={`${className}`}>
      <div className="relative h-52 overflow-hidden rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/5">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="plcGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={`${pathD} L 100 100 L 0 100 Z`} fill="url(#plcGradient)" />
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {[data.introduction, data.growth, data.maturity, data.decline].map((val, i) => {
            const key = ["introduction", "growth", "maturity", "decline"][i];
            const p = points[i];
            const yPct = 100 - (val / maxVal) * 80 - 10;
            const label = stageLabels[key as keyof typeof stageLabels];
            return (
              <g key={key}>
                <circle cx={p.x} cy={yPct} r="3" fill="#6366f1" className="drop-shadow-sm" />
                <text x={p.x} y={yPct - 6} textAnchor="middle" className="fill-gray-700 text-[5px] font-semibold">
                  {val}
                </text>
                <text x={p.x} y={98} textAnchor="middle" className="fill-gray-400 text-[4px] font-medium">
                  {lang === "bn" ? label.bn : label.en}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
