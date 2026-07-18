"use client";

import { useState, useEffect } from "react";
import { useLanguageStore } from "@/lib/store";
import { Card } from "@/components/ui/Card";

interface ReviewRow {
  id: number;
  worker_id: string;
  product_id: string;
  product_type: string;
  rating: number;
  review_text: string | null;
  is_approved: number;
  created_at: string;
  worker_name: string | null;
}

export default function CompanyReviewsPage() {
  const { lang } = useLanguageStore();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [showAll, setShowAll] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json() as { reviews: ReviewRow[] };
      let all = data.reviews || [];
      // Also fetch unapproved (admin sees all)
      const adminRes = await fetch(`/api/reviews?unapproved=1`);
      if (adminRes.ok) {
        const adminData = await adminRes.json() as { reviews: ReviewRow[] };
        all = [...all, ...(adminData.reviews || [])];
      }
      // Deduplicate
      const seen = new Set<number>();
      const deduped = all.filter(r => { if (seen.has(r.id)) return false; seen.add(r.id); return true; });
      setReviews(deduped);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleApprove = async (id: number, current: number) => {
    const next = current ? 0 : 1;
    await fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: next }),
    });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: next } : r));
  };

  const deleteReview = async (id: number) => {
    if (!confirm(lang === "bn" ? "রিভিউটি মুছে ফেলবেন?" : "Delete this review?")) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reviews.filter(r =>
    filter === "all" ? true : filter === "pending" ? r.is_approved === 0 : r.is_approved === 1
  );

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleString(lang === "bn" ? "bn-BD" : "en-US"); } catch { return d; }
  };

  return (
    <div className="min-h-screen py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {lang === "bn" ? "রিভিউ ম্যানেজমেন্ট" : "Review Management"}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {reviews.length} {lang === "bn" ? "টি রিভিউ" : "reviews"} ({reviews.filter(r => r.is_approved === 0).length} {lang === "bn" ? "অনুমোদিত নয়" : "pending"})
            </p>
          </div>
          <div className="flex gap-2">
            {(["pending", "approved", "all"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? "bg-primary text-white" : "bg-white border border-border text-text-secondary hover:bg-primary/5"}`}
              >
                {f === "pending" ? (lang === "bn" ? "অনুমোদিত নয়" : "Pending") : f === "approved" ? (lang === "bn" ? "অনুমোদিত" : "Approved") : (lang === "bn" ? "সব" : "All")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-text-secondary">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">{lang === "bn" ? "কোনো রিভিউ নেই" : "No reviews"}</div>
        ) : (
          <div className="space-y-3">
            {filtered.slice(0, showAll ? filtered.length : 50).map((r) => (
              <Card key={r.id} className={`!p-4 ${!r.is_approved ? "border-l-4 border-l-orange-400" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className="text-center shrink-0">
                    <div className="text-xl font-bold text-primary">{r.rating}</div>
                    <div className="text-yellow-500 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-primary">{r.worker_name || r.worker_id}</span>
                      <span className="text-xs text-text-secondary">· {r.product_id}</span>
                      <span className="text-xs text-text-secondary capitalize">({r.product_type})</span>
                      <span className="text-xs text-gray-400 ml-auto">{formatDate(r.created_at)}</span>
                    </div>
                    {r.review_text && <p className="text-sm text-text-secondary mt-1">{r.review_text}</p>}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => toggleApprove(r.id, r.is_approved)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${r.is_approved ? "bg-gray-100 text-text-secondary hover:bg-orange-100 hover:text-orange-700" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                      >
                        {r.is_approved ? (lang === "bn" ? "অননুমোদিত করুন" : "Unapprove") : (lang === "bn" ? "অনুমোদন করুন" : "Approve")}
                      </button>
                      <button
                        onClick={() => deleteReview(r.id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        {lang === "bn" ? "মুছুন" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {!showAll && filtered.length > 50 && (
              <button onClick={() => setShowAll(true)} className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                {lang === "bn" ? `আরও ${filtered.length - 50}টি দেখুন` : `Show ${filtered.length - 50} more`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
