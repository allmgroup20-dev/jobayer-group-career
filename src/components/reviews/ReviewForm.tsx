"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { StarInput } from "./StarRating";

interface Props {
  productId: string;
  productType?: string;
  workerId: string;
  onSubmitted?: () => void;
}

export function ReviewForm({ productId, productType = "course", workerId, onSubmitted }: Props) {
  const { lang } = useLanguageStore();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setMessage(lang === "bn" ? "দয়া করে রেটিং দিন" : "Please select a rating"); return; }
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workerId, productId, productType, rating, reviewText }),
      });
      if (res.ok) {
        setMessage(lang === "bn" ? "রিভিউ দেওয়া হয়েছে!" : "Review submitted!");
        setRating(0);
        setReviewText("");
        onSubmitted?.();
      } else {
        setMessage(lang === "bn" ? "সাবমিট করতে ব্যর্থ" : "Failed to submit");
      }
    } catch {
      setMessage(lang === "bn" ? "সাবমিট করতে ব্যর্থ" : "Failed to submit");
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          {lang === "bn" ? "আপনার রেটিং" : "Your Rating"}
        </label>
        <StarInput value={rating} onChange={setRating} />
      </div>
      <div>
        <textarea
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          placeholder={lang === "bn" ? "আপনার মতামত লিখুন (ঐচ্ছিক)..." : "Write your review (optional)..."}
          rows={3}
          className="w-full px-4 py-2 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? (lang === "bn" ? "দেওয়া হচ্ছে..." : "Submitting...") : lang === "bn" ? "রিভিউ দিন" : "Submit Review"}
      </button>
      {message && <p className="text-sm text-green-600">{message}</p>}
    </form>
  );
}
