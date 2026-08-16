"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { useSiteContent } from "@/lib/use-site-content";
import { faqs } from "@/data/home/faq";

interface DbReview {
  id: number;
  worker_id: number;
  product_id: number;
  product_type: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  worker_name: string | null;
}

const faqDefaults = { faqs };
type FaqContent = typeof faqDefaults;

function stars(rating: number) {
  return "★".repeat(Math.max(1, Math.min(5, Math.round(rating))));
}

export default function ReviewsPage() {
  const { lang } = useLanguageStore();
  const { content, enabled: faqEnabled } = useSiteContent<FaqContent>("faq", faqDefaults);
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json().catch(() => null))
      .then(d => {
        if (d && Array.isArray((d as { reviews?: DbReview[] }).reviews)) setReviews((d as { reviews: DbReview[] }).reviews);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = reviews.slice(0, 3);
  const visibleGrid = showAllGrid ? reviews : reviews.slice(0, 16);
  const faqList = content.faqs;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
        {/* Hero Header */}
        <div className="text-center mb-2">
          <div className="badge mx-auto mb-3 bg-info/10 text-info border-info/20">💬 {lang === "bn" ? "শিক্ষার্থীদের মতামত" : "Student Reviews"}</div>
          <h1 className="text-2xl md:text-3xl font-black text-text">
            {lang === "bn"
              ? "রিসোর্স ও গাইড ব্যবহারকারীদের মতামত"
              : "Reviews from real users of our resources & guides"}
          </h1>
          <p className="text-text-secondary font-semibold mt-2 max-w-2xl mx-auto">
            {lang === "bn"
              ? `${reviews.length} জন ব্যবহারকারীর মতামত — প্রতিটি রিভিউ মডারেশন-অনুমোদিত`
              : `${reviews.length} verified user reviews — every review is moderation-approved`}
          </p>
        </div>

        {/* Featured slider */}
        {featured.length > 0 && (
          <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
            <div className="section-header mb-5">
              <div className="badge mx-auto mb-3">🎠 {lang === "bn" ? "বিশেষ মতামত" : "Featured Reviews"}</div>
              <h3 className="text-lg md:text-xl font-black text-text">
                {lang === "bn" ? "শীর্ষ রেটেড রিভিউ" : "Top Rated Reviews"}
              </h3>
            </div>
            <div className="overflow-hidden relative">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${sliderIdx * 100}%)` }}>
                {featured.map((r) => (
                  <div key={r.id} className="min-w-full px-2 box-border">
                    <div className="p-6 md:p-7 rounded-xl bg-gradient-to-br from-info/5 to-orange-400/5 border border-info/20 text-center">
                      <div className="text-info text-xl mb-2.5">{stars(r.rating)} <span className="text-text-secondary text-sm font-bold">{r.rating.toFixed(1)}/5</span></div>
                      <p className="text-sm text-text leading-relaxed mb-3.5 italic">&ldquo;{r.review_text}&rdquo;</p>
                      <div className="font-bold text-sm text-info">{r.worker_name || "Anonymous"}</div>
                    </div>
                  </div>
                ))}
              </div>
              {featured.length > 1 && (
                <div className="flex justify-center gap-2 mt-3.5">
                  {featured.map((r, i) => (
                    <button key={r.id} onClick={() => setSliderIdx(i)} className={`w-2.5 h-2.5 rounded-full border-none p-0 cursor-pointer transition-all ${i === sliderIdx ? "bg-info scale-125" : "bg-border"}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* All reviews grid */}
        <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
          <div className="section-header mb-5">
            <div className="badge mx-auto mb-3">📋 {lang === "bn" ? "সকল মতামত" : "All Reviews"}</div>
            <h3 className="text-lg md:text-xl font-black text-text">
              {lang === "bn" ? `${reviews.length} জন ব্যবহারকারী` : `${reviews.length} Users`}
            </h3>
          </div>
          {loading ? (
            <p className="text-center text-text-secondary py-8">{lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}</p>
          ) : visibleGrid.length === 0 ? (
            <p className="text-center text-text-secondary py-8">
              {lang === "bn" ? "এখনো কোনো অনুমোদিত রিভিউ নেই।" : "No approved reviews yet."}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visibleGrid.map((r) => (
                  <div key={r.id} className="bg-bg border border-border rounded-xl p-4 hover:border-info/30 transition-all">
                    <div className="text-[#f59e0b] text-xs">{stars(r.rating)}</div>
                    <span className="text-text-secondary text-xs font-bold ml-1">{r.rating.toFixed(1)}/5</span>
                    <div className="font-bold text-sm text-text mt-1.5">{r.worker_name || "Anonymous"}</div>
                    <p className="text-sm text-text leading-relaxed mt-1.5">&ldquo;{r.review_text}&rdquo;</p>
                  </div>
                ))}
              </div>
              {!showAllGrid && reviews.length > 16 && (
                <div className="text-center mt-5">
                  <button
                    onClick={() => setShowAllGrid(true)}
                    className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-info text-white text-sm font-bold border-none cursor-pointer hover:bg-info/90 transition-colors shadow-lg shadow-info/30"
                  >
                    {lang === "bn" ? "আরো মতামত দেখুন" : "Show More Reviews"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* FAQ Section */}
        {faqEnabled && faqList.length > 0 && (
          <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
            <div className="section-header mb-5">
              <div className="badge mx-auto mb-3">🤔 {lang === "bn" ? "আপনার মনে কি প্রশ্ন আছে?" : "Have Questions?"}</div>
              <h3 className="text-lg md:text-xl font-black text-text">
                {lang === "bn" ? "সচরাচর জিজ্ঞাসা" : "Frequently Asked Questions"}
              </h3>
            </div>
            <div className="grid gap-3">
              {faqList.map((faq, i) => (
                <div key={i} className="rounded-xl bg-bg border border-border overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    aria-expanded={openFaq === i}
                    className="w-full flex items-center justify-between p-4 md:p-5 text-sm font-bold text-text bg-transparent border-none cursor-pointer text-left font-[inherit] hover:bg-primary/5 transition-colors"
                  >
                    <span>{lang === "bn" ? faq.qBn : faq.qEn}</span>
                    <span className={`text-text-secondary text-xs transition-transform duration-200 flex-shrink-0 ml-3 ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: openFaq === i ? "300px" : "0px", padding: openFaq === i ? "0 16px 16px" : "0 16px" }}
                  >
                    <p className="text-sm text-text-secondary leading-relaxed m-0">{lang === "bn" ? faq.aBn : faq.aEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}