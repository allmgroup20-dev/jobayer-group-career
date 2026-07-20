"use client";

import { useLanguageStore } from "@/lib/store";

interface SegmentMatrixProps {
  data: Array<{ base: string; name: string; count: number }>;
  className?: string;
}

const segmentColors: Record<string, string> = {
  geographic: "from-blue-500 to-cyan-400",
  demographic: "from-emerald-500 to-teal-400",
  psychographic: "from-violet-500 to-purple-400",
  behavioral: "from-orange-500 to-amber-400",
};

export function SegmentMatrix({ data, className = "" }: SegmentMatrixProps) {
  const { lang } = useLanguageStore();
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const labels: Record<string, string> = {
    geographic: lang === "bn" ? "ভৌগোলিক" : "Geographic",
    demographic: lang === "bn" ? "জনতাত্ত্বিক" : "Demographic",
    psychographic: lang === "bn" ? "মনস্তাত্ত্বিক" : "Psychographic",
    behavioral: lang === "bn" ? "আচরণগত" : "Behavioral",
  };

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 gap-4">
        {["geographic", "demographic", "psychographic", "behavioral"].map((base) => {
          const item = data.find((d) => d.base === base);
          const count = item?.count ?? 0;
          const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
          return (
            <div
              key={base}
              className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/5 transition-all hover:shadow-xl"
            >
              <div className="relative z-10">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  {labels[base]}
                </h3>
                <p className="mt-1 text-3xl font-bold text-gray-900">{count.toLocaleString()}</p>
                {item?.name && (
                  <p className="mt-0.5 text-sm text-gray-500">{item.name}</p>
                )}
              </div>
              <div className="relative z-10 mt-3 h-2.5 rounded-full bg-gray-100">
                <div
                  className={`h-2.5 rounded-full bg-gradient-to-r ${segmentColors[base] || "from-gray-400 to-gray-300"} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
