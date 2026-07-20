"use client";

import { useLanguageStore } from "@/lib/store";
import { stats } from "@/data/landing-page-data";

export default function StatsCounter() {
  const { lang } = useLanguageStore();

  return (
    <div className="relative">
      <div className="bg-white rounded-3xl border border-border/80 shadow-sm py-5 px-4 md:py-6 md:px-8">
        <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-3 md:gap-x-10">
          {stats.map((item, i) => {
            if (item.separator) return <div key={i} className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />;
            if (item.chipBn || item.chipEn) {
              return (
                <span key={i} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-accent/10 to-secondary/10 border border-accent/20 text-xs font-bold text-accent-dark leading-none">
                  {lang === "bn" ? item.chipBn : item.chipEn}
                </span>
              );
            }
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                  {item.num}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-text-secondary tracking-wide uppercase leading-tight">
                  {lang === "bn" ? item.labelBn : item.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
