"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { useSiteContent } from "@/lib/use-site-content";
import { testimonials, chatTestimonials, gridTestimonials, phpSliderTestimonials } from "@/data/home/testimonials";

type TabType = "carousel" | "chat" | "grid";

const testimonialsDefaults = { testimonials, chatTestimonials, gridTestimonials, phpSliderTestimonials };
type TestimonialsContent = typeof testimonialsDefaults;

export default function Testimonials({ compact }: { compact?: boolean }) {
  const { lang } = useLanguageStore();
  const { content, enabled } = useSiteContent<TestimonialsContent>("testimonials", testimonialsDefaults, { enabledByDefault: false });
  const [slideIdx, setSlideIdx] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showAllGrid, setShowAllGrid] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("carousel");
  const allCarouselTestimonials = [...content.testimonials, ...content.phpSliderTestimonials];
  const displayCarousel = compact ? allCarouselTestimonials.slice(0, 4) : allCarouselTestimonials;

  useEffect(() => {
    if (!enabled) return;
    if (compact) return;
    if (activeTab !== "carousel") return;
    intervalRef.current = setInterval(() => setSlideIdx((p) => (p + 1) % displayCarousel.length), 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [activeTab, displayCarousel.length, compact, enabled]);

  if (!enabled) return null;

  const goTo = (n: number) => {
    setSlideIdx(n);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setSlideIdx((p) => (p + 1) % displayCarousel.length), 4000);
  };

  const goNext = () => goTo((slideIdx + 1) % displayCarousel.length);
  const goPrev = () => goTo((slideIdx - 1 + displayCarousel.length) % displayCarousel.length);

  const tabs: { key: TabType; icon: string; bn: string; en: string }[] = [
    { key: "carousel", icon: "⭐", bn: "প্রত্যয়ন", en: "Testimonials" },
    { key: "chat", icon: "💬", bn: "রিয়েল চ্যাট", en: "Real Chats" },
    { key: "grid", icon: "📋", bn: "সকল", en: "All Reviews" },
  ];

  return (
    <div className="rounded-3xl p-6 md:p-8 bg-white border border-border/80 shadow-sm">
      <div className="section-header">
        <div className="badge mx-auto mb-3">💬 {lang === "bn" ? "শিক্ষার্থীদের মতামত" : "Student Testimonials"}</div>
        <h3 className="text-xl md:text-2xl font-black text-primary">
          {lang === "bn" ? "যারা ইতিমধ্যেই সফল হয়েছেন" : "Those Who Have Already Succeeded"}
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-md"
                : "bg-primary/5 text-text-secondary hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <span>{tab.icon}</span> {lang === "bn" ? tab.bn : tab.en}
          </button>
        ))}
      </div>

      {/* Carousel Tab */}
      {activeTab === "carousel" && (
        <div>
          {displayCarousel.length > 0 && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border border-primary/10">
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-1 min-w-0">
                    <div className="text-2xl mb-2 text-secondary">{displayCarousel[slideIdx].stars}</div>
                    <p className="text-sm md:text-base text-text leading-relaxed font-medium">
                      &ldquo;{lang === "bn" ? displayCarousel[slideIdx].quoteBn : displayCarousel[slideIdx].quoteEn}&rdquo;
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white">
                        {(lang === "bn" ? displayCarousel[slideIdx].authorBn : displayCarousel[slideIdx].authorEn).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text">{lang === "bn" ? displayCarousel[slideIdx].authorBn : displayCarousel[slideIdx].authorEn}</p>
                        <p className="text-xs text-text-secondary">{lang === "bn" ? displayCarousel[slideIdx].labelBn : displayCarousel[slideIdx].labelEn}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-center justify-center px-6 py-4 rounded-xl bg-white/50 border border-border/50">
                    <span className="text-2xl font-black text-primary">{displayCarousel[slideIdx].rating}</span>
                    <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">{lang === "bn" ? "রেটিং" : "Rating"}</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-6 pb-6">
                <div className="flex gap-1.5">
                  {displayCarousel.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === slideIdx ? "w-6 bg-primary" : "bg-primary/20 hover:bg-primary/40"
                      }`} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={goPrev} className="w-8 h-8 rounded-xl bg-white border border-border/80 flex items-center justify-center text-sm hover:bg-primary/5 hover:border-primary/30 transition-all">←</button>
                  <button onClick={goNext} className="w-8 h-8 rounded-xl bg-white border border-border/80 flex items-center justify-center text-sm hover:bg-primary/5 hover:border-primary/30 transition-all">→</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="space-y-4">
          {content.chatTestimonials.slice(0, compact ? 3 : 6).map((c, i) => (
            <div key={i} className="p-4 rounded-2xl bg-gradient-to-r from-primary/[0.02] to-accent/[0.02] border border-border/60 hover:border-accent/20 transition-all">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{c.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-text">{lang === "bn" ? c.nameBn : c.nameEn}</span>
                    <span className="text-[10px] text-text-secondary">{lang === "bn" ? c.platformBn : c.platformEn}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">{lang === "bn" ? c.msgBn : c.msgEn}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-secondary">{c.stars}</span>
                    <span className="text-[10px] text-text-secondary">{lang === "bn" ? c.timeBn : c.timeEn}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grid Tab */}
      {activeTab === "grid" && (
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(showAllGrid ? content.gridTestimonials : content.gridTestimonials.slice(0, compact ? 4 : 6)).map((t, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white border border-border/60 hover:border-accent/20 hover:shadow-md transition-all">
                <div className="flex items-center gap-1.5 mb-2 text-xs text-secondary">{t.stars} <span className="text-text-secondary">({t.rating})</span></div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  &ldquo;{lang === "bn" ? t.textBn : t.textEn}&rdquo;
                </p>
                <p className="text-xs font-bold text-text mt-2">{lang === "bn" ? t.nameBn : t.nameEn}</p>
              </div>
            ))}
          </div>
          {content.gridTestimonials.length > 6 && (
            <div className="text-center mt-4">
              <button onClick={() => setShowAllGrid(!showAllGrid)}
                className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 transition-all">
                {showAllGrid
                  ? (lang === "bn" ? "সংক্ষিপ্ত দেখুন" : "Show Less")
                  : (lang === "bn" ? `সবগুলো দেখুন (${gridTestimonials.length})` : `Show All (${gridTestimonials.length})`)}
              </button>
            </div>
          )}
        </div>
      )}

      {compact && (
        <div className="text-center mt-4">
          <Link href="/reviews"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 transition-all">
            {lang === "bn" ? "সব মতামত দেখুন" : "View All Reviews"} →
          </Link>
        </div>
      )}
    </div>
  );
}
