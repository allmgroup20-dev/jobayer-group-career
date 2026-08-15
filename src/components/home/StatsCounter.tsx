"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { stats } from "@/data/home/stats";

export default function StatsCounter() {
  const { lang } = useLanguageStore();
  const [counts, setCounts] = useState<{ students?: number; courses?: number }>({});

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/home/stats");
        const d = (await r.json()) as { students?: number; courses?: number };
        setCounts({ students: d.students, courses: d.courses });
      } catch {}
    })();
  }, []);

  return (
    <div className="relative">
      <div className="bg-white rounded-3xl border border-border/80 shadow-sm py-5 px-4 md:py-6 md:px-8">
        <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-3 md:gap-x-10">
          {stats.map((item, i) => {
            if (item.separator) return <div key={i} className="w-px h-8 bg-gradient-to-b from-transparent via-border to-transparent" />;
            if (item.textBn || item.textEn) {
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                    {lang === "bn" ? item.textBn : item.textEn}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-text-secondary tracking-wide uppercase leading-tight">
                    {lang === "bn" ? item.labelBn : item.labelEn}
                  </span>
                </div>
              );
            }
            const val = item.key === "courses" ? counts.courses : counts.students;
            return (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                  {val != null ? val.toLocaleString("en-IN") : item.num}
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
