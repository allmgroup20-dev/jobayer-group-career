"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSWRFetch } from "@/lib/use-swr-fetch";

interface Course {
  id: number; title: string; titleBn: string | null;
  isPremium: number; price: number;
}

interface Suggestion {
  suggestedPriceBDT: number;
  suggestedIsPremium: boolean;
  reasoning: string;
  confidence: number;
}

export default function AIPricingPage() {
  const { lang } = useLanguageStore();
  const { data, loading } = useSWRFetch<{ courses?: Course[] }>(
    "/api/courses",
    { ttlMs: 60_000 }
  );
  const courses = data?.courses ?? [];

  const [selectedId, setSelectedId] = useState("");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [modelUsed, setModelUsed] = useState("");

  const selectedCourse = courses.find(c => String(c.id) === selectedId);

  const handleAnalyze = async () => {
    if (!selectedId) return;
    setAnalyzing(true); setError(""); setSuggestion(null);
    try {
      const res = await fetch("/api/ai/course-pricing", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: parseInt(selectedId) }),
      });
      const data = await res.json() as {
        suggestion?: Suggestion; model?: string; error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setSuggestion(data.suggestion!);
      setModelUsed(data.model || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally { setAnalyzing(false); }
  };

  const handleApply = async () => {
    if (!selectedCourse || !suggestion) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: suggestion.suggestedPriceBDT,
          isPremium: suggestion.suggestedIsPremium ? 1 : 0,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      alert(lang === "bn" ? "আপডেট করা হয়েছে" : "Updated");
    } catch {
      alert("Failed to update");
    }
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {lang === "bn" ? "এআই প্রাইসিং সাজেশন" : "AI Pricing Suggestions"}
        </h1>
        <p className="text-sm text-text-secondary mb-8">
          {lang === "bn"
            ? "AI প্রতিটি রিসোর্সের জন্য প্রস্তাবিত মূল্য ও প্রিমিয়াম স্ট্যাটাস নির্ধারণ করে"
            : "AI analyzes each resource and suggests optimal pricing and premium status"}
        </p>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

        <Card className="mb-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                {lang === "bn" ? "রিসোর্স নির্বাচন করুন" : "Select Resource"}
              </label>
              <select value={selectedId} onChange={e => { setSelectedId(e.target.value); setSuggestion(null); }}
                className="input-field w-full">
                <option value="">{lang === "bn" ? "— নির্বাচন করুন —" : "— Select —"}</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.id}] {c.titleBn || c.title} — {c.isPremium ? `👑 ${c.price}৳` : "🆓 ফ্রি"}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAnalyze} disabled={!selectedId || analyzing} loading={analyzing}>
              🤖 {lang === "bn" ? "এনালাইসিস" : "Analyze"}
            </Button>
          </div>
        </Card>

        {selectedCourse && (
          <Card variant="glass" className="mb-6">
            <h3 className="font-bold text-primary mb-2">
              {selectedCourse.titleBn || selectedCourse.title}
            </h3>
            <div className="flex gap-4 text-sm text-text-secondary">
              <span>{lang === "bn" ? "বর্তমান মূল্য:" : "Current Price:"} <strong className="text-primary">{selectedCourse.price || 0}৳</strong></span>
              <span>{lang === "bn" ? "স্ট্যাটাস:" : "Status:"} <strong className={selectedCourse.isPremium ? "text-amber-600" : "text-green-600"}>{selectedCourse.isPremium ? "👑 Premium" : "🆓 Free"}</strong></span>
            </div>
          </Card>
        )}

        {suggestion && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary text-lg">
                🤖 {lang === "bn" ? "এআই সাজেশন" : "AI Suggestion"}
              </h3>
              {modelUsed && <span className="text-[10px] text-text-secondary/50 font-mono">{modelUsed}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-600 font-bold mb-1">{lang === "bn" ? "প্রস্তাবিত মূল্য" : "Suggested Price"}</p>
                <p className="text-2xl font-black text-primary">{suggestion.suggestedPriceBDT}৳</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-xs text-amber-600 font-bold mb-1">{lang === "bn" ? "প্রস্তাবিত স্ট্যাটাস" : "Suggested Status"}</p>
                <p className="text-2xl font-black">{suggestion.suggestedIsPremium ? "👑 Premium" : "🆓 Free"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${suggestion.confidence >= 0.7 ? "bg-green-500" : suggestion.confidence >= 0.4 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${suggestion.confidence * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-text-secondary">{Math.round(suggestion.confidence * 100)}%</span>
            </div>

            <p className="text-sm text-text-secondary bg-gray-50 rounded-xl p-3 mb-4">{suggestion.reasoning}</p>

            <div className="flex gap-3">
              <Button onClick={handleApply}>
                ✅ {lang === "bn" ? "সাজেশন প্রয়োগ করুন" : "Apply Suggestion"}
              </Button>
              <Button variant="outline" onClick={() => setSuggestion(null)}>
                {lang === "bn" ? "বাতিল" : "Dismiss"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
