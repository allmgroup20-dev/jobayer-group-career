"use client";

import { useLanguageStore } from "@/lib/store";

interface ServiceQualityRadarProps {
  data: {
    tangibility: number;
    reliability: number;
    responsiveness: number;
    assurance: number;
    empathy: number;
  };
  className?: string;
}

const dimensions = [
  { key: "tangibility", labelEn: "Tangibility", labelBn: "মূর্ততা", angle: -90 },
  { key: "reliability", labelEn: "Reliability", labelBn: "নির্ভরযোগ্যতা", angle: -18 },
  { key: "responsiveness", labelEn: "Responsiveness", labelBn: "প্রতিক্রিয়াশীলতা", angle: 54 },
  { key: "assurance", labelEn: "Assurance", labelBn: "নিশ্চয়তা", angle: 126 },
  { key: "empathy", labelEn: "Empathy", labelBn: "সহানুভূতি", angle: 198 },
];

const maxScore = 10;
const cx = 120;
const cy = 120;
const r = 100;

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

export function ServiceQualityRadar({ data, className = "" }: ServiceQualityRadarProps) {
  const { lang } = useLanguageStore();

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  const gridPolygons = gridLevels.map((level) => {
    const pts = dimensions.map((d) => polarToCartesian(cx, cy, r * level, d.angle));
    return pts.map((p) => `${p.x},${p.y}`).join(" ");
  });

  const dataPoints = dimensions.map((d) => {
    const val = data[d.key as keyof typeof data] ?? 0;
    const ratio = Math.min(val / maxScore, 1);
    return polarToCartesian(cx, cy, r * ratio, d.angle);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg viewBox="0 0 240 240" className="h-64 w-64">
        <defs>
          <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
          </radialGradient>
        </defs>
        {gridPolygons.map((poly, i) => (
          <polygon key={i} points={poly} fill="none" stroke="#e5e7eb" strokeWidth="1" className="transition-all" />
        ))}
        <polygon points={dataPolygon} fill="url(#radarFill)" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" className="transition-all duration-700" />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#6366f1" className="drop-shadow-sm transition-all duration-700" />
        ))}
        {dimensions.map((d) => {
          const pt = polarToCartesian(cx, cy, r + 16, d.angle);
          const val = data[d.key as keyof typeof data] ?? 0;
          return (
            <g key={d.key}>
              <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="middle" className="fill-gray-500 text-[7px] font-semibold">
                {lang === "bn" ? d.labelBn : d.labelEn}
              </text>
              <text x={pt.x} y={pt.y + 10} textAnchor="middle" dominantBaseline="middle" className="fill-gray-700 text-[6px] font-bold">
                {val.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-gray-400">
        {lang === "bn" ? "সেবার গুণমান রাডার" : "SERVQUAL Radar"}
      </p>
    </div>
  );
}
