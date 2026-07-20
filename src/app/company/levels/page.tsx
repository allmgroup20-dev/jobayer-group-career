"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface Product {
  id: number;
  name: string;
  nameBn: string | null;
  price: number;
  enableCommission: number;
  commissionOverride: string | null;
}

interface LevelItem {
  levelNumber: number;
  levelName: string;
  levelNameBn?: string | null;
  percentage: number;
  fixedAmount: number;
  commissionType: string;
  referrals?: number;
  potentialIncome?: number;
}

const defaultLevels: LevelItem[] = [
  { levelNumber: 1, levelName: "Level 1", levelNameBn: "লেভেল ১", percentage: 10, fixedAmount: 0, commissionType: "both" },
  { levelNumber: 2, levelName: "Level 2", levelNameBn: "লেভেল ২", percentage: 5, fixedAmount: 0, commissionType: "both" },
  { levelNumber: 3, levelName: "Level 3", levelNameBn: "লেভেল ৩", percentage: 3, fixedAmount: 0, commissionType: "both" },
  { levelNumber: 4, levelName: "Level 4", levelNameBn: "লেভেল ৪", percentage: 2, fixedAmount: 0, commissionType: "both" },
  { levelNumber: 5, levelName: "Level 5", levelNameBn: "লেভেল ৫", percentage: 1, fixedAmount: 0, commissionType: "both" },
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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [overrideLevels, setOverrideLevels] = useState<{ levelNumber: number; percentage: number; fixedAmount: number; commissionType: string }[]>([]);
  const [globalLevelsRef, setGlobalLevelsRef] = useState<{ levelNumber: number; percentage: number; fixedAmount: number }[]>([]);
  const [overrideSaving, setOverrideSaving] = useState(false);
  const [overrideSaved, setOverrideSaved] = useState(false);
  const [overrideError, setOverrideError] = useState("");

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
            levelNameBn: l.levelNameBn || null,
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

    fetch("/api/company/commissions")
      .then((r) => r.json())
      .then((data: any) => {
        if (data.products) setProducts(data.products);
        if (data.globalLevels) {
          setGlobalLevelsRef(data.globalLevels);
          setOverrideLevels(data.globalLevels.map((g: any) => ({ ...g })));
        }
      })
      .catch(() => {});
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
        levelNameBn: l.levelNameBn || null,
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

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setOverrideSaved(false);
    setOverrideError("");
    if (product.commissionOverride) {
      try {
        const parsed = JSON.parse(product.commissionOverride) as { levelNumber: number; percentage: number; fixedAmount: number }[];
        setOverrideLevels(parsed.map((l) => {
          const usePct = l.percentage > 0;
          const useFixed = l.fixedAmount > 0;
          const ct = usePct && useFixed ? "both" : usePct ? "percentage" : useFixed ? "fixed" : "both";
          return { ...l, commissionType: ct };
        }));
      } catch {
        setOverrideLevels(globalLevelsRef.map((g) => ({ ...g, commissionType: "both" })));
      }
    } else {
      setOverrideLevels(globalLevelsRef.map((g) => ({ ...g, commissionType: "both" })));
    }
  };

  const syncWithGlobal = () => {
    setOverrideLevels(globalLevelsRef.map((g) => ({ ...g, commissionType: "both" })));
  };

  const toggleOverrideType = (index: number, type: "pct" | "fixed") => {
    setOverrideLevels((prev) => {
      const updated = [...prev];
      const ct = updated[index].commissionType;
      if (type === "pct") {
        updated[index] = { ...updated[index], commissionType: ct === "both" ? "fixed" : ct === "percentage" ? "both" : "percentage" };
      } else {
        updated[index] = { ...updated[index], commissionType: ct === "both" ? "percentage" : ct === "fixed" ? "both" : "fixed" };
      }
      return updated;
    });
  };

  const handleOverrideChange = (index: number, field: "percentage" | "fixedAmount", value: number) => {
    const updated = [...overrideLevels];
    updated[index] = { ...updated[index], [field]: value };
    setOverrideLevels(updated);
  };

  const clearOverride = async () => {
    if (!selectedProduct) return;
    setOverrideSaving(true);
    setOverrideError("");
    try {
      const res = await fetch(`/api/company/commissions?productId=${selectedProduct.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      const updated = products.find((p) => p.id === selectedProduct.id);
      if (updated) {
        const refreshed = { ...updated, commissionOverride: null };
        setProducts(products.map((p) => p.id === refreshed.id ? refreshed : p));
        selectProduct(refreshed);
      }
      setOverrideSaved(true);
      setTimeout(() => setOverrideSaved(false), 3000);
    } catch (err) {
      setOverrideError(err instanceof Error ? err.message : "Error");
    } finally {
      setOverrideSaving(false);
    }
  };

  const handleOverrideSave = async () => {
    if (!selectedProduct) return;
    setOverrideSaving(true);
    setOverrideSaved(false);
    setOverrideError("");
    try {
      const active = overrideLevels
        .filter((l) => l.commissionType === "both" || l.commissionType === "percentage" || l.commissionType === "fixed")
        .map((l) => ({ levelNumber: l.levelNumber, percentage: l.commissionType !== "fixed" ? l.percentage : 0, fixedAmount: l.commissionType !== "percentage" ? l.fixedAmount : 0 }));
      const res = await fetch("/api/company/commissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id, levels: active }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated = products.find((p) => p.id === selectedProduct.id);
      if (updated) {
        const refreshed = { ...updated, commissionOverride: JSON.stringify(active) };
        setProducts(products.map((p) => p.id === refreshed.id ? refreshed : p));
        selectProduct(refreshed);
      }
      setOverrideSaved(true);
      setTimeout(() => setOverrideSaved(false), 3000);
    } catch (err) {
      setOverrideError(err instanceof Error ? err.message : "Error");
    } finally {
      setOverrideSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-24 px-4 bg-gray-50 flex items-center justify-center">
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "আয় লেভেল" : "Commission Levels"}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "ইউনিলেভেল আয় স্ট্রাকচার কনফিগার করুন — পার্সেন্টেজ ও ফিক্সড অ্যামাউন্ট সিলেক্ট করে নির্ধারণ করুন" : "Configure your unilevel commission structure — select percentage, fixed, or both per level"}
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
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={level.levelName}
                      onChange={(e) => handleChange(i, "levelName", e.target.value)}
                      className="input-field w-full !py-1.5 text-sm font-semibold"
                      placeholder={`EN: Level ${i + 1}`}
                    />
                    <input
                      type="text"
                      value={level.levelNameBn || ""}
                      onChange={(e) => handleChange(i, "levelNameBn", e.target.value)}
                      className="input-field w-full !py-1.5 text-sm"
                      placeholder={`BN: লেভেল ${i + 1}`}
                    />
                  </div>
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

        <div className="mt-12 pt-8 border-t-2 border-border">
          <h2 className="text-xl font-bold text-primary mb-1">
            {lang === "bn" ? "পণ্য-ভিত্তিক আয় ওভাররাইড" : "Per-Product Commission Override"}
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            {lang === "bn"
              ? "প্রत्यেক পণ্যের জন্য আলাদা আয় লেভেল সেট করুন। ওভাররাইড না থাকলে গ্লোবাল লেভেল ব্যবহার হবে।"
              : "Set custom commission levels per product. Products without override use global levels."}
          </p>

          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {products.map((p) => {
                    const hasOverride = !!p.commissionOverride;
                    const isSelected = selectedProduct?.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => selectProduct(p)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all ${
                          isSelected
                            ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                            : "hover:bg-gray-50 text-text-secondary"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          hasOverride
                            ? "bg-accent border-accent"
                            : isSelected
                              ? "border-primary"
                              : "border-gray-300"
                        }`}>
                          {hasOverride && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {!hasOverride && isSelected && (
                            <div className="w-2.5 h-2.5 rounded bg-primary" />
                          )}
                        </div>
                        <span className="font-medium">{lang === "bn" && p.nameBn ? p.nameBn : p.name}</span>
                        {hasOverride && (
                          <span className="ml-auto text-xs font-medium text-accent shrink-0">
                            {lang === "bn" ? "কাস্টম" : "Custom"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  {products.length === 0 && (
                    <p className="text-center text-text-secondary text-sm py-8">
                      {lang === "bn" ? "কোনো পণ্য নেই" : "No products"}
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div>
              {selectedProduct ? (
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-primary text-sm">
                      {lang === "bn" ? "আয় লেভেল ওভাররাইড" : "Commission Level Override"}
                    </h3>
                    {selectedProduct.commissionOverride && (
                      <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {lang === "bn" ? "কাস্টম" : "Custom"}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-text-secondary mb-4">
                    {lang === "bn"
                      ? `"${selectedProduct.nameBn || selectedProduct.name}" — নিচে আয় লেভেল কনফিগার করুন`
                      : `"${selectedProduct.name}" — configure levels below`}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={syncWithGlobal}
                      className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      {lang === "bn" ? "গ্লোবাল লেভেল সিঙ্ক" : "Global Level Sync"}
                    </button>
                    {selectedProduct.commissionOverride && (
                      <button
                        onClick={clearOverride}
                        disabled={overrideSaving}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        {lang === "bn" ? "ওভাররাইড রিসেট" : "Reset to Global"}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-text-secondary mb-4 italic">
                    {lang === "bn"
                      ? "খালি রাখলে গ্লোবাল আয় লেভেল ব্যবহার হবে।"
                      : "Leave empty to use global commission levels."}
                  </p>

                  {overrideError && (
                    <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{overrideError}</div>
                  )}

                  <div className="space-y-2">
                    {overrideLevels.map((level, i) => {
                      const usePct = level.commissionType === "percentage" || level.commissionType === "both";
                      const useFixed = level.commissionType === "fixed" || level.commissionType === "both";
                      return (
                        <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            L{level.levelNumber}
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={usePct}
                              onChange={() => toggleOverrideType(i, "pct")}
                              className="w-4 h-4 accent-primary"
                            />
                            <input
                              type="number"
                              value={level.percentage}
                              onChange={(e) => handleOverrideChange(i, "percentage", parseFloat(e.target.value) || 0)}
                              disabled={!usePct}
                              className={`w-14 input-field !py-1 text-xs text-center ${!usePct ? "opacity-40" : ""}`}
                              min="0"
                              max="100"
                              step="0.5"
                            />
                            <span className="text-xs font-medium text-text-secondary">%</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={useFixed}
                              onChange={() => toggleOverrideType(i, "fixed")}
                              className="w-4 h-4 accent-primary"
                            />
                            <input
                              type="number"
                              value={level.fixedAmount}
                              onChange={(e) => handleOverrideChange(i, "fixedAmount", parseFloat(e.target.value) || 0)}
                              disabled={!useFixed}
                              className={`w-14 input-field !py-1 text-xs text-center ${!useFixed ? "opacity-40" : ""}`}
                              min="0"
                              step="1"
                            />
                            <span className="text-xs font-medium text-text-secondary">৳</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button onClick={handleOverrideSave} disabled={overrideSaving} className="flex-1">
                      {overrideSaving
                        ? (lang === "bn" ? "সংরক্ষণ..." : "Saving...")
                        : overrideSaved
                          ? (lang === "bn" ? "✓ সংরক্ষিত" : "✓ Saved")
                          : (lang === "bn" ? "সেভ করুন" : "Save")}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="font-bold text-primary mb-1">
                      {lang === "bn" ? "কোনো পণ্য নির্বাচন করা হয়নি" : "No Product Selected"}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {lang === "bn"
                        ? "বাম পাশ থেকে একটি পণ্য নির্বাচন করুন"
                        : "Select a product from the left"}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
