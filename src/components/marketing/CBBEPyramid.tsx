"use client";

import { useLanguageStore } from "@/lib/store";

interface CBBEPyramidProps {
  data: {
    salience: number;
    performance: number;
    imagery: number;
    judgments: number;
    feelings: number;
    resonance: number;
  };
  className?: string;
}

const levels = [
  { key: "resonance", labelEn: "Resonance", labelBn: "অনুরণন", color: "from-purple-600 to-purple-500", maxW: 30 },
  { key: "judgments", labelEn: "Judgments", labelBn: "মূল্যায়ন", color: "from-blue-600 to-blue-500", maxW: 42 },
  { key: "feelings", labelEn: "Feelings", labelBn: "অনুভূতি", color: "from-sky-500 to-cyan-400", maxW: 54 },
  { key: "imagery", labelEn: "Imagery", labelBn: "ভাবমূর্তি", color: "from-teal-500 to-emerald-400", maxW: 66 },
  { key: "performance", labelEn: "Performance", labelBn: "কর্মক্ষমতা", color: "from-amber-500 to-yellow-400", maxW: 78 },
  { key: "salience", labelEn: "Salience", labelBn: "প্রাধান্য", color: "from-orange-500 to-red-400", maxW: 90 },
].reverse();

export function CBBEPyramid({ data, className = "" }: CBBEPyramidProps) {
  const { lang } = useLanguageStore();
  const maxScore = 10;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex w-full max-w-md flex-col items-center gap-1.5">
        {levels.map((level) => {
          const val = data[level.key as keyof typeof data] ?? 0;
          const pct = Math.min(val / maxScore, 1);
          const w = level.maxW + (100 - level.maxW) * pct;
          return (
            <div key={level.key} className="flex w-full items-center gap-2">
              <span className="w-24 text-right text-xs font-semibold text-gray-600">
                {lang === "bn" ? level.labelBn : level.labelEn}
              </span>
              <div className="flex-1">
                <div className="relative h-8 w-full overflow-hidden rounded-lg bg-gray-100 shadow-inner">
                  <div
                    className={`h-full rounded-lg bg-gradient-to-r ${level.color} transition-all duration-700`}
                    style={{ width: `${w}%` }}
                  >
                    <div className="flex h-full items-center justify-end px-3">
                      <span className="text-xs font-bold text-white drop-shadow-sm">
                        {val.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] font-medium uppercase tracking-widest text-gray-400">
        {lang === "bn" ? "ব্র্যান্ড ইক্যুইটি পিরামিড" : "CBBE Pyramid"}
      </p>
    </div>
  );
}
