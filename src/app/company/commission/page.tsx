"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Product {
  id: number;
  name: string;
  nameBn: string | null;
  price: number;
  enableCommission: number;
  commissionOverride: string | null;
}

interface LevelConfig {
  levelNumber: number;
  percentage: number;
  fixedAmount: number;
}

export default function CompanyCommissionPage() {
  const { lang } = useLanguageStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [globalLevels, setGlobalLevels] = useState<LevelConfig[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [levels, setLevels] = useState<LevelConfig[]>([
    { levelNumber: 1, percentage: 10, fixedAmount: 100 },
    { levelNumber: 2, percentage: 5, fixedAmount: 50 },
    { levelNumber: 3, percentage: 0, fixedAmount: 10 },
    { levelNumber: 4, percentage: 0, fixedAmount: 5 },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const res = await fetch("/api/company/commissions");
      const data = await res.json() as { products?: Product[]; globalLevels?: LevelConfig[] };
      if (data.products) setProducts(data.products);
      if (data.globalLevels) setGlobalLevels(data.globalLevels);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSaved(false);
    setError("");
    if (product.commissionOverride) {
      try {
        setLevels(JSON.parse(product.commissionOverride) as LevelConfig[]);
      } catch {
        setLevels(globalLevels.map((g) => ({ ...g })));
      }
    } else {
      setLevels(globalLevels.map((g) => ({ ...g })));
    }
  };

  const handleLevelChange = (index: number, field: "percentage" | "fixedAmount", value: number) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };
    setLevels(updated);
  };

  const syncWithGlobal = () => {
    setLevels(globalLevels.map((g) => ({ ...g })));
  };

  const clearOverride = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/company/commissions?productId=${selectedProduct.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      await loadData();
      const updated = products.find((p) => p.id === selectedProduct.id);
      if (updated) selectProduct(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProduct) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const activeLevels = levels.filter((l) => l.percentage > 0 || l.fixedAmount > 0);
      const res = await fetch("/api/company/commissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProduct.id, levels: activeLevels }),
      });
      if (!res.ok) throw new Error("Save failed");
      await loadData();
      const updated = products.find((p) => p.id === selectedProduct.id);
      if (updated) selectProduct(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.nameBn && p.nameBn.includes(search))
  );

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "কমিশন কনফিগারেশন" : "Commission Configuration"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn"
              ? "প্রতি প্রোডাক্টের জন্য আলাদা কমিশন লেভেল সেট করুন — যেসব প্রোডাক্টে ওভাররাইড সেট করা থাকবে না সেগুলো গ্লোবাল লেভেল ব্যবহার করবে"
              : "Set per-product commission level overrides — products without override will use global levels"}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <Card>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === "bn" ? "পণ্য খুঁজুন..." : "Search products..."}
                className="input-field w-full mb-3"
              />
              <div className="space-y-1 max-h-[500px] overflow-y-auto">
                {filteredProducts.map((p) => {
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
                {filteredProducts.length === 0 && (
                  <p className="text-center text-text-secondary text-sm py-8">
                    {lang === "bn" ? "কোনো পণ্য পাওয়া যায়নি" : "No products found"}
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
                    {lang === "bn" ? "কমিশন লেভেল ওভাররাইড" : "Commission Level Override"}
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
                    ? `"${selectedProduct.nameBn || selectedProduct.name}" — নিচে কমিশন লেভেল কনফিগার করুন`
                    : `"${selectedProduct.name}" — configure commission levels below`}
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
                      disabled={saving}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      {lang === "bn" ? "ওভাররাইড রিসেট" : "Reset to Global"}
                    </button>
                  )}
                </div>

                <p className="text-xs text-text-secondary mb-4 italic">
                  {lang === "bn"
                    ? "খালি রাখলে গ্লোবাল কমিশন লেভেল ব্যবহার হবে।"
                    : "Leave empty to use global commission levels."}
                </p>

                {error && (
                  <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>
                )}

                <div className="space-y-2">
                  {levels.map((level, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        L{level.levelNumber}
                      </div>
                      <div className="flex items-center gap-1.5 flex-1">
                        <input
                          type="number"
                          value={level.percentage}
                          onChange={(e) => handleLevelChange(i, "percentage", parseFloat(e.target.value) || 0)}
                          className="w-16 input-field !py-1.5 text-xs text-center"
                          min="0"
                          max="100"
                          step="0.5"
                        />
                        <span className="text-xs font-medium text-text-secondary">%</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={level.fixedAmount}
                          onChange={(e) => handleLevelChange(i, "fixedAmount", parseFloat(e.target.value) || 0)}
                          className="w-16 input-field !py-1.5 text-xs text-center"
                          min="0"
                          step="1"
                        />
                        <span className="text-xs font-medium text-text-secondary">৳</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button onClick={handleSave} disabled={saving} className="flex-1">
                    {saving
                      ? (lang === "bn" ? "সংরক্ষণ..." : "Saving...")
                      : saved
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
                      ? "বাম পাশ থেকে একটি পণ্য নির্বাচন করুন এর কমিশন লেভেল কনফিগার করতে"
                      : "Select a product from the left to configure its commission levels"}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
