"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface LevelItem {
  levelNumber: number;
  levelName: string;
  percentage: number;
  fixedAmount: number;
  commissionType: string;
  referrals?: number;
  potentialIncome?: number;
}

const defaultLevels: LevelItem[] = [
  { levelNumber: 1, levelName: "Level 1", percentage: 10, fixedAmount: 0, commissionType: "both" },
  { levelNumber: 2, levelName: "Level 2", percentage: 5, fixedAmount: 0, commissionType: "both" },
  { levelNumber: 3, levelName: "Level 3", percentage: 3, fixedAmount: 0, commissionType: "both" },
  { levelNumber: 4, levelName: "Level 4", percentage: 2, fixedAmount: 0, commissionType: "both" },
  { levelNumber: 5, levelName: "Level 5", percentage: 1, fixedAmount: 0, commissionType: "both" },
];

export default function CompanyLevelsPage() {
  const { lang } = useLanguageStore();
  const [levels, setLevels] = useState<LevelItem[]>([]);
  const [maxLevels, setMaxLevels] = useState(5);
  const [minReferralBase, setMinReferralBase] = useState(3);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/mlm/levels")
      .then((r) => r.json())
      .then((data: any) => {
        const base = data.minReferralBase ?? 3;
        setMinReferralBase(base);
        if (data.levels && data.levels.length > 0) {
          const mapped = data.levels.map((l: any) => ({
            levelNumber: l.levelNumber,
            levelName: l.levelName || `Level ${l.levelNumber}`,
            percentage: l.percentage || 0,
            fixedAmount: l.fixedAmount || 0,
            commissionType: l.commissionType || "both",
            referrals: l.referrals,
            potentialIncome: l.potentialIncome,
          }));
          setLevels(mapped);
          setMaxLevels(mapped.length);
        } else {
          setLevels(defaultLevels.map((d) => ({ ...d, referrals: Math.pow(base, d.levelNumber), potentialIncome: 0 })));
          setMaxLevels(5);
        }
        setLoading(false);
      })
      .catch(() => {
        setLevels(defaultLevels.map((d) => ({ ...d, referrals: Math.pow(3, d.levelNumber), potentialIncome: 0 })));
        setMaxLevels(5);
        setLoading(false);
      });
  }, []);

  const computeReferrals = (base: number, levelNum: number) => Math.pow(base, levelNum);

  const handleLevelsCount = (n: number) => {
    const count = Math.max(1, Math.min(20, n));
    setMaxLevels(count);
    if (count > levels.length) {
      const newLevels = [...levels];
      for (let i = levels.length + 1; i <= count; i++) {
        newLevels.push({ levelNumber: i, levelName: `Level ${i}`, percentage: 0, fixedAmount: 0, commissionType: "both" });
      }
      setLevels(newLevels);
    }
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...levels];
    (updated[index] as any)[field] = value;
    setLevels(updated);
  };

  const handleSave = async () => {
    setSaved(false);
    setError("");
    setSaving(true);
    try {
      const activeLevels = levels.slice(0, maxLevels).map((l, i) => ({
        levelNumber: i + 1,
        levelName: l.levelName || `Level ${i + 1}`,
        percentage: typeof l.percentage === "number" ? l.percentage : parseFloat(l.percentage as any) || 0,
        fixedAmount: typeof l.fixedAmount === "number" ? l.fixedAmount : parseFloat(l.fixedAmount as any) || 0,
        commissionType: l.commissionType || "both",
      }));

      const res = await fetch("/api/mlm/levels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ levels: activeLevels, minReferralBase }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error || "Save failed");

      const verifyRes = await fetch("/api/mlm/levels");
      const verifyData = await verifyRes.json() as { levels?: any[] };
      if (!verifyData.levels || verifyData.levels.length === 0) {
        throw new Error("Data was not persisted in database");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 bg-gray-50 flex items-center justify-center">
        <p className="text-text-secondary">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "কমিশন লেভেল" : "Commission Levels"}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "ইউনিলেভেল কমিশন স্ট্রাকচার কনফিগার করুন — পার্সেন্টেজ ও ফিক্সড অ্যামাউন্ট সিলেক্ট করে নির্ধারণ করুন" : "Configure your unilevel commission structure — select percentage, fixed, or both per level"}
          </p>
        </div>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-primary">{lang === "bn" ? "সর্বোচ্চ লেভেল" : "Maximum Levels"}</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {lang === "bn" ? "লেভেল সংখ্যা বাড়ালে নতুন লেভেল যুক্ত হবে, কমালে শেষের লেভেল নিষ্ক্রিয় হবে" : "Increase to add levels, decrease to deactivate trailing levels"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleLevelsCount(maxLevels - 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50 transition-colors">−</button>
              <span className="w-10 text-center font-bold text-lg text-primary">{maxLevels}</span>
              <button onClick={() => handleLevelsCount(maxLevels + 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50 transition-colors">+</button>
            </div>
          </div>
        </Card>

        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-primary">{lang === "bn" ? "সর্বনিম্ন রেফারেল গুণিতক" : "Minimum Referral Multiplier"}</h3>
              <p className="text-xs text-text-secondary mt-0.5">
                {lang === "bn" ? "প্রতি লেভেলে প্রয়োজনীয় সদস্য সংখ্যা (Level 1 = base, Level 2 = base², Level 3 = base³ ...)" : "Required members per level (Level 1 = base, Level 2 = base², Level 3 = base³ ...)"}
              </p>
            </div>
            <input
              type="number"
              value={minReferralBase}
              onChange={(e) => {
                const v = parseInt(e.target.value) || 1;
                setMinReferralBase(Math.max(1, v));
              }}
              className="w-20 input-field !py-1.5 text-lg text-center font-bold"
              min="1"
              max="20"
            />
          </div>
        </Card>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        <div className="space-y-3">
          {levels.slice(0, maxLevels).map((level, i) => {
            const referrals = computeReferrals(minReferralBase, i + 1);
            const usePct = level.commissionType === "percentage" || level.commissionType === "both";
            const useFixed = level.commissionType === "fixed" || level.commissionType === "both";
            const potentialIncome = referrals * (useFixed ? level.fixedAmount : 0);

            return (
              <Card key={i}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-sm">
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    value={level.levelName}
                    onChange={(e) => handleChange(i, "levelName", e.target.value)}
                    className="input-field flex-1 !py-1.5 text-sm font-semibold"
                    placeholder={lang === "bn" ? `লেভেল ${i + 1} এর নাম` : `Level ${i + 1} name`}
                  />
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={usePct}
                      onChange={() => {
                        const ct = level.commissionType;
                        if (ct === "both") handleChange(i, "commissionType", "fixed");
                        else if (ct === "percentage") handleChange(i, "commissionType", "both");
                        else handleChange(i, "commissionType", "percentage");
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-xs font-medium text-text-secondary">%</span>
                    <input
                      type="number"
                      value={level.percentage}
                      onChange={(e) => handleChange(i, "percentage", parseFloat(e.target.value) || 0)}
                      disabled={!usePct}
                      className={`w-16 input-field !py-1 text-xs text-center ${!usePct ? "opacity-40" : ""}`}
                      min="0"
                      max="100"
                      step="0.5"
                    />
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useFixed}
                      onChange={() => {
                        const ct = level.commissionType;
                        if (ct === "both") handleChange(i, "commissionType", "percentage");
                        else if (ct === "fixed") handleChange(i, "commissionType", "both");
                        else handleChange(i, "commissionType", "fixed");
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-xs font-medium text-text-secondary">{lang === "bn" ? "ফিক্সড" : "Fixed"} (৳)</span>
                    <input
                      type="number"
                      value={level.fixedAmount}
                      onChange={(e) => handleChange(i, "fixedAmount", parseFloat(e.target.value) || 0)}
                      disabled={!useFixed}
                      className={`w-16 input-field !py-1 text-xs text-center ${!useFixed ? "opacity-40" : ""}`}
                      min="0"
                      step="1"
                    />
                  </label>

                  <div className="ml-auto text-right">
                    <div className="text-xs text-text-secondary">
                      {lang === "bn" ? "লক্ষ্য" : "Target"}: <span className="font-semibold text-primary">{referrals.toLocaleString()}</span> {lang === "bn" ? "জন" : "members"}
                    </div>
                    {potentialIncome > 0 && (
                      <div className="text-xs text-emerald-600 font-semibold">
                        ৳{potentialIncome.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-6 w-full !py-4 font-semibold">
          {saving
            ? (lang === "bn" ? "সংরক্ষণ করা হচ্ছে..." : "Saving...")
            : saved
              ? (lang === "bn" ? "✓ ডাটাবেজে সংরক্ষিত হয়েছে" : "✓ Saved to Database")
              : (lang === "bn" ? "ডাটাবেজে সেভ করুন" : "Save to Database")}
        </Button>
      </div>
    </div>
  );
}
