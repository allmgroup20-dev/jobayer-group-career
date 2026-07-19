"use client";

import { useState } from "react";
import { useLanguageStore } from "@/lib/store";
import { testimonials, chatTestimonials, gridTestimonials, faqs } from "@/data/landing-page-data";

export default function ReviewsPage() {
  const { lang } = useLanguageStore();
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const visibleGrid = showAllGrid ? gridTestimonials : gridTestimonials.slice(0, 16);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
        {/* Hero Header */}
        <div className="text-center mb-2">
          <div className="badge mx-auto mb-3 bg-info/10 text-info border-info/20">💬 {lang === "bn" ? "শিক্ষার্থীদের মতামত" : "Student Testimonials"}</div>
          <h1 className="text-2xl md:text-3xl font-black text-text">
            {lang === "bn"
              ? "আগে সন্দেহ ছিল, আজ মাসে ২৫,০০০-৫০,০০০+ টাকা আয় করছেন!"
              : "They Had Doubts — Now Earn 25,000-50,000+ BDT Monthly!"}
          </h1>
          <p className="text-text-secondary font-semibold mt-2 max-w-2xl mx-auto">
            {lang === "bn"
              ? `${testimonials.length + chatTestimonials.length + gridTestimonials.length} জন শিক্ষার্থীর সাফল্যের গল্প — যারা ৯৯ টাকা দিয়ে শুরু করে আজ নিজের পায়ে দাঁড়িয়েছেন`
              : `${testimonials.length + chatTestimonials.length + gridTestimonials.length} success stories — students who started with just ৳99 and now stand on their own feet`}
          </p>
        </div>

        {/* Slider Section */}
        <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
          <div className="section-header mb-5">
            <div className="badge mx-auto mb-3">🎠 {lang === "bn" ? "বিশেষ মতামত" : "Featured Reviews"}</div>
            <h3 className="text-lg md:text-xl font-black text-text">
              {lang === "bn" ? "শীর্ষ ৩টি সাফল্যের গল্প" : "Top 3 Success Stories"}
            </h3>
          </div>
          <div className="overflow-hidden relative">
            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${sliderIdx * 100}%)` }}>
              {testimonials.map((t, i) => (
                <div key={i} className="min-w-full px-2 box-border">
                  <div className="p-6 md:p-7 rounded-xl bg-gradient-to-br from-info/5 to-orange-400/5 border border-info/20 text-center">
                    <div className="text-info text-xl mb-2.5">{t.stars} <span className="text-text-secondary text-sm font-bold">{t.rating}</span></div>
                    <p className="text-sm text-text leading-relaxed mb-3.5 italic">&ldquo;{lang === "bn" ? t.quoteBn : t.quoteEn}&rdquo;</p>
                    <div className="font-bold text-sm text-info">{lang === "bn" ? t.authorBn : t.authorEn}</div>
                    <div className="text-xs text-text-secondary font-semibold">{lang === "bn" ? t.labelBn : t.labelEn}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-3.5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setSliderIdx(i)} className={`w-2.5 h-2.5 rounded-full border-none p-0 cursor-pointer transition-all ${i === sliderIdx ? "bg-info scale-125" : "bg-border"}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Chat-style testimonials */}
        <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
          <div className="section-header mb-5">
            <div className="badge mx-auto mb-3">💬 {lang === "bn" ? "চ্যাট মতামত" : "Chat Reviews"}</div>
            <h3 className="text-lg md:text-xl font-black text-text">
              {lang === "bn" ? "রিয়েল শিক্ষার্থীদের বার্তা" : "Real Student Messages"}
            </h3>
          </div>
          <div className="space-y-4">
            {chatTestimonials.map((t, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl p-4 md:p-5 flex gap-3.5 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-info to-orange-400" />
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-info to-orange-400 flex items-center justify-center text-lg shrink-0 mt-0.5">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-bold text-sm text-text">
                      {lang === "bn" ? t.nameBn : t.nameEn}
                    </span>
                    <span className="text-[10px] font-semibold text-text-secondary whitespace-nowrap">
                      {lang === "bn" ? t.platformBn : t.platformEn}
                    </span>
                  </div>
                  <div className="text-[#f59e0b] text-xs mt-0.5">{t.stars}</div>
                  <p className="text-sm text-text leading-relaxed mt-1.5">
                    &ldquo;{lang === "bn" ? t.msgBn : t.msgEn}&rdquo;
                  </p>
                  <span className="text-[10px] font-semibold text-text-secondary mt-1.5 block">
                    {lang === "bn" ? t.timeBn : t.timeEn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid testimonials */}
        <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
          <div className="section-header mb-5">
            <div className="badge mx-auto mb-3">📋 {lang === "bn" ? "সকল মতামত" : "All Reviews"}</div>
            <h3 className="text-lg md:text-xl font-black text-text">
              {lang === "bn" ? `${gridTestimonials.length} জন সফল শিক্ষার্থী` : `${gridTestimonials.length} Successful Students`}
            </h3>
            <p className="text-sm font-semibold text-text-secondary mt-1">
              {lang === "bn"
                ? "যারা ৯৯ টাকায় কোর্স করে আজ নিজেদের জীবন বদলে ফেলেছেন"
                : "Students who changed their lives starting with just ৳99 courses"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleGrid.map((t, i) => (
              <div key={i} className="bg-bg border border-border rounded-xl p-4 hover:border-info/30 transition-all">
                <div className="text-[#f59e0b] text-xs">{t.stars}</div>
                <span className="text-text-secondary text-xs font-bold ml-1">{t.rating}</span>
                <div className="font-bold text-sm text-text mt-1.5">
                  {lang === "bn" ? t.nameBn : t.nameEn}
                </div>
                <p className="text-sm text-text leading-relaxed mt-1.5">
                  &ldquo;{lang === "bn" ? t.textBn : t.textEn}&rdquo;
                </p>
              </div>
            ))}
          </div>
          {!showAllGrid && gridTestimonials.length > 16 && (
            <div className="text-center mt-5">
              <button
                onClick={() => setShowAllGrid(true)}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-info text-white text-sm font-bold border-none cursor-pointer hover:bg-info/90 transition-colors shadow-lg shadow-info/30"
              >
                {lang === "bn" ? "আরো মতামত দেখুন" : "Show More Reviews"}
              </button>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
          <div className="section-header mb-5">
            <div className="badge mx-auto mb-3">🤔 {lang === "bn" ? "আপনার মনে কি প্রশ্ন আছে?" : "Have Questions?"}</div>
            <h3 className="text-lg md:text-xl font-black text-text">
              {lang === "bn" ? "সচরাচর জিজ্ঞাসা" : "Frequently Asked Questions"}
            </h3>
            <p className="text-sm font-semibold text-text-secondary mt-1">
              {lang === "bn" ? "আপনার মনে প্রশ্ন আসা স্বাভাবিক। নিচের উত্তরগুলো দেখে নিন।" : "Questions are natural. Check the answers below."}
            </p>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq, i) => (
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
      </div>
    </div>
  );
}
