"use client";

import { useCallback, useEffect, useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ScreenshotItem {
  id: number;
  workerId: string;
  certificateLevel: number;
  status: string;
  kvKeys: string[];
  savedForAi: boolean;
  verifiedAt: string | null;
  createdAt: string;
  workerName: string | null;
  workerPhone: string | null;
}

export default function CompanyCertificatesPage() {
  const { lang } = useLanguageStore();
  const [items, setItems] = useState<ScreenshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "all" | "verified" | "rejected">("pending");
  const [saving, setSaving] = useState<number | null>(null);
  const [savedForAi, setSavedForAi] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/company/screenshots");
      const data = await res.json() as { screenshots?: ScreenshotItem[]; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setItems(data.screenshots || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (id: number, action: "verify" | "reject") => {
    setSaving(id);
    try {
      const res = await fetch("/api/company/screenshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, savedForAi: action === "verify" ? savedForAi : undefined }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        alert(data.error || "Failed");
      }
      setSavedForAi(false);
      load();
    } catch {} finally { setSaving(null); }
  };

  const filtered = items.filter(i => filter === "all" ? true : i.status === filter);
  const pendingCount = items.filter(i => i.status === "pending").length;

  const statusBadge = (s: string) => {
    if (s === "pending") return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">⏳ {lang === "bn" ? "অপেক্ষায়" : "Pending"}</span>;
    if (s === "verified") return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✅ {lang === "bn" ? "ভেরিফাইড" : "Verified"}</span>;
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">❌ {lang === "bn" ? "বাতিল" : "Rejected"}</span>;
  };

  const fmt = (d: string | null) => {
    if (!d) return "—";
    try { return new Date(d).toLocaleString(lang === "bn" ? "bn-BD" : "en-US"); } catch { return d; }
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-primary mb-1">
          {lang === "bn" ? "সার্টিফিকেট যাচাই" : "Certificate Verification"}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {lang === "bn"
            ? "রেফারেল অ্যাম্বাসেডর স্ক্রিনশট প্রমাণ — ছবিগুলো ৪৮ ঘণ্টা পরে নিজে থেকেই মুছে যাবে।"
            : "Referral Ambassador screenshot proofs — images auto-delete after 48 hours."}
        </p>

        <div className="flex items-center gap-2 mb-6">
          {(["pending", "all", "verified", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                filter === f ? "bg-primary text-white" : "bg-white text-primary border border-border"
              }`}
            >
              {f === "pending" ? (lang === "bn" ? `অপেক্ষায় (${pendingCount})` : `Pending (${pendingCount})`)
                : f === "all" ? (lang === "bn" ? "সব" : "All")
                : f === "verified" ? (lang === "bn" ? "ভেরিফাইড" : "Verified")
                : (lang === "bn" ? "বাতিল" : "Rejected")}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={savedForAi} onChange={(e) => setSavedForAi(e.target.checked)} className="accent-primary" />
            {lang === "bn" ? "AI প্রশিক্ষণের জন্য রাখুন" : "Keep for AI training"}
          </label>
        </div>

        <Card className="overflow-hidden !p-0">
          <div className="border-b border-border px-4 py-3">
            <p className="font-bold text-primary">
              {lang === "bn" ? "স্ক্রিনশট জমা" : "Screenshot submissions"}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-text-secondary text-sm">{lang === "bn" ? "লোড হচ্ছে…" : "Loading…"}</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-text-secondary text-sm">
              {lang === "bn" ? "কোনো জমা নেই।" : "No submissions."}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((it) => (
                <div key={it.id} className="p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-sm font-bold text-primary">{it.workerName || it.workerId}</p>
                      <p className="text-xs text-text-secondary font-mono">{it.workerPhone || it.workerId}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        #{it.id} • {fmt(it.createdAt)} {it.savedForAi && <span className="text-violet-600 font-semibold">• {lang === "bn" ? "AI-র জন্য রাখা" : "Kept for AI"}</span>}
                      </p>
                    </div>
                    {statusBadge(it.status)}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {it.kvKeys.map((k) => (
                      <a
                        key={k}
                        href={`/api/company/screenshots/image?key=${encodeURIComponent(k)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative"
                        title={lang === "bn" ? "ক্লিক করে বড় করে দেখুন" : "Click to enlarge"}
                      >
                        <img
                          src={`/api/company/screenshots/image?key=${encodeURIComponent(k)}`}
                          alt={`screenshot-${k.slice(-6)}`}
                          className="h-24 w-24 object-cover rounded-lg border border-border"
                        />
                      </a>
                    ))}
                  </div>

                  {it.status === "pending" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button onClick={() => act(it.id, "verify")} disabled={saving === it.id}>
                        {saving === it.id ? "..." : (lang === "bn" ? "✅ ভেরিফাই করুন" : "Verify")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => act(it.id, "reject")}
                        disabled={saving === it.id}
                        className="!text-red-600 !border-red-200 hover:!bg-red-50"
                      >
                        {saving === it.id ? "..." : (lang === "bn" ? "❌ বাতিল করুন" : "Reject")}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}