"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function TestModePage() {
  const { lang } = useLanguageStore();
  const [isActive, setIsActive] = useState(false);
  const [mockCount, setMockCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  const toggleTestMode = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsActive(!isActive);
    setGenerating(false);
  };

  const generateMockData = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-fade-up">
          <h1 className="text-2xl font-bold text-primary">
            {lang === "bn" ? "টেস্ট মোড" : "Test Mode"}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {lang === "bn" ? "লাইভ যাওয়ার আগে মক ডাটা দিয়ে পুরো সিস্টেম টেস্ট করুন" : "Test your entire system with mock data before going live"}
          </p>
        </div>

        <div className="space-y-6">
          <Card className={`border-2 transition-all ${isActive ? "border-action shadow-lg shadow-action/10" : "border-border"}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isActive ? "bg-action animate-pulse" : "bg-gray-300"}`} />
                <div>
                  <h3 className="font-bold text-primary">
                    {isActive
                      ? (lang === "bn" ? "টেস্ট মোড সক্রিয়" : "Test Mode Active")
                      : (lang === "bn" ? "টেস্ট মোড নিষ্ক্রিয়" : "Test Mode Inactive")}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {isActive
                      ? (lang === "bn" ? "সমস্ত ডাটা মক/টেস্ট মোডে রয়েছে" : "All data is in mock/test mode")
                      : (lang === "bn" ? "সিস্টেম লাইভ ডাটা মোডে রয়েছে" : "System is in live data mode")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {lang === "bn" ? "মক ওয়ার্কার সংখ্যা" : "Number of Mock Workers"}
                </label>
                <input
                  type="range"
                  min="5"
                  max="200"
                  value={mockCount}
                  onChange={(e) => setMockCount(parseInt(e.target.value))}
                  className="w-full accent-action"
                />
                <p className="text-sm text-primary font-medium mt-1">{mockCount} {lang === "bn" ? "জন মক ওয়ার্কার" : "mock workers"}</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={toggleTestMode} loading={generating} variant={isActive ? "danger" : "primary"}>
                  {isActive
                    ? (lang === "bn" ? "টেস্ট মোড বন্ধ করুন" : "Stop Test Mode")
                    : (lang === "bn" ? "টেস্ট মোড চালু করুন" : "Activate Test Mode")}
                </Button>
                <Button onClick={generateMockData} loading={generating} variant="secondary">
                  {lang === "bn" ? "টেস্ট ডাটা তৈরি করুন" : "Generate Test Data"}
                </Button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-primary mb-4">{lang === "bn" ? "টেস্ট মোডে কী কী চেক করবেন" : "What to check in Test Mode"}</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { en: "User registration flow", bn: "ইউজার রেজিস্ট্রেশন ফ্লো" },
                { en: "Login (Worker + Company)", bn: "লগইন (ওয়ার্কার + কোম্পানি)" },
                { en: "MLM tree structure", bn: "এমএলএম ট্রি স্ট্রাকচার" },
                { en: "Commission calculation", bn: "কমিশন ক্যালকুলেশন" },
                { en: "Product purchase flow", bn: "পণ্য ক্রয় ফ্লো" },
                { en: "Payment integration", bn: "পেমেন্ট ইন্টিগ্রেশন" },
                { en: "WhatsApp notification", bn: "হোয়াটসঅ্যাপ নোটিফিকেশন" },
                { en: "Withdrawal process", bn: "উইথড্র প্রক্রিয়া" },
                { en: "Language switching", bn: "ভাষা পরিবর্তন" },
                { en: "Currency conversion", bn: "কারেন্সি কনভার্সন" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="text-action">✓</span>
                  {lang === "bn" ? item.bn : item.en}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
