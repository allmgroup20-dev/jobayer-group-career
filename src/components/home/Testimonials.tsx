"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { testimonials, chatTestimonials, gridTestimonials, phpSliderTestimonials } from "@/data/landing-page-data";

type TabType = "carousel" | "chat" | "grid";

export default function Testimonials() {
  const { lang } = useLanguageStore();
  const [slideIdx, setSlideIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("carousel");

  const allCarouselTestimonials = [...testimonials, ...phpSliderTestimonials];

  useEffect(() => {
    if (activeTab !== "carousel") return;
    intervalRef.current = setInterval(() => setSlideIdx((p) => (p + 1) % allCarouselTestimonials.length), 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTab, allCarouselTestimonials.length]);

  const goTo = (n: number) => {
    setSlideIdx(n);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setSlideIdx((p) => (p + 1) % allCarouselTestimonials.length), 4000);
  };

  const visibleGrid = showAllGrid ? gridTestimonials : gridTestimonials.slice(0, 4);

  const tabs: { id: TabType; labelBn: string; labelEn: string }[] = [
    { id: "carousel", labelBn: "ক্যারোজেল", labelEn: "Carousel" },
    { id: "chat", labelBn: "চ্যাট", labelEn: "Chat" },
    { id: "grid", labelBn: "গ্রিড", labelEn: "Grid" },
  ];

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-white border border-border">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 justify-center mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSlideIdx(0); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-info text-white shadow-lg shadow-info/30"
                : "bg-white border border-border text-text-secondary hover:border-info/30"
            }`}
          >
            {lang === "bn" ? tab.labelBn : tab.labelEn}
          </button>
        ))}
      </div>

      <div className="section-header">
        <div className="badge mx-auto mb-3 border-info/20 bg-info/10 text-info">
          💬 {lang === "bn" ? "শিক্ষার্থীদের মতামত" : "Student Testimonials"}
        </div>
        <h3 className="text-lg md:text-xl font-black text-text">
          {lang === "bn" ? "যারা ইতিমধ্যেই সফল হয়েছেন" : "Those Who Have Already Succeeded"}
        </h3>
        <p className="text-sm font-semibold text-text-secondary mt-1">
          {allCarouselTestimonials.length + chatTestimonials.length + gridTestimonials.length}{" "}
          {lang === "bn" ? "জন শিক্ষার্থীর সাফল্যের গল্প" : "success stories of our students"}
        </p>
      </div>

      {/* Carousel */}
      {activeTab === "carousel" && (
        <div className="overflow-hidden relative">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${slideIdx * 100}%)` }}>
            {allCarouselTestimonials.map((t, i) => (
              <div key={i} className="min-w-full px-2 box-border">
                <div className="p-6 md:p-7 rounded-xl bg-bg border border-border text-center">
                  <div className="text-info text-xl mb-2.5">{t.stars} <span className="text-text-secondary text-sm font-bold">{t.rating}</span></div>
                  <p className="text-sm text-text leading-relaxed mb-3.5 italic">&ldquo;{lang === "bn" ? t.quoteBn : t.quoteEn}&rdquo;</p>
                  <div className="font-bold text-sm text-info">{lang === "bn" ? t.authorBn : t.authorEn}</div>
                  <div className="text-xs text-text-secondary font-semibold">{lang === "bn" ? t.labelBn : t.labelEn}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-3.5">
            {allCarouselTestimonials.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} className={`w-2.5 h-2.5 rounded-full border-none p-0 cursor-pointer transition-all ${i === slideIdx ? "bg-info scale-125" : "bg-border"}`} />
            ))}
          </div>
        </div>
      )}

      {/* Chat-style testimonials */}
      {activeTab === "chat" && (
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
      )}

      {/* Grid testimonials */}
      {activeTab === "grid" && (
        <div className="mt-4">
          <h4 className="text-base md:text-lg font-bold text-text mb-4 text-center">
            {lang === "bn" ? "আরও সফল শিক্ষার্থীদের মতামত" : "More Success Stories"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleGrid.map((t, i) => (
              <div key={i} className="bg-white border border-border rounded-xl p-4">
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
          {!showAllGrid && gridTestimonials.length > 4 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAllGrid(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-info text-white text-sm font-bold border-none cursor-pointer hover:bg-info/90 transition-colors"
              >
                {lang === "bn" ? "আরো মতামত দেখুন" : "Show More Testimonials"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="text-center mt-5 pt-4 border-t border-border">
        <Link href="/reviews" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-info text-white text-sm font-bold hover:bg-info/90 transition-colors shadow-lg shadow-info/30">
          {lang === "bn" ? "সব মতামত দেখুন →" : "View All Reviews →"}
        </Link>
      </div>
    </div>
  );
}
