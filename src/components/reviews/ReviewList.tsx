"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { StarDisplay } from "./StarRating";

interface Review {
  id: number;
  worker_id: string;
  product_id: string;
  product_type: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  worker_name: string | null;
}

interface Stats {
  totalReviews: number;
  avgRating: number;
  distribution: Record<number, number>;
}

interface Props {
  productId: string;
  productType?: string;
}

export function ReviewList({ productId, productType = "course" }: Props) {
  const { lang } = useLanguageStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [revRes, statRes] = await Promise.all([
        fetch(`/api/reviews?productId=${productId}&productType=${productType}`),
        fetch(`/api/reviews/stats?productId=${productId}&productType=${productType}`),
      ]);
      const revData = await revRes.json() as { reviews: Review[] };
      const statData = await statRes.json() as Stats;
      setReviews(revData.reviews || []);
      setStats(statData);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [productId, productType]);

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US"); } catch { return d; }
  };

  if (loading) return <div className="text-sm text-text-secondary py-4">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</div>;

  return (
    <div className="space-y-4">
      {stats && stats.totalReviews > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.avgRating}</div>
            <StarDisplay rating={stats.avgRating} />
            <div className="text-xs text-text-secondary mt-1">{stats.totalReviews} {lang === "bn" ? "টি রিভিউ" : "reviews"}</div>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = stats.distribution[n] || 0;
              const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2 text-xs">
                  <span className="w-4 text-right text-text-secondary">{n}</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-500" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-text-secondary">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {reviews.length === 0 && !stats?.totalReviews && (
        <p className="text-sm text-text-secondary text-center py-4">
          {lang === "bn" ? "এখনো কোনো রিভিউ নেই" : "No reviews yet"}
        </p>
      )}

      <div className="space-y-3">
        {reviews.slice(0, showAll ? reviews.length : 30).map((r) => (
          <div key={r.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-primary">{r.worker_name || r.worker_id}</span>
              <StarDisplay rating={r.rating} />
              <span className="text-xs text-gray-400 ml-auto">{formatDate(r.created_at)}</span>
            </div>
            {r.review_text && <p className="text-sm text-text-secondary mt-1">{r.review_text}</p>}
          </div>
        ))}
        {reviews.length > 30 && !showAll && (
          <button onClick={() => setShowAll(true)} className="w-full text-center text-sm text-action hover:underline py-2">
            {lang === "bn" ? "আরও দেখুন" : "Show More"}
          </button>
        )}
      </div>
    </div>
  );
}
