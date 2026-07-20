"use client";

import { useLanguageStore } from "@/lib/store";

interface PerceptualMapProps {
  data: Array<{ name: string; x: number; y: number; isUs?: boolean }>;
  className?: string;
}

export function PerceptualMap({ data, className = "" }: PerceptualMapProps) {
  const { lang } = useLanguageStore();

  const title = lang === "bn" ? "অনুধাবন মানচিত্র" : "Perceptual Map";
  const xLabel = lang === "bn" ? "মূল্য →" : "Price →";
  const yLabel = lang === "bn" ? "গুণমান →" : "Quality →";

  return (
    <div className={`${className}`}>
      <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 shadow-lg ring-1 ring-black/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-12 top-1/2 -translate-y-1/2 rotate-[-90deg] text-xs font-medium tracking-wider text-gray-400 origin-left">
            {yLabel}
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium tracking-wider text-gray-400">
            {xLabel}
          </div>
        </div>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
          <line x1="50" y1="0" x2="50" y2="100" stroke="#e5e7eb" strokeWidth="0.5" />
        </svg>
        <div className="relative h-full w-full">
          <div className="absolute left-[10%] right-[10%] top-[10%] bottom-[10%]">
            {data.map((point) => {
              const left = `${point.x}%`;
              const top = `${100 - point.y}%`;
              return (
                <div
                  key={point.name}
                  className="absolute flex flex-col items-center transition-all hover:z-10"
                  style={{ left, top, transform: "translate(-50%, -50%)" }}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg transition-all hover:scale-125 ${
                      point.isUs
                        ? "bg-gradient-to-br from-rose-500 to-pink-500 ring-4 ring-rose-200"
                        : "bg-gradient-to-br from-blue-500 to-indigo-500"
                    }`}
                  >
                    {point.isUs ? "★" : point.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="mt-1 whitespace-nowrap rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-gray-700 shadow backdrop-blur-sm">
                    {point.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute bottom-2 left-4 text-xs text-gray-400">
          <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 mr-1 align-middle" />{" "}
          {lang === "bn" ? "আমাদের ব্র্যান্ড" : "Our Brand"}
        </div>
      </div>
    </div>
  );
}
