"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const defaultLevels = [
  { level: 1, name: "Level 1", nameBn: "লেভেল ১", percentage: 10, fixed: 0 },
  { level: 2, name: "Level 2", nameBn: "লেভেল ২", percentage: 5, fixed: 0 },
  { level: 3, name: "Level 3", nameBn: "লেভেল ৩", percentage: 3, fixed: 0 },
  { level: 4, name: "Level 4", nameBn: "লেভেল ৪", percentage: 2, fixed: 0 },
  { level: 5, name: "Level 5", nameBn: "লেভেল ৫", percentage: 1, fixed: 0 },
];

export default function CompanyLevelsPage() {
  const { lang } = useLanguageStore();
  const [levels, setLevels] = useState(defaultLevels);
  const [maxLevels, setMaxLevels] = useState(5);
  const [saved, setSaved] = useState(false);

  const handleChange = (index: number, field: "percentage" | "fixed", value: number) => {
    const updated = [...levels];
    updated[index] = { ...updated[index], [field]: value };
    setLevels(updated);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-primary">{lang === "bn" ? "কমিশন লেভেল" : "Commission Levels"}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "ইউনিলেভেল কমিশন স্ট্রাকচার কনফিগার করুন" : "Configure your unilevel commission structure"}
          </p>
        </div>

        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-primary">{lang === "bn" ? "সর্বোচ্চ লেভেল" : "Maximum Levels"}</h3>
            <div className="flex items-center gap-2">
              <button onClick={() => setMaxLevels(Math.max(1, maxLevels - 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50">−</button>
              <span className="w-10 text-center font-bold text-lg text-primary">{maxLevels}</span>
              <button onClick={() => setMaxLevels(Math.min(20, maxLevels + 1))} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-gray-50">+</button>
            </div>
          </div>
          <p className="text-xs text-text-secondary">
            {lang === "bn" ? "লেভেল সংখ্যা বাড়ালে নতুন লেভেল যুক্ত হবে, কমালে শেষের লেভেল মুছে যাবে" : "Increasing levels adds new rows, decreasing removes the last ones"}
          </p>
        </Card>

        <div className="space-y-3">
          {levels.slice(0, maxLevels).map((level, i) => (
            <Card key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {level.level}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-primary">{lang === "bn" ? level.nameBn : level.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-xs text-text-secondary block mb-1">%</label>
                  <input type="number" value={level.percentage} onChange={(e) => handleChange(i, "percentage", parseFloat(e.target.value) || 0)} className="w-20 input-field !py-1.5 text-sm text-center" />
                </div>
                <div>
                  <label className="text-xs text-text-secondary block mb-1">{lang === "bn" ? "ফিক্সড" : "Fixed"} (৳)</label>
                  <input type="number" value={level.fixed} onChange={(e) => handleChange(i, "fixed", parseFloat(e.target.value) || 0)} className="w-20 input-field !py-1.5 text-sm text-center" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={handleSave} className="mt-6 w-full !py-4">
          {saved ? (lang === "bn" ? "✓ সংরক্ষিত হয়েছে" : "✓ Saved") : (lang === "bn" ? "সেভ করুন" : "Save Changes")}
        </Button>
      </div>
    </div>
  );
}
