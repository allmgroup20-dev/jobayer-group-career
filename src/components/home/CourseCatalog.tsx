"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguageStore } from "@/lib/store";
import { courseCategories, trainers, bundlePricingData, tab0OverviewItems } from "@/data/landing-page-data";

export default function CourseCatalog() {
  const { lang } = useLanguageStore();
  const [activeTab, setActiveTab] = useState(courseCategories[0]?.id || "");

  const activeCategory = courseCategories.find((c) => c.id === activeTab);

  return (
    <div className="rounded-2xl p-5 md:p-6 bg-gradient-to-br from-primary/5 to-primary/5 border border-primary/20">
      <div className="section-header">
        <div className="badge mx-auto mb-3">
          📚 {lang === "bn" ? "৯৯ টাকায় আপনি কী পাচ্ছেন" : "What You Get at ৳99"}
        </div>
        <h3 className="text-lg md:text-xl font-black text-text">
          {lang === "bn"
            ? "১০টি বিভাগ — ২৩০+ প্রিমিয়াম কোর্স"
            : "10 Categories — 230+ Premium Courses"}
        </h3>
        <p className="text-sm font-semibold text-text-secondary mt-1">
          {lang === "bn"
            ? "প্রতিটি ট্যাবে ক্লিক করে সব ক্যাটাগরির কোর্সের সম্পূর্ণ তালিকা দেখুন"
            : "Click on each tab to explore the full list of courses in every category"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-6 mb-6">
        {courseCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === cat.id ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white border border-border text-text-secondary hover:border-primary/30 hover:text-text"}`}
          >
            {cat.icon} {lang === "bn" ? cat.titleBn : cat.titleEn}
          </button>
        ))}
      </div>

      {activeCategory && (
        <div className="rounded-xl bg-white border border-border p-5 md:p-6 space-y-4">
          <h4 className="font-black text-lg text-text">
            {activeCategory.icon} {lang === "bn" ? activeCategory.titleBn : activeCategory.titleEn}
          </h4>

          {activeCategory.descriptionBn && activeCategory.id === "knowledge-skills" ? (
            <p className="text-xs font-semibold text-text-secondary -mt-2">
              {lang === "bn" ? activeCategory.descriptionBn : activeCategory.descriptionEn}
            </p>
          ) : activeCategory.id !== "knowledge-skills" ? (
            <>
              {activeCategory.descriptionBn && (
                <p className="text-xs font-semibold text-text-secondary -mt-2">
                  {lang === "bn" ? activeCategory.descriptionBn : activeCategory.descriptionEn}
                </p>
              )}
              <p className="text-xs font-semibold text-text-secondary -mt-2">
                {activeCategory.courses.length} {lang === "bn" ? "টি কোর্স" : "Courses"}
              </p>
            </>
          ) : null}

          {/* Tab 0: জ্ঞান — Overview items */}
          {activeCategory.id === "knowledge-skills" && (
            <div className="grid gap-3 sm:grid-cols-2 mt-4">
              {tab0OverviewItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/[0.03] to-transparent border border-border">
                  <span className="text-lg shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <span className="font-bold text-sm text-text leading-tight block">
                      {lang === "bn" ? item.titleBn : item.titleEn}
                    </span>
                    <span className="text-xs text-text-secondary font-semibold mt-1 block">
                      {lang === "bn" ? item.descBn : item.descEn}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All other tabs: course list */}
          {activeCategory.id !== "knowledge-skills" && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {activeCategory.courses.map((course, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5 p-4 rounded-xl bg-gradient-to-r from-primary/[0.03] to-transparent border border-border">
                    <div className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary font-black text-xs shrink-0 mt-0.5">{idx + 1}</span>
                      <span className="font-semibold text-sm text-text leading-tight">{lang === "bn" ? course.nameBn : course.nameEn}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-8">
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-orange text-white text-[10px] font-extrabold">৳৯৯</span>
                    </div>
                  </div>
                ))}
              </div>

              {activeCategory.trainers.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-xs font-bold text-text-secondary mr-1">👨‍🏫</span>
                  {activeCategory.trainers.map((tName) => {
                    const trainer = trainers.find((t) => t.name === tName);
                    return trainer ? (
                      <span key={tName} className="px-3 py-1 rounded-lg bg-white border border-border text-xs font-bold text-text">
                        {lang === "bn" ? trainer.nameBn : trainer.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bundle Pricing Row */}
      <div className="mt-5 p-5 rounded-xl bg-gradient-to-br from-primary/10 to-orange/5 border-2 border-primary/20 text-center">
        <div className="text-sm font-bold text-text-secondary">
          {lang === "bn" ? "মোট বান্ডেল মূল্য:" : "Total Bundle Value:"}
        </div>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="text-lg font-bold text-text-secondary line-through">
            {lang === "bn" ? bundlePricingData.totalValueBn : bundlePricingData.totalValueEn}
          </span>
          <span className="text-3xl font-black text-warning">
            {lang === "bn" ? bundlePricingData.offerPriceBn : bundlePricingData.offerPriceEn}
          </span>
        </div>
        <div className="mt-2 text-sm font-bold text-warning">
          🎉 {lang === "bn" ? bundlePricingData.savingsTextBn : bundlePricingData.savingsTextEn}
        </div>
      </div>

      <div className="text-center mt-5">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange to-orange-dark text-white font-black text-sm no-underline shadow-lg shadow-orange/30 hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          📚 {lang === "bn" ? "সম্পূর্ণ ক্যাটালগ দেখুন →" : "View Full Catalog →"}
        </Link>
      </div>
    </div>
  );
}

