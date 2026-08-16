"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguageStore } from "@/lib/store";
import { useSiteContent } from "@/lib/use-site-content";
import { courseCategories } from "@/data/home/courses";
import { platforms } from "@/data/home/platforms";
import { trainers } from "@/data/home/trainers";

const coursePreviewDefaults = {
  courseCategories,
  trainers,
  platforms,
  platformTitleBn: "যেসব প্ল্যাটফর্মের কোর্স আপনি পাচ্ছেন",
  platformTitleEn: "Platforms Whose Courses You Get",
  platformSubtitleBn: "মোট {n}টি প্রতিষ্ঠানের কোর্স — সব একসাথে",
  platformSubtitleEn: "Courses from {n} platforms — all in one place",
};
type CoursePreviewContent = typeof coursePreviewDefaults;

export default function MenuPreviewSection() {
  const { lang } = useLanguageStore();
  const { content, enabled } = useSiteContent<CoursePreviewContent>("course_preview", coursePreviewDefaults);
  const [activeTab, setActiveTab] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  if (!enabled) return null;
  const categories = content.courseCategories;
  const trainersList = content.trainers;
  const platformsList = content.platforms;

  const tabs = [
    { id: "categories", bn: "কোর্স ক্যাটাগরি", en: "Categories", icon: "📚" },
    { id: "trainers", bn: "প্রশিক্ষক", en: "Trainers", icon: "👨‍🏫" },
    { id: "platforms", bn: "প্ল্যাটফর্ম", en: "Platforms", icon: "🏛️" },
  ];

  return (
    <div ref={sectionRef} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(i); setShowAll(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === i
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-white text-text-secondary border border-border/80 hover:border-primary/30 hover:text-primary"
            }`}
          >
            <span>{tab.icon}</span>
            {lang === "bn" ? tab.bn : tab.en}
          </button>
        ))}
      </div>

      {/* Categories */}
      {activeTab === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.slice(1).map((cat) => (
            <Link
              key={cat.id}
              href="/courses"
              className="group flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-white border border-border/60 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-bold text-text leading-tight group-hover:text-primary transition-colors">
                {lang === "bn" ? cat.titleBn : cat.titleEn}
              </span>
              <span className="text-[10px] font-semibold text-accent">
                {cat.courses.length}+ {lang === "bn" ? "কোর্স" : "courses"}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Trainers */}
      {activeTab === 1 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trainersList.slice(0, showAll ? trainersList.length : 8).map((t, i) => (
              <div key={i} className="group flex flex-col items-center text-center gap-3 p-4 rounded-2xl bg-white border border-border/60 hover:border-accent/30 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent p-0.5">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl overflow-hidden">
                    {t.image ? (
                      <Image src={t.image} alt={t.name} width={64} height={64} className="object-cover w-full h-full" loading="lazy" />
                    ) : (
                      <span>{t.name.charAt(0)}</span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text group-hover:text-primary transition-colors">{lang === "bn" ? t.nameBn : t.name}</h4>
                  <p className="text-[10px] font-semibold text-text-secondary mt-0.5">{lang === "bn" ? t.specialtyBn : t.specialtyEn}</p>
                  <p className="text-[10px] font-medium text-accent mt-0.5">{lang === "bn" ? t.credentialBn : t.credentialEn}</p>
                </div>
              </div>
            ))}
          </div>
          {trainersList.length > 8 && (
            <div className="text-center mt-4">
              <button onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-accent bg-accent/10 hover:bg-accent/20 transition-all">
                {showAll
                  ? (lang === "bn" ? "সংক্ষিপ্ত দেখুন" : "Show Less")
                  : (lang === "bn" ? `সবগুলো দেখুন (${trainersList.length})` : `Show All (${trainersList.length})`)}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Platforms */}
      {activeTab === 2 && (
        <div>
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-primary">{lang === "bn" ? content.platformTitleBn : content.platformTitleEn}</h3>
            <p className="text-sm text-text-secondary">{(lang === "bn" ? content.platformSubtitleBn : content.platformSubtitleEn).replace("{n}", String(platformsList.length))}</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {platformsList.slice(0, showAll ? platformsList.length : 9).map((p, i) => (
              <div key={i} className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-border/60 hover:border-accent/30 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center overflow-hidden">
                  {p.logo ? (
                    <Image src={p.logo} alt={p.name} width={48} height={48} className="object-contain w-full h-full" loading="lazy" />
                  ) : (
                    <span className="text-lg">{p.name.charAt(0)}</span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-text text-center group-hover:text-primary transition-colors leading-tight">
                  {lang === "bn" ? p.nameBn : p.name}
                </span>
              </div>
            ))}
          </div>
          {platformsList.length > 9 && (
            <div className="text-center mt-4">
              <button onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-accent bg-accent/10 hover:bg-accent/20 transition-all">
                {showAll
                  ? (lang === "bn" ? "সংক্ষিপ্ত দেখুন" : "Show Less")
                  : (lang === "bn" ? `সবগুলো দেখুন (${platformsList.length})` : `Show All (${platformsList.length})`)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
