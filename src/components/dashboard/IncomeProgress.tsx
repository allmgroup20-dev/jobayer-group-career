"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface LevelProgress {
  levelNumber: number; levelName: string; levelNameBn: string | null;
  percentage: number; fixedAmount: number;
  requiredMembers: number;
  targetIncome: number; actualIncome: number;
  isUnlocked: boolean; progressPct: number;
}

export default function IncomeProgress({ workerId, lang }: { workerId: string; lang: string }) {
  const [data, setData] = useState<{ levels: LevelProgress[]; totalEarned: number; currentLevel: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/mlm/team-stats?workerId=${workerId}`)
      .then(r => r.json() as Promise<{ levels: LevelProgress[]; totalEarned: number; currentLevel: number }>)
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workerId]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!data || !data.levels || data.levels.length === 0) return null;

  const format = (n: number | null | undefined) => ((n && isFinite(n)) ? n : 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-primary">
          {lang === "bn" ? "আয়ের অগ্রগতি" : "Income Progress"}
        </h2>
        <Link href="/dashboard/commissions" className="text-xs text-action hover:underline font-medium">
          {lang === "bn" ? "আয় বিস্তারিত →" : "Commission Details →"}
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.levels.map((level) => (
          <div
            key={level.levelNumber}
            className={`relative rounded-2xl p-5 border-2 transition-all ${
              level.isUnlocked
                ? "border-green-200 bg-green-50/50"
                : level.progressPct > 0
                  ? "border-amber-200 bg-amber-50/30"
                  : "border-gray-200 bg-white"
            }`}
          >
            {level.isUnlocked && (
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                level.levelNumber === 1 ? "bg-primary" :
                level.levelNumber === 2 ? "bg-action" :
                level.levelNumber === 3 ? "bg-secondary" :
                level.levelNumber === 4 ? "bg-purple-500" : "bg-accent"
              }`}>
                {level.levelNumber}
              </div>
              <div>
                <p className="font-semibold text-sm text-primary">
                  {lang === "bn" ? (level.levelNameBn || `লেভেল ${level.levelNumber}`) : level.levelName}
                </p>
                <p className="text-xs text-text-secondary">
                  {`${level.percentage ?? 0}% + ৳${level.fixedAmount ?? 0}`}
                </p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">
                  {lang === "bn" ? "টার্গেট" : "Target"}: <strong>{format(level.targetIncome)} ৳</strong>
                </span>
                <span className={(level.actualIncome || 0) >= (level.targetIncome || 0) ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                  {lang === "bn" ? "আয়" : "Earned"}: <strong>{format(level.actualIncome)} ৳</strong>
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    level.isUnlocked ? "bg-green-500" : "bg-amber-400"
                  }`}
                  style={{ width: `${level.progressPct}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-text-secondary mt-1">
              {level.isUnlocked
                ? (lang === "bn" ? "✔ সম্পন্ন — পরবর্তী লেভেলে যান" : "✔ Completed — Move to next level")
                : (lang === "bn"
                    ? `আরো ${format(Math.max(0, (level.targetIncome || 0) - (level.actualIncome || 0)))} ৳ প্রয়োজন`
                    : `${format(Math.max(0, (level.targetIncome || 0) - (level.actualIncome || 0)))} ৳ more needed`)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
